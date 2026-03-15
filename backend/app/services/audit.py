import structlog
from datetime import datetime, timezone
import uuid

logger = structlog.get_logger("audit")

async def log_audit_event(user_id: uuid.UUID, action: str, details: dict | None = None):
    """
    Log sensitive changes according to GDPR and general audit requirements.
    In a real app, you might save this to a separate audit table or a secure log stream.
    For now, we emit structured logs.
    """
    event = {
        "event_type": "audit",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": str(user_id),
        "action": action,
        "details": details or {}
    }
    logger.info("audit_event", **event)
