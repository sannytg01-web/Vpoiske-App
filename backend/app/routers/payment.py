import uuid
import structlog
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.models import Payment, User
from app.core.deps import get_current_user
from app.services.tbank import create_payment, verify_webhook

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/payment", tags=["payment"])

class SubscribeResponse(BaseModel):
    payment_url: str
    order_id: str

@router.post("/subscribe", response_model=SubscribeResponse)
async def subscribe_premium(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    order_id_uuid = uuid.uuid4()
    order_id = str(order_id_uuid)
    amount_kopecks = 49000  # 490 RUB
    
    # Store payment in db as 'pending'
    new_payment = Payment(
        id=order_id_uuid,
        user_id=user.id,
        amount=amount_kopecks,
        status="pending"
    )
    db.add(new_payment)
    await db.commit()
    await db.refresh(new_payment)
    
    # Fetch real url or dummy based on service mode
    payment_url = await create_payment(str(user.id), amount_kopecks=amount_kopecks, order_id=order_id)
    
    return SubscribeResponse(payment_url=payment_url, order_id=order_id)

@router.post("/webhook")
async def tbank_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """(public, no JWT for TBank calling us)"""
    data = await request.json()
    
    # verify_webhook ensures TBank sent it
    if not verify_webhook(data):
        raise HTTPException(status_code=400, detail="Invalid signature")
        
    order_id = data.get("OrderId")
    status = data.get("Status")
    rebill_id = data.get("RebillId")
    payment_id_tbank = str(data.get("PaymentId"))
    
    if not order_id:
        return {"Success": True} # Just ignoring malformed validly-signed payloads
        
    # Get payment record
    try:
        order_uuid = uuid.UUID(order_id)
    except ValueError:
        return {"Success": True}
        
    stmt = select(Payment).where(Payment.id == order_uuid)
    payment = await db.scalar(stmt)
    
    if payment:
        payment.tbank_payment_id = payment_id_tbank
        if rebill_id:
            payment.rebill_id = str(rebill_id)
            
        if status == "CONFIRMED":
            payment.status = "confirmed"
            # Give user premium access
            stmt_u = select(User).where(User.id == payment.user_id)
            user = await db.scalar(stmt_u)
            if user:
                user.is_premium = True
                # Give 30 days
                now_utc = datetime.now(timezone.utc)
                if user.premium_until and user.premium_until > now_utc:
                    user.premium_until = user.premium_until + timedelta(days=30)
                else:
                    user.premium_until = now_utc + timedelta(days=30)
                    
        elif status in ("REJECTED", "CANCELED", "DEADLINE_EXPIRED"):
            payment.status = "failed"
            
        await db.commit()
            
    # Always returning Success: true for TBank
    return {"Success": True}

@router.get("/status/{order_id}")
async def get_payment_status(
    order_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        order_uuid = uuid.UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order_id")

    stmt = select(Payment).where(Payment.id == order_uuid, Payment.user_id == user.id)
    payment = await db.scalar(stmt)
    
    if not payment:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # User's premium status from the dependent object
    # DB user refresh happens automatically on endpoint enter, but we can read the properties
    
    return {
        "status": payment.status,
        "is_premium": user.is_premium,
        "premium_until": user.premium_until.isoformat() if user.premium_until else None
    }
