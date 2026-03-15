import uuid
from datetime import datetime, timezone
import structlog
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ws_manager import manager
from app.services.notifications import send_push
from app.core.deps import get_current_user
from app.core.security import decode_token
from app.database import get_db, async_session_factory
from app.models.models import User, Message, Match
from app.services.encryption import encrypt, decrypt

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/{match_id}/messages")
async def get_messages(
    match_id: str,
    before: str = None,
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated chat history for a match.
    Queries DB, decrypts messages (`content_encrypted`), limits by cursor.
    """
    try:
        match_uuid = uuid.UUID(match_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid match_id format")

    # Verify user is in this match
    stmt_match = select(Match).where(
        Match.id == match_uuid,
        or_(Match.user_a == user.id, Match.user_b == user.id)
    )
    res_match = await db.execute(stmt_match)
    match = res_match.scalar_one_or_none()
    
    if not match:
        raise HTTPException(status_code=403, detail="Not authorized for this match")

    stmt = select(Message).where(Message.match_id == match_uuid).order_by(Message.created_at.desc())
    
    if before:
        try:
            before_uuid = uuid.UUID(before)
            # Find the date of the 'before' message or use cursor pagination based on date
            stmt_before = select(Message.created_at).where(Message.id == before_uuid)
            before_date = await db.scalar(stmt_before)
            if before_date:
                stmt = stmt.where(Message.created_at < before_date)
        except ValueError:
            pass

    stmt = stmt.limit(limit)
    res_messages = await db.execute(stmt)
    messages = res_messages.scalars().all()
    
    # Sort reverse to get chronological
    messages = list(reversed(messages))

    return [{
        "id": str(m.id),
        "sender_id": str(m.sender_id),
        "content": decrypt(m.content_encrypted), 
        "created_at": m.created_at.isoformat() if m.created_at else None,
        "read_at": m.read_at.isoformat() if m.read_at else None
    } for m in messages]

@router.websocket("/ws/{match_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    match_id: str, 
    token: str = Query(...)
):
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    try:
        payload = decode_token(token)
        user_id_str = payload.get("sub")
        if not user_id_str:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        user_id = uuid.UUID(user_id_str)
        match_uuid = uuid.UUID(match_id)
    except Exception as e:
        logger.warning("ws_auth_failed", error=str(e))
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Check if user is in this match (using a short-lived session)
    async with async_session_factory() as db:
        stmt_match = select(Match).where(
            Match.id == match_uuid,
            or_(Match.user_a == user_id, Match.user_b == user_id)
        )
        match = await db.scalar(stmt_match)
        if not match:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        partner_id = match.user_b if match.user_a == user_id else match.user_a
        
        # Get partner user details for push notifications later
        stmt_partner = select(User).where(User.id == partner_id)
        partner = await db.scalar(stmt_partner)
        partner_tg_id = partner.telegram_id if partner else None

    await manager.connect(websocket, match_id, str(user_id))
    
    # Send welcome connected packet
    await websocket.send_json({"type": "connected", "match_id": match_id})
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "message":
                content = data.get("content")
                if not content:
                    continue
                    
                # 1. Encrypt message
                encrypted_content = encrypt(content)
                now = datetime.now(timezone.utc)
                new_msg_id = uuid.uuid4()
                
                # 2. Save to DB directly
                async with async_session_factory() as db:
                    new_msg = Message(
                        id=new_msg_id,
                        match_id=match_uuid,
                        sender_id=user_id,
                        content_encrypted=encrypted_content,
                        created_at=now,
                        read_at=None
                    )
                    db.add(new_msg)
                    await db.commit()
                
                # 3. Broadcast to all sockets listening to this match
                # Important: Include sender_id for UI logic
                broadcast_packet = {
                    "type": "message",
                    "id": str(new_msg_id),
                    "sender_id": str(user_id),
                    "content": content,
                    "created_at": now.isoformat()
                }
                await manager.broadcast(match_id, broadcast_packet)
                
                # 4. Notify offline partner via Telegram (mock or real push)
                if partner_tg_id:
                    await send_push(str(partner_tg_id), "Новое сообщение", "Вам написали в чат!")
                
            elif data.get("type") == "read":
                 # Update read_at for unread messages sent by the partner
                 async with async_session_factory() as db:
                     # Raw update could be faster, but ORM works
                     stmt_unread = select(Message).where(
                         Message.match_id == match_uuid,
                         Message.sender_id == partner_id,
                         Message.read_at.is_(None)
                     )
                     unread_msgs = await db.scalars(stmt_unread)
                     now = datetime.now(timezone.utc)
                     updated_something = False
                     for msg in unread_msgs:
                         msg.read_at = now
                         updated_something = True
                     
                     if updated_something:
                         await db.commit()
                         # Broadcast read receipt to partner
                         await manager.broadcast(match_id, {"type": "read_receipt"})
                 
    except WebSocketDisconnect:
        manager.disconnect(websocket, match_id)
    except Exception as e:
        logger.error("ws_error", error=str(e), exc_info=True)
        manager.disconnect(websocket, match_id)
