"""
Vlubvi — Auth Tests.

Tests:
  - test_telegram_initdata_valid
  - test_telegram_initdata_expired
  - test_telegram_initdata_tampered
  - test_max_initdata_valid
  - test_phone_otp_flow
  - test_jwt_refresh
"""

from __future__ import annotations

import hashlib
import hmac
import json
import time
from urllib.parse import quote, urlencode

import pytest
from httpx import ASGITransport, AsyncClient

from app.config import settings
from app.main import app


# ─── Helpers ────────────────────────────────────────────────────
def _build_telegram_init_data(
    user_data: dict,
    bot_token: str | None = None,
    auth_date: int | None = None,
) -> str:
    """Build a valid Telegram initData string with proper HMAC signature."""
    token = bot_token or settings.bot_token
    auth_date = auth_date or int(time.time())

    params = {
        "user": json.dumps(user_data, separators=(",", ":")),
        "auth_date": str(auth_date),
        "query_id": "test_query_id",
    }

    # Build data-check-string
    data_check_string = "\n".join(
        f"{k}={params[k]}" for k in sorted(params.keys())
    )

    # Secret key
    secret_key = hmac.new(
        b"WebAppData", token.encode("utf-8"), hashlib.sha256
    ).digest()

    # Hash
    hash_value = hmac.new(
        secret_key, data_check_string.encode("utf-8"), hashlib.sha256
    ).hexdigest()

    params["hash"] = hash_value
    return urlencode(params)


def _build_max_init_data(
    user_data: dict,
    secret_key: str | None = None,
    auth_date: int | None = None,
) -> str:
    """Build a valid MAX initData string with proper HMAC signature."""
    secret = secret_key or settings.max_secret_key
    auth_date = auth_date or int(time.time())

    params = {
        "user": json.dumps(user_data, separators=(",", ":")),
        "auth_date": str(auth_date),
        "query_id": "test_max_query_id",
    }

    data_check_string = "\n".join(
        f"{k}={params[k]}" for k in sorted(params.keys())
    )

    max_secret = hmac.new(
        b"MaxAppData", secret.encode("utf-8"), hashlib.sha256
    ).digest()

    hash_value = hmac.new(
        max_secret, data_check_string.encode("utf-8"), hashlib.sha256
    ).hexdigest()

    params["hash"] = hash_value
    return urlencode(params)


# ─── Fixtures ───────────────────────────────────────────────────
@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ─── Tests ──────────────────────────────────────────────────────
@pytest.mark.anyio
async def test_telegram_initdata_valid(client: AsyncClient):
    """Valid Telegram initData should return 200 + JWT tokens."""
    user_data = {"id": 123456789, "first_name": "Test", "username": "testuser"}
    init_data = _build_telegram_init_data(user_data)

    response = await client.post("/auth/telegram", json={"init_data": init_data})
    assert response.status_code == 200

    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


@pytest.mark.anyio
async def test_telegram_initdata_expired(client: AsyncClient):
    """Expired Telegram initData (auth_date > 5 min ago) should return 401."""
    user_data = {"id": 111111111, "first_name": "Expired"}
    expired_time = int(time.time()) - 600  # 10 minutes ago
    init_data = _build_telegram_init_data(user_data, auth_date=expired_time)

    response = await client.post("/auth/telegram", json={"init_data": init_data})
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()


@pytest.mark.anyio
async def test_telegram_initdata_tampered(client: AsyncClient):
    """Tampered Telegram initData should return 401."""
    user_data = {"id": 222222222, "first_name": "Tampered"}
    init_data = _build_telegram_init_data(user_data)

    # Tamper with the data by replacing part of the hash
    tampered = init_data.replace("hash=", "hash=0000")
    response = await client.post("/auth/telegram", json={"init_data": tampered})
    assert response.status_code == 401


@pytest.mark.anyio
async def test_max_initdata_valid(client: AsyncClient):
    """Valid MAX initData should return 200 + JWT tokens."""
    user_data = {"id": 987654321, "first_name": "MaxUser"}
    init_data = _build_max_init_data(user_data)

    response = await client.post("/auth/max", json={"init_data": init_data})
    assert response.status_code == 200

    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body


@pytest.mark.anyio
async def test_phone_otp_flow(client: AsyncClient):
    """Full phone OTP flow: send-code → verify → get JWT."""
    phone = "+79001234567"

    # Step 1: Send code (dev mode — no real SMS)
    resp1 = await client.post("/auth/phone/send-code", json={"phone": phone})
    assert resp1.status_code == 200
    assert resp1.json()["message"] == "Code sent"

    # Step 2: Retrieve OTP from in-memory store (test-only access)
    from app.routers.auth import _otp_store

    code = _otp_store.get(phone)
    assert code is not None

    # Step 3: Verify
    resp2 = await client.post("/auth/phone", json={"phone": phone, "code": code})
    assert resp2.status_code == 200

    body = resp2.json()
    assert "access_token" in body
    assert "refresh_token" in body


@pytest.mark.anyio
async def test_jwt_refresh(client: AsyncClient):
    """Refresh token should return new access + refresh pair, old refresh is invalidated."""
    # First, authenticate
    user_data = {"id": 555555555, "first_name": "RefreshTest"}
    init_data = _build_telegram_init_data(user_data)

    resp1 = await client.post("/auth/telegram", json={"init_data": init_data})
    assert resp1.status_code == 200
    tokens = resp1.json()

    # Refresh
    resp2 = await client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert resp2.status_code == 200

    new_tokens = resp2.json()
    assert new_tokens["access_token"] != tokens["access_token"]
    assert new_tokens["refresh_token"] != tokens["refresh_token"]

    # Old refresh token should be blacklisted
    resp3 = await client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert resp3.status_code == 401
