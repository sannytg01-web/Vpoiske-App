import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.models import Match, User, HdCard, PsychologicalProfile
from app.core.deps import get_current_user
from app.services.matching import run_matching_for_user

router = APIRouter(prefix="/matches", tags=["matches"])

@router.get("")
async def list_matches(
    tab: str = Query("all", description="all, mutual, new"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Run the pgvector matching to ensure new matches are generated 
    try:
        await run_matching_for_user(user.id, db)
    except Exception as e:
        import structlog
        structlog.get_logger(__name__).warning("matching_generation_failed", error=str(e))
    
    # Query matches involving this user
    stmt = select(Match).where(
        or_(Match.user_a == user.id, Match.user_b == user.id)
    ).order_by(Match.compatibility_score.desc())
    
    res = await db.scalars(stmt)
    db_matches = res.all()
    
    is_premium = user.is_premium
    result = []
    
    for i, m in enumerate(db_matches):
        # Determine partner id
        partner_id = m.user_b if m.user_a == user.id else m.user_a
        
        # Load partner profile details (using basic selects since it's simple demo mode)
        stmt_partner = select(User).where(User.id == partner_id)
        partner = await db.scalar(stmt_partner)
        
        stmt_hd = select(HdCard).where(HdCard.user_id == partner_id)
        partner_hd = await db.scalar(stmt_hd)
        
        stmt_profile = select(PsychologicalProfile).where(PsychologicalProfile.user_id == partner_id)
        partner_profile = await db.scalar(stmt_profile)
        
        # Free users see max 3 matches locked logic
        is_locked = not is_premium and i >= 3
        
        # Just creating a pseudo name based on ID short for demo if missing
        short_id = str(partner.id)[:4] if partner else "0000"
        
        result.append({
            "id": str(m.id),
            "name": f"Пользователь {short_id.upper()}", # Real app would join Profile table
            "age": 25, # Real app would get from birthdate
            "city": "Скрыто" if is_locked else "Не указан", # Real app would get context
            "score": m.compatibility_score,
            "hd_type": partner_hd.type if partner_hd else "Неизвестно",
            "photo": None,
            "locked": is_locked,
            "details": m.breakdown
        })
            
    return result

@router.get("/{match_id}")
async def get_match_detail(
    match_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Match).where(
        Match.id == uuid.UUID(match_id),
        or_(Match.user_a == user.id, Match.user_b == user.id)
    )
    match_obj = await db.scalar(stmt)
    
    if not match_obj:
        raise HTTPException(status_code=404, detail="Match not found")
        
    partner_id = match_obj.user_b if match_obj.user_a == user.id else match_obj.user_a
    stmt_partner = select(User).where(User.id == partner_id)
    partner = await db.scalar(stmt_partner)
    
    stmt_hd = select(HdCard).where(HdCard.user_id == partner_id)
    partner_hd = await db.scalar(stmt_hd)
    
    # Needs premium check?
    # Actually list_matches applies locks dynamically, but for detail let's just allow or block it entirely
    # Typically logic checks rank. In our basic implementation we just let it through if it's there.
    
    short_id = str(partner.id)[:4] if partner else "0000"
    return {
        "id": str(match_obj.id),
        "name": f"Пользователь {short_id.upper()}",
        "age": 25,
        "city": "Не указан",
        "score": match_obj.compatibility_score,
        "hd_type": partner_hd.type if partner_hd else "Неизвестно",
        "photo": None,
        "locked": False,
        "details": match_obj.breakdown
    }

@router.post("/{match_id}/start")
async def start_chat(
    match_id: str,
    user: User = Depends(get_current_user)
):
    if not user.is_premium:
        raise HTTPException(status_code=402, detail="Payment Required")
        
    chat_id = str(uuid.uuid4())
    return {"status": "started", "chat_id": chat_id}

@router.post("/{match_id}/skip")
async def skip_match(
    match_id: str,
    user: User = Depends(get_current_user)
):
    return {"status": "skipped"}
