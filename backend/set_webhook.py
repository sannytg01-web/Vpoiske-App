import asyncio
import sys
import httpx

# Чтобы импорт app.config работал при запуске скрипта из корня backend/
from app.config import settings

async def set_webhook(base_url: str):
    """
    Устанавливает вебхук для Telegram бота.
    base_url должно быть публичным HTTPS-адресом (например, от ngrok или localtunnel).
    """
    bot_token = settings.bot_token
    if not bot_token or bot_token == "test_token":
        print("❌ ОШИБКА: BOT_TOKEN не установлен в .env или используется тестовый.")
        print("Пожалуйста, добавьте ваш реальный токен в .env перед вызовом скрипта.")
        return

    # Эндпоинт, который мы создали в app/routers/bot.py
    webhook_url = f"{base_url.rstrip('/')}/bot/webhook"
    
    api_url = f"https://api.telegram.org/bot{bot_token}/setWebhook"
    payload = {
        "url": webhook_url,
        "drop_pending_updates": True  # Сбрасываем старые апдейты, пока бот был оффлайн
    }

    print(f"🔗 Отправка запроса к Telegram API на установку webhook_url = {webhook_url} ...")
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(api_url, json=payload)
            data = resp.json()
            if data.get("ok"):
                print("✅ Вебхук успешно установлен!")
                print(data)
            else:
                print("❌ Ошибка при установке вебхука:")
                print(data)
        except Exception as e:
            print(f"❌ Возникла ошибка при выполнении запроса: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python set_webhook.py <ВАШ_HTTPS_АДРЕС>")
        print("Пример: python set_webhook.py https://e9a1-100-100-100-100.ngrok-free.app")
        sys.exit(1)
        
    asyncio.run(set_webhook(sys.argv[1]))
