import asyncio
from sqlalchemy import text
from app.database import engine

async def alter_db():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;"))

if __name__ == "__main__":
    asyncio.run(alter_db())
