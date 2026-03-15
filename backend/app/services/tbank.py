import hashlib
from typing import Optional, Any

TBANK_API_URL = "https://securepay.tbank.ru/v2/"
TBANK_TERMINAL_KEY = "dummy_key"
TBANK_PASSWORD = "dummy_password"

def sign_params(params: dict, password: str) -> str:
    """Обязательная процедура подписи параметров для T-Bank.
    Подпись Token: SHA256(конкатенация значений параметров, отсортированных по ключу + Password).
    НЕ включать Token и Receipt в строку для подписи.
    """
    keys = sorted([k for k in params.keys() if k not in ("Token", "Receipt")])
    values = "".join([str(params[k]) for k in keys if not isinstance(params[k], dict)])
    raw_str = values + password
    return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()

def verify_webhook(data: dict) -> bool:
    """Извлечь Token из data, собрать остальные параметры, конкатенировать значения + Password
    Сравнить SHA256 и вернуть True если совпадает.
    """
    if "Token" not in data:
        return False
    expected_token = sign_params(data, TBANK_PASSWORD)
    return expected_token == data["Token"]

async def create_payment(user_id: int, amount_kopecks: int, order_id: str, phone: Optional[str] = None, email: Optional[str] = None) -> str:
    """POST /Init
    Params: TerminalKey, Amount, OrderId, Description, URLs, Recurrent="Y"
    Вернуть PaymentURL.
    """
    params: dict[str, Any] = {
        "TerminalKey": TBANK_TERMINAL_KEY,
        "Amount": amount_kopecks,
        "OrderId": order_id,
        "Description": "Влюбви Premium — подписка на 1 месяц",
        "SuccessURL": "https://vlubvi.ru/payment/success",
        "FailURL": "https://vlubvi.ru/payment/fail",
        "Recurrent": "Y",
    }
    
    data_dict = {}
    if phone:
        data_dict["Phone"] = phone
    if email:
        data_dict["Email"] = email
    if data_dict:
        params["DATA"] = data_dict
        
    params["Token"] = sign_params(params, TBANK_PASSWORD)
    
    # В реальном приложении здесь отправляется `aiohttp.post` к TBANK_API_URL
    # Сейчас возвращаем PaymentURL заглушку
    return f"https://mock.tbank.ru/payment/{order_id}"

async def charge_recurring(payment_id: str, rebill_id: str) -> bool:
    """POST /Charge
    Params: TerminalKey, PaymentId, RebillId, Token
    → True если Status=CONFIRMED
    """
    params = {
        "TerminalKey": TBANK_TERMINAL_KEY,
        "PaymentId": payment_id,
        "RebillId": rebill_id,
    }
    params["Token"] = sign_params(params, TBANK_PASSWORD)
    
    # Mock network call request logic...
    return True

async def cancel_recurring(user_id: int) -> bool:
    """Найти последний активный RebillId и отменить подписку"""
    rebill_id = "mock_rebill"
    params = {
        "TerminalKey": TBANK_TERMINAL_KEY,
        "RebillId": rebill_id,
    }
    params["Token"] = sign_params(params, TBANK_PASSWORD)
    return True
