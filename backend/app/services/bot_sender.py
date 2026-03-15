"""
Vlubvi — Telegram Bot Sender Service.
Handles sending push notifications, matches, and reminders via Telegram API.
"""
from typing import Optional, Any
import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class TelegramBotSender:
    def __init__(self, token: str):
        self.token = token
        self.api_url = f"https://api.telegram.org/bot{self.token}/"

    async def send_message(self, chat_id: int, text: str, reply_markup: Optional[dict] = None) -> bool:
        """Send a basic text message to a user."""
        url = self.api_url + "sendMessage"
        payload: dict[str, Any] = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML"
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                return True
            except httpx.HTTPStatusError as e:
                logger.error(f"Failed to send telegram message to {chat_id}: {e.response.text}")
                return False
            except Exception as e:
                logger.error(f"Error sending telegram message to {chat_id}: {str(e)}")
                return False
        return False

    async def notify_new_match(self, chat_id: int, match_name: str, match_score: int):
        """Notify a user about a new match."""
        text = (
            f"⚡ <b>Новый мэтч!</b>\n\n"
            f"Тебя лайкнул(а) {match_name}. Совместимость: <b>{match_score}%</b>!\n"
            f"Зайди в приложение, чтобы написать сообщение."
        )
        # Inline keyboard to open the Web App
        markup = {
            "inline_keyboard": [[
                {"text": "Открыть ВПоиске ❤️", "web_app": {"url": settings.web_app_url}}
            ]]
        }
        return await self.send_message(chat_id, text, reply_markup=markup)

bot_sender = TelegramBotSender(settings.bot_token)
