import uuid
from typing import Any, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import User, HdCard
from app.core.deps import get_current_user
from app.services.hd_calculator import calculate_hd_card

router = APIRouter(prefix="/hd", tags=["human_design"])

class BirthDataRequest(BaseModel):
    birth_date: str
    birth_time: Optional[str]
    birth_time_accuracy: str
    birth_city: str
    birth_lat: float
    birth_lon: float
    birth_timezone: str

@router.post("/calculate")
async def calculate_and_save_hd(
    body: BirthDataRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    hd_res = calculate_hd_card(
        birth_date=body.birth_date,
        birth_time=body.birth_time,
        birth_time_accuracy=body.birth_time_accuracy,
        birth_city=body.birth_city,
        birth_lat=body.birth_lat,
        birth_lon=body.birth_lon,
        birth_timezone=body.birth_timezone
    )
    
    # Save to db
    hd_card = HdCard(
        user_id=user.id,
        hd_type=hd_res["type"],
        profile=hd_res["profile"],
        authority=hd_res["authority"],
        defined_centers=hd_res["defined_centers"],
        active_channels=hd_res["active_channels"],
        active_gates=hd_res["active_gates"]
    )
    db.add(hd_card)
    await db.commit()
    
    # Normally we would trigger Celery here:
    # find_matches_for_profile.delay(user.id)
    
    # Using `hd_res` but adding the generated UUID from the database:
    return hd_res
