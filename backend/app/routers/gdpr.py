from typing import Any
import uuid
import structlog
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import User, Profile, HdCard, PsychologicalProfile, Consent, Payment
from app.core.deps import get_current_user

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/gdpr", tags=["gdpr"])

@router.get("/export")
async def export_my_data(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Export all user data in JSON format."""
    # Fetch Profile
    stmt_profile = select(Profile).where(Profile.user_id == user.id)
    profile = (await db.execute(stmt_profile)).scalar_one_or_none()

    # Fetch HD Card
    stmt_hd = select(HdCard).where(HdCard.user_id == user.id)
    hd_card = (await db.execute(stmt_hd)).scalar_one_or_none()

    # Fetch Psychological Profile
    stmt_psy = select(PsychologicalProfile).where(PsychologicalProfile.user_id == user.id)
    psy = (await db.execute(stmt_psy)).scalar_one_or_none()

    # Fetch Consents
    stmt_consents = select(Consent).where(Consent.user_id == user.id)
    consents = (await db.execute(stmt_consents)).scalars().all()

    # Fetch Payments
    stmt_payments = select(Payment).where(Payment.user_id == user.id)
    payments = (await db.execute(stmt_payments)).scalars().all()

    logger.info("gdpr_data_export", user_id=str(user.id))

    return {
        "user": {
            "id": user.id,
            "created_at": user.created_at,
            "is_premium": user.is_premium,
            "premium_until": user.premium_until,
        },
        "profile": {
            "name": profile.name if profile else None,
            "bio": profile.bio if profile else None,
            "birth_year": profile.birth_year if profile else None,
            "city": profile.city if profile else None,
        } if profile else None,
        "human_design": {
            "type": hd_card.hd_type if hd_card else None,
            "profile": hd_card.profile_line if hd_card else None,
            "authority": hd_card.authority if hd_card else None,
        } if hd_card else None,
        "psychology": {
            "attachment_style": psy.attachment_style if psy else None,
            "conflict_style": psy.conflict_style if psy else None,
        } if psy else None,
        "consents": [
            {
                "type": c.consent_type,
                "granted": c.granted,
                "granted_at": c.granted_at,
            } for c in consents
        ],
        "payments": [
            {
                "amount": p.amount,
                "status": p.status,
                "created_at": p.created_at,
            } for p in payments
        ],
    }

@router.post("/delete")
async def delete_my_account(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Soft delete the user account."""
    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False
    
    # Hide profile
    stmt_profile = select(Profile).where(Profile.user_id == user.id)
    profile = (await db.execute(stmt_profile)).scalar_one_or_none()
    if profile:
        profile.is_visible = False

    await db.commit()

    logger.info("account_soft_deleted", user_id=str(user.id))

    return {"status": "success", "message": "Account marked for deletion."}
