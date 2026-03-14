"""
Vlubvi — Async SQLAlchemy 2.0 engine & session factory.
Uses asyncpg driver through PgBouncer (transaction mode).
"""

from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# ─── Engine ─────────────────────────────────────────────────────
# pool_size is kept moderate because PgBouncer handles pooling.
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=1800,
    # prepare=False is required when using PgBouncer in transaction mode
    connect_args={"prepared_statement_cache_size": 0},
)

# ─── Session factory ────────────────────────────────────────────
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ─── Base model ─────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


# ─── Dependency ─────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields an async session, auto-closes."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
