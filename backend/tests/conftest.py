"""Shared pytest fixtures and helpers.

Environment variables are set BEFORE importing any backend module so the
test run uses an isolated temporary SQLite database and upload directory.
"""
import os
import tempfile

# --- Isolated environment (must happen before backend imports) ----------
_TMP = tempfile.mkdtemp(prefix="urbaneye_test_")
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_TMP, 'urbaneye_test.db')}"
os.environ["JWT_SECRET"] = "urbaneye-test-secret-that-is-longer-than-32-bytes"
os.environ["UPLOAD_DIR"] = os.path.join(_TMP, "uploads")
os.environ.pop("GEMINI_API_KEY", None)  # never hit the real API in tests

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from backend import auth  # noqa: E402
from backend.database import Base, SessionLocal, engine  # noqa: E402
from backend.main import app  # noqa: E402

# A valid 1x1 transparent PNG used as an upload fixture.
PNG_1X1 = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000d4944415478da63fcffff3f0300050001a1c5b8e700"
    "00000049454e44ae426082"
)


@pytest.fixture()
def client():
    """A TestClient with a fresh, empty database for each test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)


def register_user(
    client,
    name: str = "Test User",
    email: str = "user@example.com",
    password: str = "secret123",
) -> dict:
    response = client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": password},
    )
    assert response.status_code == 201, response.text
    return response.json()


def login_user(client, email: str, password: str) -> str:
    response = client.post(
        "/api/auth/login", json={"email": email, "password": password}
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def make_admin(client, email: str = "admin@example.com") -> str:
    """Create an admin account directly in the DB and return a JWT."""
    db = SessionLocal()
    try:
        auth.create_user(db, "Admin", email, "secret123", role="admin")
    finally:
        db.close()
    return login_user(client, email, "secret123")


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def make_report_payload(**overrides) -> dict:
    payload = {
        "category": "Pothole",
        "severity": "High",
        "confidence": 90,
        "description": "Large pothole on the main road.",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "address": "FC Road, Pune",
    }
    payload.update(overrides)
    return payload


def create_report(client, token: str, **overrides):
    """Submit a report with the fixture image and return the response."""
    payload = make_report_payload(**overrides)
    files = {"image": ("sample.png", PNG_1X1, "image/png")}
    data = {key: str(value) for key, value in payload.items() if value is not None}
    return client.post(
        "/api/reports", headers=auth_headers(token), files=files, data=data
    )
