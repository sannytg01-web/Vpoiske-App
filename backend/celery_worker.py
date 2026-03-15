import os
import asyncio
from datetime import datetime, timedelta
# In a real app we'd use celery
# from celery import Celery
# from celery.schedules import crontab
from app.services.tbank import create_payment, charge_recurring

# Placeholder for real DB
USERS_DB = {} 
PAYMENTS_DB = {}

# celery_app = Celery("vlubvi_worker", broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1"))

# @celery_app.on_after_configure.connect
# def setup_periodic_tasks(sender, **kwargs):
#     # Schedule: ежедневно в 09:00 MSK (crontab hour=6, minute=0 по UTC)
#     sender.add_periodic_task(crontab(hour=6, minute=0), renew_subscriptions.s())

# @celery_app.task
def renew_subscriptions():
    """Celery Beat задача renew_subscriptions"""
    now = datetime.utcnow()
    # 1. Найти пользователей: is_premium=True, premium_until < NOW() + 3 дня
    users_to_renew = []
    for user_id, user_data in USERS_DB.items():
        if user_data.get("is_premium") and user_data.get("premium_until"):
            until_date = datetime.fromisoformat(user_data["premium_until"])
            if until_date < now + timedelta(days=3):
                users_to_renew.append((user_id, user_data))

    # 2. Для каждого:
    for user_id, user_data in users_to_renew:
        # В реальной задаче: нужен loop.run_until_complete или async task
        asyncio.run(process_user_renewal(user_id, user_data))

async def process_user_renewal(user_id, user_data):
    # Создать новый платёж через POST /Init (Recurrent="Y")
    order_id = f"ren_{user_id}_{datetime.now().timestamp()}"
    payment_url = await create_payment(user_id, amount_kopecks=49000, order_id=order_id)
    payment_id = "mock_recurring_payment_id" # This would come from create_payment dict response ideally
    
    # Получить rebill_id
    rebill_id = user_data.get("rebill_id", "mock_rebill_id")
    
    # tbank.charge_recurring
    success = await charge_recurring(payment_id, rebill_id)
    
    if success:
        # При успехе: premium_until += 30 дней
        old_until = datetime.fromisoformat(user_data["premium_until"])
        user_data["premium_until"] = (old_until + timedelta(days=30)).isoformat()
    else:
        # При ошибке: отправить уведомление пользователю, попробовать завтра (макс 3 попытки)
        # mock.send_push("Не удалось продлить подписку. Пожалуйста, проверьте карту.")
        pass
