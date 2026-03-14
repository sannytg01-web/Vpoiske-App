"""
Vlubvi — Auth Router.

Endpoints:
  POST /auth/telegram      — Telegram MiniApp login
  POST /auth/max           — MAX MiniApp login
  POST /auth/phone/send-code — Send OTP via sms.ru
  POST /auth/phone         — Verify OTP, return JWT
  POST /auth/refresh       — Rotate access_token
  POST /auth/logout        — Invalidate refresh_token
"""

from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timezone

import httpx
import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.rate_limiter import RATE_AUTH, limiter
from app.core.security import (
    create_token_pair,
    decode_token,
    verify_max_init_data,
    verify_telegram_init_data,
)
from app.database import get_db
from app.models.models import AuditLog, User
from app.services.encryption import encrypt, hash_phone

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# ─── In-memory OTP store (use Redis in production) ─────────────
_otp_store: dict[str, str] = {}
# ─── In-memory refresh token blacklist (use Redis in production) ─
_refresh_blacklist: set[str] = set()


# ─── Schemas ────────────────────────────────────────────────────
class TelegramAuthRequest(BaseModel):
    init_data: str = Field(..., description="Telegram WebApp initData query string")


class MaxAuthRequest(BaseModel):
    init_data: str = Field(..., description="MAX MiniApp initData query string")


class PhoneSendCodeRequest(BaseModel):
    phone: str = Field(..., pattern=r"^\+7\d{10}$", description="Phone number in +7XXXXXXXXXX format")


class PhoneVerifyRequest(BaseModel):
    phone: str = Field(..., pattern=r"^\+7\d{10}$")
    code: str = Field(..., min_length=4, max_length=6)


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str


# ─── Helpers ────────────────────────────────────────────────────
async def _get_or_create_user(
    db: AsyncSession,
    *,
    telegram_id: int | None = None,
    max_id: int | None = None,
) -> User:
    """Find existing user by platform ID or create a new one."""
    stmt = None
    if telegram_id is not None:
        stmt = select(User).where(User.telegram_id == telegram_id)
    elif max_id is not None:
        stmt = select(User).where(User.max_id == max_id)

    if stmt is not None:
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if user:
            user.last_active_at = datetime.now(timezone.utc)
            return user

    # Create new user
    user = User(
        id=uuid.uuid4(),
        telegram_id=telegram_id,
        max_id=max_id,
        last_active_at=datetime.now(timezone.utc),
    )
    db.add(user)
    await db.flush()
    return user


async def _audit(db: AsyncSession, user_id: uuid.UUID, action: str, meta: dict | None = None) -> None:
    """Write entry to audit_log."""
    entry = AuditLog(user_id=user_id, action=action, meta=meta)
    db.add(entry)


# ─── Endpoints ──────────────────────────────────────────────────
@router.post("/telegram", response_model=TokenResponse)
@limiter.limit(RATE_AUTH)
async def auth_telegram(
    request: Request,
    body: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Authenticate via Telegram MiniApp initData."""
    try:
        tg_user = verify_telegram_init_data(body.init_data)
    except ValueError as exc:
        logger.warning("telegram_auth_failed", error=str(exc))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    telegram_id = tg_user.get("id")
    if not telegram_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No id in Telegram user data")

    user = await _get_or_create_user(db, telegram_id=telegram_id)
    await _audit(db, user.id, "auth.telegram", {"telegram_id": telegram_id})
    tokens = create_token_pair(str(user.id))
    return TokenResponse(**tokens)


@router.post("/max", response_model=TokenResponse)
@limiter.limit(RATE_AUTH)
async def auth_max(
    request: Request,
    body: MaxAuthRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Authenticate via MAX (max.ru) MiniApp initData."""
    try:
        max_user = verify_max_init_data(body.init_data)
    except ValueError as exc:
        logger.warning("max_auth_failed", error=str(exc))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    max_user_id = max_user.get("id")
    if not max_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No id in MAX user data")

    user = await _get_or_create_user(db, max_id=max_user_id)
    await _audit(db, user.id, "auth.max", {"max_id": max_user_id})
    tokens = create_token_pair(str(user.id))
    return TokenResponse(**tokens)


@router.post("/phone/send-code", response_model=MessageResponse)
@limiter.limit(RATE_AUTH)
async def phone_send_code(
    request: Request,
    body: PhoneSendCodeRequest,
) -> MessageResponse:
    """Send OTP code via sms.ru."""
    code = "".join(secrets.choice("0123456789") for _ in range(4))
    _otp_store[body.phone] = code

    # Send SMS via sms.ru API
    if settings.sms_ru_api_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    "https://sms.ru/sms/send",
                    params={
                        "api_id": settings.sms_ru_api_key,
                        "to": body.phone.lstrip("+"),
                        "msg": f"Vlubvi: ваш код {code}",
                        "json": 1,
                    },
                )
                resp.raise_for_status()
                logger.info("sms_sent", phone_hash=hash_phone(body.phone))
        except Exception as exc:
            logger.error("sms_send_failed", error=str(exc))
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to send SMS",
            )
    else:
        # Dev mode — log the code
        logger.info("dev_otp_code", phone=body.phone, code=code)

    return MessageResponse(message="Code sent")


@router.post("/phone", response_model=TokenResponse)
@limiter.limit(RATE_AUTH)
async def auth_phone(
    request: Request,
    body: PhoneVerifyRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Verify phone OTP and return JWT tokens."""
    stored_code = _otp_store.get(body.phone)
    if not stored_code or stored_code != body.code:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired code")

    # Remove used code
    _otp_store.pop(body.phone, None)

    # Find user by phone hash or create
    phone_h = hash_phone(body.phone)
    stmt = select(User).where(User.phone_hash == phone_h)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id=uuid.uuid4(),
            phone_encrypted=encrypt(body.phone),
            phone_hash=phone_h,
            last_active_at=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.flush()

    await _audit(db, user.id, "auth.phone")
    tokens = create_token_pair(str(user.id))
    return TokenResponse(**tokens)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit(RATE_AUTH)
async def auth_refresh(
    request: Request,
    body: RefreshRequest,
) -> TokenResponse:
    """Rotate refresh_token — old token becomes invalid."""
    try:
        payload = decode_token(body.refresh_token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not a refresh token")

    jti = payload.get("jti")
    if jti in _refresh_blacklist:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token already used")

    # Blacklist old token
    _refresh_blacklist.add(jti)

    user_id = payload["sub"]
    tokens = create_token_pair(user_id)
    return TokenResponse(**tokens)


@router.post("/logout", response_model=MessageResponse)
async def auth_logout(
    body: RefreshRequest,
) -> MessageResponse:
    """Invalidate refresh_token (blacklist its jti)."""
    try:
        payload = decode_token(body.refresh_token)
        jti = payload.get("jti")
        if jti:
            _refresh_blacklist.add(jti)
    except Exception:
        pass  # Logout should always succeed
    return MessageResponse(message="Logged out")
