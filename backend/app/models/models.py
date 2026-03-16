"""
Vlubvi — SQLAlchemy 2.0 ORM Models.
All tables defined per the specification.
"""
from __future__ import annotations

import uuid
from datetime import date, datetime, time

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    LargeBinary,
    SmallInteger,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ──────────────────────────────────────────────────────────────
#  Users
# ──────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4()
    )
    telegram_id: Mapped[int | None] = mapped_column(BigInteger, unique=True, nullable=True, index=True)
    max_id: Mapped[int | None] = mapped_column(BigInteger, unique=True, nullable=True, index=True)
    phone_encrypted: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    phone_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    premium_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    profile: Mapped[Profile | None] = relationship("Profile", back_populates="user", uselist=False)
    hd_card: Mapped[HdCard | None] = relationship("HdCard", back_populates="user", uselist=False)
    psychological_profile: Mapped[PsychologicalProfile | None] = relationship(
        "PsychologicalProfile", back_populates="user", uselist=False
    )
    interview_sessions: Mapped[list[InterviewSession]] = relationship("InterviewSession", back_populates="user")
    payments: Mapped[list[Payment]] = relationship("Payment", back_populates="user")
    consents: Mapped[list[Consent]] = relationship("Consent", back_populates="user")


# ──────────────────────────────────────────────────────────────
#  Profiles
# ──────────────────────────────────────────────────────────────
class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4()
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    birth_year: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    user: Mapped[User] = relationship("User", back_populates="profile")


# ──────────────────────────────────────────────────────────────
#  Human Design Cards
# ──────────────────────────────────────────────────────────────
class HdCard(Base):
    __tablename__ = "hd_cards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4()
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    hd_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    profile_line: Mapped[str | None] = mapped_column(String(10), nullable=True)
    authority: Mapped[str | None] = mapped_column(String(30), nullable=True)
    defined_centers: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    active_channels: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    gates: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    birth_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    birth_time_accuracy: Mapped[str | None] = mapped_column(String(20), nullable=True)
    birth_city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    birth_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    birth_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    birth_timezone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    calculated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="hd_card")


# ──────────────────────────────────────────────────────────────
#  Psychological Profiles
# ──────────────────────────────────────────────────────────────
class PsychologicalProfile(Base):
    __tablename__ = "psychological_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4()
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # Big Five
    openness: Mapped[float | None] = mapped_column(Float, nullable=True)
    conscientiousness: Mapped[float | None] = mapped_column(Float, nullable=True)
    extraversion: Mapped[float | None] = mapped_column(Float, nullable=True)
    agreeableness: Mapped[float | None] = mapped_column(Float, nullable=True)
    neuroticism: Mapped[float | None] = mapped_column(Float, nullable=True)

    attachment_style: Mapped[str | None] = mapped_column(String(20), nullable=True)
    energy_type: Mapped[str | None] = mapped_column(String(10), nullable=True)
    conflict_style: Mapped[str | None] = mapped_column(String(20), nullable=True)
    top_values: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    shadow_patterns: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    refused_questions: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    profile_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # pgvector embedding (384-dim for MiniLM)
    embedding = mapped_column(Vector(384), nullable=True)

    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="psychological_profile")


# ──────────────────────────────────────────────────────────────
#  Interview Sessions
# ──────────────────────────────────────────────────────────────
class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4()
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str | None] = mapped_column(String(20), nullable=True, default="active")
    current_question_index: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="interview_sessions")


# ──────────────────────────────────────────────────────────────
#  Matches
# ──────────────────────────────────────────────────────────────
class Match(Base):
    __tablename__ = "matches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4()
    )
    user_a: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user_b: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    compatibility_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    hd_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    psychology_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    values_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    breakdown: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", server_default="'pending'")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_matches_users", "user_a", "user_b", unique=True),
    )


# ──────────────────────────────────────────────────────────────
#  Messages
# ──────────────────────────────────────────────────────────────
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4()
    )
    match_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    content_encrypted: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


# ──────────────────────────────────────────────────────────────
#  Payments
# ──────────────────────────────────────────────────────────────
class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4()
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tbank_payment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    rebill_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="created")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship("User", back_populates="payments")


# ──────────────────────────────────────────────────────────────
#  Consents (152-ФЗ)
# ──────────────────────────────────────────────────────────────
class Consent(Base):
    __tablename__ = "consents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4()
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    consent_type: Mapped[str] = mapped_column(String(50), nullable=False)
    granted: Mapped[bool] = mapped_column(Boolean, nullable=False)
    policy_version: Mapped[str | None] = mapped_column(String(10), nullable=True)
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="consents")


# ──────────────────────────────────────────────────────────────
#  Audit Log
# ──────────────────────────────────────────────────────────────
class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.uuid_generate_v4()
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
