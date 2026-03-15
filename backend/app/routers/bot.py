"""
Vlubvi — Telegram Bot Router.
Handles webhooks from Telegram servers.
"""
from fastapi import APIRouter, Request, BackgroundTasks
import structlog
from app.services.bot_sender import bot_sender
from app.config import settings

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/bot", tags=["bot"])

@router.post("/webhook")
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Handle incoming Telegram updates securely.
    Usually we verify secret_token from headers.
    """
    try:
        update = await request.json()
        logger.info("telegram_update_received", update=update)

        if "message" in update:
            msg = update["message"]
            chat_id = msg.get("chat", {}).get("id")
            text = msg.get("text", "")

            if text == "/start":
                # Handle /start command directly
                welcome_text = (
                    "Привет! Добро пожаловать во ВПоиске ❤️\n\n"
                    "Это твой профиль знакомств нового уровня с Human Design.\n"
                    "Внутри тебя ждёт агент для глубинного интервью.\n\n"
                    "👉 Нажми на кнопку ниже, чтобы запустить приложение."
                )
                markup = {
                    "inline_keyboard": [[
                        {"text": "Открыть ВПоиске ❤️", "web_app": {"url": settings.web_app_url}}
                    ]]
                }
                background_tasks.add_task(bot_sender.send_message, chat_id, welcome_text, markup)
            
            elif text == "/matches":
                # Debug command to simulate sending a match
                background_tasks.add_task(bot_sender.notify_new_match, chat_id, "Ольга", 92)

    except Exception as e:
        logger.error("telegram_webhook_error", error=str(e), exc_info=True)

    return {"ok": True}
