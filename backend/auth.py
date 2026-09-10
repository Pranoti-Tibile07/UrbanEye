"""Authentication: password hashing, JWT tokens and user dependencies.

Password hashing uses PBKDF2-HMAC-SHA256 from the standard library (no
external native dependency), with a per-user random salt.
"""
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from . import config, models
from .database import get_db

_ALGORITHM = "pbkdf2_sha256"
_ITERATIONS = 120_000
_SALT_BYTES = 16

_bearer_scheme = HTTPBearer(auto_error=False)


# --------------------------------------------------------------------------
# Password hashing
# --------------------------------------------------------------------------

def hash_password(password: str) -> str:
    salt = os.urandom(_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _ITERATIONS)
    return f"{_ALGORITHM}${_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = stored.split("$")
        if algorithm != _ALGORITHM:
            return False
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), salt, int(iterations)
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


# --------------------------------------------------------------------------
# JWT
# --------------------------------------------------------------------------

def create_access_token(user: models.User) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=config.JWT_EXPIRE_MINUTES
    )
    payload = {"sub": str(user.id), "role": user.role, "exp": expires}
    return jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    payload = _decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token."
        )

    user = db.get(models.User, int(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )
    return user


def require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return user


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

def create_user(
    db: Session,
    name: str,
    email: str,
    password: str,
    role: str = "citizen",
) -> models.User:
    """Create a user. Raises HTTPException(409) if the email already exists."""
    email = email.strip().lower()
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = models.User(
        name=name.strip(),
        email=email,
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> models.User:
    user = (
        db.query(models.User)
        .filter(models.User.email == email.strip().lower())
        .first()
    )
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    return user
