"""
Vlubvi — FastAPI Application Entry Point.

- CORS: t.me, max.ru, localhost only
- Prometheus metrics at /metrics
- Sentry integration
- structlog JSON structured logging
- All routers mounted
"""

from __future__ import annotations

import logging
import sys

import sentry_sdk
import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.core.rate_limiter import limiter
from app.routers import auth, consent, interview, geo, birth_data, matches, chat, payment, profile, gdpr, bot

# ─── Structlog Configuration ───────────────────────────────────
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger("vlubvi")

# ─── Sentry ─────────────────────────────────────────────────────
if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=0.2,
        profiles_sample_rate=0.1,
        environment=settings.environment,
        release=f"vlubvi@0.1.0",
    )

# ─── FastAPI App ────────────────────────────────────────────────
app = FastAPI(
    title="Vlubvi API",
    description="AI-powered dating with Human Design matching",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# ─── Rate Limiter ───────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS ───────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "https://t.me",
    "https://web.telegram.org",
    "https://max.ru",
    "https://app.max.ru",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=600,
)

# ─── Prometheus Metrics ────────────────────────────────────────
Instrumentator(
    should_group_status_codes=True,
    should_ignore_untemplated=True,
    excluded_handlers=["/metrics", "/health"],
).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

# ─── Routers ───────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(consent.router)
app.include_router(interview.router)
app.include_router(geo.router)
app.include_router(birth_data.router)
app.include_router(matches.router)
app.include_router(chat.router)
app.include_router(payment.router)
app.include_router(profile.router)
app.include_router(gdpr.router)
app.include_router(bot.router)

# ─── Health Check ──────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "vlubvi"}


# ─── Request Logging Middleware ────────────────────────────────
@app.middleware("http")
async def request_logging_middleware(request: Request, call_next) -> Response:
    """Log every request with structlog."""
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        method=request.method,
        path=request.url.path,
        client_ip=request.client.host if request.client else "unknown",
    )

    response: Response = await call_next(request)

    logger.info(
        "request_completed",
        status_code=response.status_code,
    )
    return response


# ─── Global Exception Handler ──────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("unhandled_exception", error=str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
