from dotenv import load_dotenv
load_dotenv()
import asyncio
import logging
from app.database import engine
from app.models.models import Base

async def clean_redis():
    from app.config import settings
    import redis.asyncio as aioredis
    r = aioredis.from_url(settings.redis_url)
    await r.flushdb()
    print("Redis flushed!")
    await r.aclose()

async def reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Postgres DB reset!")

async def main():
    await reset_db()
    try:
        await clean_redis()
    except Exception as e:
        print(f"Redis not available or failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
