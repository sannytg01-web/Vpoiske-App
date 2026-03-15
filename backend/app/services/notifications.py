import logging

logger = logging.getLogger(__name__)

async def send_push(user_telegram_id: str, title: str, body: str):
    """
    Stub for notification service sending push to Telegram or Max Platform.
    In real app: POST to https://api.telegram.org/bot{BOT_TOKEN}/sendMessage
    """
    logger.info(f"Notification to Telegram {user_telegram_id} -> {title}: {body}")
    # Example structure:
    # payload = {
    #     "chat_id": user_telegram_id,
    #     "text": f"💌 {title}: {body}",
    #     "reply_markup": {"inline_keyboard": [[{"text": "Ответить", "url": "https://t.me/our_bot/app"}]]}
    # }
    pass
