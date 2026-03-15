import pytest
from unittest.mock import AsyncMock, patch
from app.services.tbank import sign_params, TBANK_PASSWORD
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db

client = TestClient(app)

@pytest.fixture
def mock_db_session():
    mock_session = AsyncMock()
    # Mock scalar to return a dummy payment object
    class DummyPayment:
        id = "test-order-001"
        user_id = 1
        tbank_payment_id = None
        rebill_id = None
        status = "pending"
        
    class DummyUser:
        id = 1
        is_premium = False
        premium_until = None
        
    async def mock_scalar(stmt):
        stmt_str = str(stmt).lower()
        if "from payments" in stmt_str:
            return DummyPayment()
        if "from users" in stmt_str:
            return DummyUser()
        return None
        
    mock_session.scalar.side_effect = mock_scalar
    return mock_session

def test_tbank_webhook_tampered(mock_db_session):
    """Неверная подпись → 400"""
    app.dependency_overrides[get_db] = lambda: mock_db_session
    
    data = {
        "TerminalKey": "dummy_key",
        "OrderId": "fail-order",
        "Success": True,
        "Status": "CONFIRMED",
        "PaymentId": 123456,
        "ErrorCode": "0",
        "Amount": 49000,
        "Token": "fake_token_hash",
    }
    
    res = client.post("/payment/webhook", json=data)
    app.dependency_overrides.clear()
    
    assert res.status_code == 400
    assert "Invalid signature" in res.json()["detail"]

@pytest.mark.asyncio
async def test_recurring_charge():
    """charge_recurring возвращает True при успехе"""
    from app.services.tbank import charge_recurring
    success = await charge_recurring("test_payment", "test_rebill")
    assert success is True

