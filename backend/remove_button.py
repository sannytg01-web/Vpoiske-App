import asyncio
from aiogram import Bot
from aiogram.types import MenuButtonDefault
from app.config import settings

bot = Bot(token=settings.bot_token)

async def main():
    print("Удаление старой кнопки меню...")
    await bot.set_chat_menu_button(menu_button=MenuButtonDefault())
    print("Успешно удалено!")
    await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())
