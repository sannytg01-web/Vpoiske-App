import uuid
import structlog
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import User, Profile
from app.core.deps import get_current_user

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileResponse(BaseModel):
    id: uuid.UUID
    name: Optional[str]
    birth_year: Optional[int]
    gender: Optional[str]
    city: Optional[str]
    bio: Optional[str]
    photo_url: Optional[str]
    is_visible: bool
    is_admin: bool

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    birth_year: Optional[int] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    is_visible: Optional[bool] = None

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the current user's profile. Creates a record if it doesn't exist."""
    stmt = select(Profile).where(Profile.user_id == user.id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    return {
        "id": profile.id,
        "name": profile.name,
        "birth_year": profile.birth_year,
        "gender": profile.gender,
        "city": profile.city,
        "bio": profile.bio,
        "photo_url": profile.photo_url,
        "is_visible": profile.is_visible,
        "is_admin": user.is_admin,
    }

@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    body: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the current user's profile."""
    stmt = select(Profile).where(Profile.user_id == user.id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
    
    # Update fields
    if body.name is not None:
        profile.name = body.name
    if body.birth_year is not None:
        profile.birth_year = body.birth_year
    if body.gender is not None:
        profile.gender = body.gender
    if body.city is not None:
        profile.city = body.city
    if body.bio is not None:
        profile.bio = body.bio
    if body.photo_url is not None:
        profile.photo_url = body.photo_url
    if body.is_visible is not None:
        profile.is_visible = body.is_visible

    await db.commit()
    await db.refresh(profile)

    logger.info("profile_updated", user_id=str(user.id))

    return {
        "id": profile.id,
        "name": profile.name,
        "birth_year": profile.birth_year,
        "gender": profile.gender,
        "city": profile.city,
        "bio": profile.bio,
        "photo_url": profile.photo_url,
        "is_visible": profile.is_visible,
    }
