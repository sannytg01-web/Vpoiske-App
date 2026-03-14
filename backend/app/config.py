"""
Vlubvi — Pydantic v2 Settings.
Reads from .env, validates, and provides typed access to all config values.
"""

from __future__ import annotations

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration — populated from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── Database ───────────────────────────────────────────────
    database_url: str = Field(
        default="postgresql+asyncpg://vlubvi:changeme@pgbouncer:5432/vlubvi",
        description="Async SQLAlchemy connection string (through PgBouncer)",
    )
    postgres_password: str = Field(default="changeme")

    # ─── Redis ──────────────────────────────────────────────────
    redis_url: str = Field(default="redis://redis:6379/0")

    # ─── Encryption ─────────────────────────────────────────────
    encryption_key: str = Field(
        ..., description="Fernet 32-byte base64 key for field-level encryption"
    )

    # ─── JWT RS256 ──────────────────────────────────────────────
    jwt_private_key: str = Field(..., description="RSA 2048 PEM private key")
    jwt_public_key: str = Field(..., description="RSA 2048 PEM public key")
    jwt_access_token_ttl_minutes: int = Field(default=15)
    jwt_refresh_token_ttl_days: int = Field(default=30)
    jwt_algorithm: str = Field(default="RS256")

    # ─── Telegram ───────────────────────────────────────────────
    bot_token: str = Field(..., description="Telegram Bot API token")

    # ─── MAX (max.ru) ───────────────────────────────────────────
    max_secret_key: str = Field(..., description="MAX MiniApp secret key")

    # ─── Yandex Cloud ───────────────────────────────────────────
    yandex_api_key: str = Field(default="")
    yandex_folder_id: str = Field(default="")

    # ─── T-Bank (Tinkoff) ──────────────────────────────────────
    tbank_terminal_key: str = Field(default="")
    tbank_password: str = Field(default="")

    # ─── SMS.RU ─────────────────────────────────────────────────
    sms_ru_api_key: str = Field(default="")

    # ─── Sentry ─────────────────────────────────────────────────
    sentry_dsn: str = Field(default="")

    # ─── LLM Settings ──────────────────────────────────────────
    llm_max_concurrent: int = Field(default=50)
    llm_temperature: float = Field(default=0.72)
    llm_max_tokens: int = Field(default=500)

    # ─── App Meta ───────────────────────────────────────────────
    app_name: str = Field(default="Vlubvi")
    debug: bool = Field(default=False)
    environment: str = Field(default="development")

    @field_validator("jwt_private_key", "jwt_public_key", mode="before")
    @classmethod
    def decode_pem_newlines(cls, v: str) -> str:
        """Allow PEM keys stored in env with literal \\n."""
        if isinstance(v, str):
            return v.replace("\\n", "\n")
        return v


# Singleton instance
settings = Settings()  # type: ignore[call-arg]
