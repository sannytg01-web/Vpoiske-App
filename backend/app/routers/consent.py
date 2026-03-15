import uuid
import structlog
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import Consent, AuditLog, User
from app.core.deps import get_current_user

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/consent", tags=["consent"])

VALID_CONSENT_TYPES = {"pdp", "psychological", "analytics", "marketing"}

async def _audit(db: AsyncSession, user_id: uuid.UUID, action: str, meta: dict | None = None) -> None:
    entry = AuditLog(user_id=user_id, action=action, meta=meta)
    db.add(entry)

@router.post("/{consent_type}")
async def grant_consent(
    consent_type: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if consent_type not in VALID_CONSENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid consent type")
        
    stmt = select(Consent).where(
        Consent.user_id == user.id,
        Consent.consent_type == consent_type,
        Consent.revoked_at == None
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    
    if existing:
        return {"status": "already_granted"}
        
    consent = Consent(
        user_id=user.id,
        consent_type=consent_type,
        granted=True,
        policy_version="1.0",
        granted_at=datetime.now(timezone.utc)
    )
    db.add(consent)
    await _audit(db, user.id, f"consent_granted", {"type": consent_type})
    await db.commit()
    
    return {"status": "success", "type": consent_type}


@router.post("/{consent_type}/revoke")
async def revoke_consent(
    consent_type: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if consent_type not in VALID_CONSENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid consent type")
        
    stmt = select(Consent).where(
        Consent.user_id == user.id,
        Consent.consent_type == consent_type,
        Consent.revoked_at == None
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    
    if not existing:
        return {"status": "not_active"}
        
    existing.granted = False
    existing.revoked_at = datetime.now(timezone.utc)
    
    await _audit(db, user.id, "consent_revoked", {"type": consent_type})
    await db.commit()
    
    return {"status": "success", "type": consent_type, "revoked": True}

@router.get("/status")
async def list_consents(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Consent).where(
        Consent.user_id == user.id,
        Consent.revoked_at == None
    )
    result = await db.execute(stmt)
    consents = result.scalars().all()
    
    status_map = {c: False for c in VALID_CONSENT_TYPES}
    for c in consents:
        if c.granted:
            status_map[c.consent_type] = True
            
    return status_map
