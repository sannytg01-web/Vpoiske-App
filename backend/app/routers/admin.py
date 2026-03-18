import datetime
import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.database import get_db
from app.models.models import User, Profile, HdCard, PsychologicalProfile, Payment
from app.core.deps import get_current_user

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

class DashboardStats(BaseModel):
    new_users_today: int
    conversion_onboarding: float
    conversion_birth_data: float
    active_premium: int
    mrr_revenue: int

def check_admin(user: User):
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    check_admin(user)

    now = datetime.datetime.now(datetime.timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # 1. New users today
    stmt = select(func.count(User.id)).where(User.created_at >= start_of_day)
    new_users_today = (await db.execute(stmt)).scalar() or 0

    # 2. Total users
    total_users_stmt = select(func.count(User.id))
    total_users = (await db.execute(total_users_stmt)).scalar() or 1

    # Total completed interview
    interview_stmt = select(func.count(PsychologicalProfile.id))
    completed_interviews = (await db.execute(interview_stmt)).scalar() or 0

    # Total birth data
    birth_stmt = select(func.count(HdCard.id))
    completed_birth_data = (await db.execute(birth_stmt)).scalar() or 0

    conversion_onboarding = round((completed_interviews / total_users) * 100, 1) if total_users > 0 else 0
    conversion_birth_data = round((completed_birth_data / completed_interviews) * 100, 1) if completed_interviews > 0 else 0

    # 3. Active premium
    premium_stmt = select(func.count(User.id)).where(User.is_premium == True)
    active_premium = (await db.execute(premium_stmt)).scalar() or 0

    # 4. MRR
    mrr_stmt = select(func.sum(Payment.amount)).where(
        Payment.status == "success",
        Payment.created_at >= start_of_month
    )
    mrr_revenue = (await db.execute(mrr_stmt)).scalar() or 0

    return DashboardStats(
        new_users_today=new_users_today,
        conversion_onboarding=conversion_onboarding,
        conversion_birth_data=conversion_birth_data,
        active_premium=active_premium,
        mrr_revenue=mrr_revenue
    )

class UserAdminResponse(BaseModel):
    id: str
    phone: str
    is_premium: bool
    is_admin: bool
    created_at: datetime.datetime
    name: str | None
    hd_type: str | None
    completed_interview: bool

@router.get("/users", response_model=list[UserAdminResponse])
async def get_admin_users(
    skip: int = 0,
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    check_admin(user)
    
    stmt = (
        select(User, Profile, HdCard, PsychologicalProfile)
        .outerjoin(Profile, User.id == Profile.user_id)
        .outerjoin(HdCard, User.id == HdCard.user_id)
        .outerjoin(PsychologicalProfile, User.id == PsychologicalProfile.user_id)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    
    response = []
    for u, p, h, psych in rows:
        response.append(UserAdminResponse(
            id=str(u.id),
            phone=u.phone_hash[:10] + "..." if u.phone_hash else "hidden",
            is_premium=u.is_premium,
            is_admin=u.is_admin,
            created_at=u.created_at,
            name=p.name if p else None,
            hd_type=h.type if h else None,
            completed_interview=True if (psych and psych.completed_at) else False
        ))
    return response
