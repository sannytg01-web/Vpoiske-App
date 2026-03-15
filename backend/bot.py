import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters.command import Command
from aiogram.types import MenuButtonWebApp, WebAppInfo
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Читаем токен из app.config (подтягивается из .env)
bot = Bot(token=settings.bot_token)
dp = Dispatcher()

# Ссылка на фронтенд (Mini App)
WEB_APP_URL = settings.web_app_url

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    # Создаем инлайн-клавиатуру с кнопкой запуска Mini App
    markup = types.InlineKeyboardMarkup(
        inline_keyboard=[[
            types.InlineKeyboardButton(
                text="Открыть ВЛЮБВИ ❤️",
                web_app=WebAppInfo(url=WEB_APP_URL)
            )
        ]]
    )
    
    # Устанавливаем кнопку "Меню" слева от поля ввода текста,
    # чтобы она тоже открывала Mini App
    await bot.set_chat_menu_button(
        chat_id=message.chat.id,
        menu_button=MenuButtonWebApp(
            text="ВЛЮБВИ",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )
    )

    welcome_text = (
        "Привет! 👋\n\n"
        "Я — твой AI-проводник в новом поколении знакомств **ВЛЮБВИ**.\n"
        "Здесь мы анализируем твою психологию, ценности и Human Design, чтобы находить по-настоящему глубокие и осознанные совпадения.\n\n"
        "✨ Нажми на кнопку ниже, чтобы начать тест и найти своих людей!"
    )
    
    await message.answer(welcome_text, reply_markup=markup, parse_mode="Markdown")

async def main():
    logger.info("Запуск Telegram-бота...")
    # Пропускаем старые апдейты
    await bot.delete_webhook(drop_pending_updates=True)
    # Запускаем polling
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
