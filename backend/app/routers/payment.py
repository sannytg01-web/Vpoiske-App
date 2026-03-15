import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.services.tbank import create_payment, verify_webhook

router = APIRouter(prefix="/payment", tags=["payment"])

# Mock In-memory BD для платежей и юзеров на время прототипа
PAYMENTS_DB = {}
USERS_DB = {}

class SubscribeResponse(BaseModel):
    payment_url: str
    order_id: str

@router.post("/subscribe", response_model=SubscribeResponse)
async def subscribe_premium():
    # Хардкод user_id=1, пока нет JWT на реальном бэкенде
    user_id = 1
    order_id = str(uuid.uuid4())
    
    # 490 руб = 49000 копеек
    payment_url = await create_payment(user_id, amount_kopecks=49000, order_id=order_id)
    
    # Сохранить payments запись со status='pending'
    PAYMENTS_DB[order_id] = {
        "status": "pending",
        "user_id": user_id
    }
    
    # Вернуть {payment_url: str, order_id: str}
    return SubscribeResponse(payment_url=payment_url, order_id=order_id)

@router.post("/webhook")
async def tbank_webhook(request: Request):
    """(публичный, без JWT!)"""
    data = await request.json()
    
    # СНАЧАЛА verify_webhook(data) → если False → вернуть 400
    if not verify_webhook(data):
        raise HTTPException(status_code=400, detail="Invalid signature")
        
    order_id = data.get("OrderId")
    status = data.get("Status")
    
    if order_id in PAYMENTS_DB:
        user_id = PAYMENTS_DB[order_id]["user_id"]
        
        if status == "CONFIRMED":
            # При Status=CONFIRMED
            PAYMENTS_DB[order_id]["status"] = "confirmed"
            PAYMENTS_DB[order_id]["rebill_id"] = data.get("RebillId")
            
            # user.is_premium = True
            # user.premium_until = NOW() + 30 дней
            USERS_DB[user_id] = {
                "is_premium": True,
                "premium_until": (datetime.utcnow() + timedelta(days=30)).isoformat()
            }
            # mock.audit('payment_confirmed')
            
        elif status in ("REJECTED", "CANCELED"):
            # При Status=REJECTED/CANCELED: payments: status='failed'
            PAYMENTS_DB[order_id]["status"] = "failed"
            # mock.audit('payment_failed')
            
    # Всегда вернуть {"Success": true} — T-Bank требует этот ответ
    return {"Success": True}

@router.get("/status/{order_id}")
async def get_payment_status(order_id: str):
    """Вернуть {status, is_premium, premium_until}
    Фронтенд поллит этот эндпоинт после редиректа с payment_url
    """
    payment = PAYMENTS_DB.get(order_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Order not found")
        
    user_id = payment["user_id"]
    user = USERS_DB.get(user_id, {})
    
    return {
        "status": payment["status"],
        "is_premium": user.get("is_premium", False),
        "premium_until": user.get("premium_until", None)
    }
