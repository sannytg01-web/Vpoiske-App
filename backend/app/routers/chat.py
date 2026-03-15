from datetime import datetime, timedelta
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from app.core.ws_manager import manager
from app.services.notifications import send_push
from app.core.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/chat", tags=["chat"])

# Mock DB for Chat History (in memory list of dicts for now)
# Schema: {"id": str, "match_id": str, "sender_id": int, "content": str, "created_at": datetime, "read_at": datetime}
DB_MESSAGES = []

@router.get("/{match_id}/messages")
async def get_messages(
    match_id: str,
    before: str = None,
    limit: int = 50,
    user: User = Depends(get_current_user)
):
    """
    Get paginated chat history for a match.
    In real app: Queries DB, decrypts messages (`content_encrypted`), limits by cursor
    """
    history = [m for m in DB_MESSAGES if m["match_id"] == match_id]
    
    # Sort old to new (as they happened)
    history.sort(key=lambda x: x["created_at"])
    
    # Very simple cursor pagination simulation based on slicing
    if before:
        try:
             idx = next(i for i, v in enumerate(history) if v["id"] == before)
             history = history[:idx]
        except StopIteration:
             pass
             
    # Return last `limit` amount of items
    result = history[-limit:]
    
    # Formatting for JSON serialization
    return [{
        "id": m["id"],
        "sender_id": m["sender_id"],
        "content": m["content"], # Decrypted content here
        "created_at": m["created_at"].isoformat(),
        "read_at": m["read_at"].isoformat() if m["read_at"] else None
    } for m in result]

@router.websocket("/ws/{match_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    match_id: str, 
    token: str = Query(...)
):
    # Dummy authentication logic for WS based on ?token query parameter
    # Normally we decode JWT from `token` parameter and find current user ID
    if not token:
        await websocket.close(code=1008)
        return
        
    # Assume authenticated user_id = 1 for the scope of the prototype
    user_id = 1 
    
    await manager.connect(websocket, match_id, user_id)
    
    # Send welcome connected packet
    await websocket.send_json({"type": "connected", "match_id": match_id})
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "message":
                content = data.get("content")
                if not content:
                    continue
                    
                # 1. Encrypt message (stub)
                encrypted = f"ENC[{content}]" 
                
                # 2. Save to DB
                new_msg = {
                    "id": str(uuid.uuid4()),
                    "match_id": match_id,
                    "sender_id": user_id,
                    "content": content, # Unencrypted for local mock echo
                    "created_at": datetime.utcnow(),
                    "read_at": None
                }
                DB_MESSAGES.append(new_msg)
                
                # 3. Broadcast to all sockets listening to this match
                # Also include sender_id so frontend knows whose bubble is it
                broadcast_packet = {
                    "type": "message",
                    "id": new_msg["id"],
                    "sender_id": user_id,
                    "content": content,
                    "created_at": new_msg["created_at"].isoformat()
                }
                await manager.broadcast(match_id, broadcast_packet)
                
                # 4. Notify offline partner via Telegram
                # Normally look up partner's push_token or tg_id by cross checking DB Match table
                partner_tg_id = "12345678"
                await send_push(partner_tg_id, "Новое сообщение", "Вам написали в чат!")
                
            elif data.get("type") == "read":
                 # Update read_at for messages up to specific ID or just all past
                 for m in DB_MESSAGES:
                     if m["match_id"] == match_id and m["sender_id"] != user_id and not m["read_at"]:
                         m["read_at"] = datetime.utcnow()
                         
                 # Can optionally broadcast read receipt!
                 await manager.broadcast(match_id, {"type": "read_receipt"})
                 
    except WebSocketDisconnect:
        manager.disconnect(websocket, match_id)
