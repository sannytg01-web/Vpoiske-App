"""
Vlubvi — JWT RS256 Authentication & Platform Verification.

- Access token: 15 min TTL
- Refresh token: 30 days TTL, single-use (rotated)
- Telegram initData HMAC-SHA256 verification
- MAX initData HMAC-SHA256 verification
"""

from __future__ import annotations

import hashlib
import hmac
import json
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import parse_qs, unquote

from jose import JWTError, jwt

from app.config import settings

# ─── Constants ──────────────────────────────────────────────────
ALGORITHM = settings.jwt_algorithm
ACCESS_TOKEN_TTL = timedelta(minutes=settings.jwt_access_token_ttl_minutes)
REFRESH_TOKEN_TTL = timedelta(days=settings.jwt_refresh_token_ttl_days)


# ─── JWT Helpers ────────────────────────────────────────────────
def create_access_token(user_id: str, extra: dict[str, Any] | None = None) -> str:
    """Create a short-lived JWT access token (RS256)."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + ACCESS_TOKEN_TTL,
        "type": "access",
        "jti": uuid.uuid4().hex,
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.jwt_private_key, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Create a long-lived, single-use refresh token (RS256)."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + REFRESH_TOKEN_TTL,
        "type": "refresh",
        "jti": uuid.uuid4().hex,
    }
    return jwt.encode(payload, settings.jwt_private_key, algorithm=ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    """Decode and verify a JWT token. Raises JWTError on failure."""
    return jwt.decode(token, settings.jwt_public_key, algorithms=[ALGORITHM])


def create_token_pair(user_id: str) -> dict[str, str]:
    """Create an access + refresh token pair."""
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "bearer",
    }


# ─── Telegram initData Verification ────────────────────────────
def verify_telegram_init_data(
    init_data: str,
    bot_token: str | None = None,
    max_age_seconds: int = 300,
) -> dict[str, Any]:
    """
    Verify Telegram WebApp initData via HMAC-SHA256.

    1. Parse query string
    2. Build data-check-string (sorted, without 'hash')
    3. HMAC(WebAppData secret, data-check-string) == hash
    4. Check auth_date not older than max_age_seconds

    Returns parsed user dict or raises ValueError.
    """
    token = bot_token or settings.bot_token

    parsed = parse_qs(init_data, keep_blank_values=True)
    received_hash = parsed.pop("hash", [None])[0]

    if not received_hash:
        raise ValueError("Missing hash in initData")

    # Build data-check-string: sorted key=value pairs, newline-separated
    data_check_pairs = []
    for key in sorted(parsed.keys()):
        value = parsed[key][0]
        data_check_pairs.append(f"{key}={value}")
    data_check_string = "\n".join(data_check_pairs)

    # Secret key = HMAC-SHA256("WebAppData", bot_token)
    secret_key = hmac.new(
        b"WebAppData", token.encode("utf-8"), hashlib.sha256
    ).digest()

    # Calculated hash
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode("utf-8"), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise ValueError("Invalid initData signature")

    # Check auth_date freshness
    auth_date_str = parsed.get("auth_date", [None])[0]
    if auth_date_str:
        auth_date = int(auth_date_str)
        if time.time() - auth_date > max_age_seconds:
            raise ValueError("initData expired")

    # Parse user JSON
    user_raw = parsed.get("user", [None])[0]
    if user_raw:
        return json.loads(unquote(user_raw))

    raise ValueError("No user data in initData")


# ─── MAX initData Verification ──────────────────────────────────
def verify_max_init_data(
    init_data: str,
    secret_key: str | None = None,
    max_age_seconds: int = 300,
) -> dict[str, Any]:
    """
    Verify MAX (max.ru) MiniApp initData via HMAC-SHA256.

    Same scheme as Telegram:
    1. Parse query string
    2. Build sorted data-check-string (without 'hash')
    3. HMAC(secret_key_bytes, data-check-string) == hash
    4. Check auth_date freshness

    Returns parsed user dict or raises ValueError.
    """
    secret = secret_key or settings.max_secret_key

    parsed = parse_qs(init_data, keep_blank_values=True)
    received_hash = parsed.pop("hash", [None])[0]

    if not received_hash:
        raise ValueError("Missing hash in MAX initData")

    # Build data-check-string
    data_check_pairs = []
    for key in sorted(parsed.keys()):
        value = parsed[key][0]
        data_check_pairs.append(f"{key}={value}")
    data_check_string = "\n".join(data_check_pairs)

    # Secret key — HMAC-SHA256("MaxAppData", secret)
    max_secret = hmac.new(
        b"MaxAppData", secret.encode("utf-8"), hashlib.sha256
    ).digest()

    calculated_hash = hmac.new(
        max_secret, data_check_string.encode("utf-8"), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise ValueError("Invalid MAX initData signature")

    # Check auth_date
    auth_date_str = parsed.get("auth_date", [None])[0]
    if auth_date_str:
        auth_date = int(auth_date_str)
        if time.time() - auth_date > max_age_seconds:
            raise ValueError("MAX initData expired")

    # Parse user
    user_raw = parsed.get("user", [None])[0]
    if user_raw:
        return json.loads(unquote(user_raw))

    raise ValueError("No user data in MAX initData")
