"""Initial migration

Revision ID: v01_initial
Revises: 
Create Date: 2026-03-14 16:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision = 'v01_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # ─── Extensions ──────────────────────────────────────────────────
    op.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
    op.execute("CREATE EXTENSION IF NOT EXISTS \"vector\";")

    # ─── Table: Users ────────────────────────────────────────────────
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('telegram_id', sa.BigInteger(), nullable=True),
        sa.Column('max_id', sa.BigInteger(), nullable=True),
        sa.Column('phone_encrypted', sa.LargeBinary(), nullable=True),
        sa.Column('phone_hash', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('last_active_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('is_premium', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('premium_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(op.f('ix_users_telegram_id'), 'users', ['telegram_id'], unique=True)
    op.create_index(op.f('ix_users_max_id'), 'users', ['max_id'], unique=True)
    op.create_index(op.f('ix_users_phone_hash'), 'users', ['phone_hash'], unique=False)

    # ─── Table: Profiles ─────────────────────────────────────────────
    op.create_table(
        'profiles',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=True),
        sa.Column('birth_year', sa.SmallInteger(), nullable=True),
        sa.Column('gender', sa.String(length=10), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('photo_url', sa.Text(), nullable=True),
        sa.Column('is_visible', sa.Boolean(), server_default='true', nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id')
    )

    # ─── Table: HdCards ──────────────────────────────────────────────
    op.create_table(
        'hd_cards',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('hd_type', sa.String(length=20), nullable=True),
        sa.Column('profile_line', sa.String(length=10), nullable=True),
        sa.Column('authority', sa.String(length=30), nullable=True),
        sa.Column('defined_centers', JSONB(), nullable=True),
        sa.Column('active_channels', JSONB(), nullable=True),
        sa.Column('gates', JSONB(), nullable=True),
        sa.Column('birth_date', sa.Date(), nullable=True),
        sa.Column('birth_time', sa.Time(), nullable=True),
        sa.Column('birth_time_accuracy', sa.String(length=20), nullable=True),
        sa.Column('birth_city', sa.String(length=100), nullable=True),
        sa.Column('birth_lat', sa.Float(), nullable=True),
        sa.Column('birth_lon', sa.Float(), nullable=True),
        sa.Column('birth_timezone', sa.String(length=50), nullable=True),
        sa.Column('calculated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id')
    )

    # ─── Table: PsychologicalProfiles ────────────────────────────────
    op.create_table(
        'psychological_profiles',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('openness', sa.Float(), nullable=True),
        sa.Column('conscientiousness', sa.Float(), nullable=True),
        sa.Column('extraversion', sa.Float(), nullable=True),
        sa.Column('agreeableness', sa.Float(), nullable=True),
        sa.Column('neuroticism', sa.Float(), nullable=True),
        sa.Column('attachment_style', sa.String(length=20), nullable=True),
        sa.Column('energy_type', sa.String(length=10), nullable=True),
        sa.Column('conflict_style', sa.String(length=20), nullable=True),
        sa.Column('top_values', JSONB(), nullable=True),
        sa.Column('shadow_patterns', JSONB(), nullable=True),
        sa.Column('refused_questions', JSONB(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('profile_notes', sa.Text(), nullable=True),
        sa.Column('embedding', Vector(384), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id')
    )

    # ─── Table: InterviewSessions ────────────────────────────────────
    op.create_table(
        'interview_sessions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=True, server_default='active'),
        sa.Column('current_question_index', sa.Integer(), server_default='0', nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )

    # ─── Table: Matches ──────────────────────────────────────────────
    op.create_table(
        'matches',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_a', UUID(as_uuid=True), nullable=False),
        sa.Column('user_b', UUID(as_uuid=True), nullable=False),
        sa.Column('compatibility_score', sa.Float(), nullable=True),
        sa.Column('hd_score', sa.Float(), nullable=True),
        sa.Column('psychology_score', sa.Float(), nullable=True),
        sa.Column('values_score', sa.Float(), nullable=True),
        sa.Column('breakdown', JSONB(), nullable=True),
        sa.Column('status', sa.String(length=20), server_default="'pending'", nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_a'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_b'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('ix_matches_users', 'matches', ['user_a', 'user_b'], unique=True)

    # ─── Table: Messages ─────────────────────────────────────────────
    op.create_table(
        'messages',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('match_id', UUID(as_uuid=True), nullable=False),
        sa.Column('sender_id', UUID(as_uuid=True), nullable=False),
        sa.Column('content_encrypted', sa.LargeBinary(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['match_id'], ['matches.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index(op.f('ix_messages_match_id'), 'messages', ['match_id'], unique=False)

    # ─── Table: Payments ─────────────────────────────────────────────
    op.create_table(
        'payments',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('tbank_payment_id', sa.String(length=100), nullable=True),
        sa.Column('rebill_id', sa.String(length=100), nullable=True),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='created'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index(op.f('ix_payments_user_id'), 'payments', ['user_id'], unique=False)

    # ─── Table: Consents ─────────────────────────────────────────────
    op.create_table(
        'consents',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('consent_type', sa.String(length=50), nullable=False),
        sa.Column('granted', sa.Boolean(), nullable=False),
        sa.Column('policy_version', sa.String(length=10), nullable=True),
        sa.Column('granted_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index(op.f('ix_consents_user_id'), 'consents', ['user_id'], unique=False)

    # ─── Table: AuditLog ─────────────────────────────────────────────
    op.create_table(
        'audit_log',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('meta', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index(op.f('ix_audit_log_user_id'), 'audit_log', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_table('audit_log')
    op.drop_table('consents')
    op.drop_table('payments')
    op.drop_table('messages')
    op.drop_table('matches')
    op.drop_table('interview_sessions')
    op.drop_table('psychological_profiles')
    op.drop_table('hd_cards')
    op.drop_table('profiles')
    op.drop_table('users')
    op.execute("DROP EXTENSION IF EXISTS \"vector\";")
    op.execute("DROP EXTENSION IF EXISTS \"uuid-ossp\";")
