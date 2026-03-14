"""
Vlubvi — Rate Limiter (slowapi).

Limits:
  /auth/*:            5 req/min per IP
  /interview/answer:  30 req/min per user
  /geo/suggest:       60 req/min per IP
  Default:            60 req/min per user
"""

from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request


def _get_user_id_or_ip(request: Request) -> str:
    """Extract user_id from request state (set by auth middleware) or fall back to IP."""
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return str(user_id)
    return get_remote_address(request)


# Main limiter instance
limiter = Limiter(
    key_func=_get_user_id_or_ip,
    default_limits=["60/minute"],
    storage_uri="memory://",  # Will be replaced with Redis URI in production
)

# Pre-defined rate strings for use in route decorators
RATE_AUTH = "5/minute"
RATE_INTERVIEW = "30/minute"
RATE_GEO = "60/minute"
RATE_DEFAULT = "60/minute"
