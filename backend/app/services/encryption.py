"""
Vlubvi — Fernet AES field-level encryption + phone hashing.

- encrypt(data: str) → bytes
- decrypt(data: bytes) → str
- hash_phone(phone: str) → str  (SHA-256, deterministic for lookups)
"""

from __future__ import annotations

import hashlib

from cryptography.fernet import Fernet

from app.config import settings

# Initialize Fernet cipher from config
_fernet = Fernet(settings.encryption_key.encode("utf-8"))


def encrypt(data: str) -> bytes:
    """Encrypt a string with Fernet AES-128-CBC (returns raw bytes for BYTEA)."""
    return _fernet.encrypt(data.encode("utf-8"))


def decrypt(data: bytes) -> str:
    """Decrypt Fernet-encrypted bytes back to a string."""
    return _fernet.decrypt(data).decode("utf-8")


def hash_phone(phone: str) -> str:
    """
    SHA-256 hash of a phone number for deterministic lookups.
    Phone is normalized (digits only) before hashing.
    """
    normalized = "".join(c for c in phone if c.isdigit())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()
