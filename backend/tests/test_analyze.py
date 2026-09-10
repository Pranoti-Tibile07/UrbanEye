"""AI analysis endpoint tests (skipped unless a Gemini key is present)."""
import os

import pytest

from .conftest import PNG_1X1, auth_headers, register_user


def test_analyze_endpoint(client):
    if not os.getenv("GEMINI_API_KEY"):
        pytest.skip("GEMINI_API_KEY not set; skipping live AI endpoint test")

    token = register_user(client, email="ai@example.com")["access_token"]
    response = client.post(
        "/api/analyze",
        headers=auth_headers(token),
        files={"image": ("sample.png", PNG_1X1, "image/png")},
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["category"]
    assert body["severity"] in ("Low", "Medium", "High")
    assert 0 <= body["confidence"] <= 100


def test_analyze_endpoint_requires_auth(client):
    response = client.post(
        "/api/analyze", files={"image": ("sample.png", PNG_1X1, "image/png")}
    )
    assert response.status_code == 401


def test_analyze_reports_missing_key_gracefully(client):
    if os.getenv("GEMINI_API_KEY"):
        pytest.skip("GEMINI_API_KEY is set; skipping no-key test")

    token = register_user(client, email="nokey@example.com")["access_token"]
    response = client.post(
        "/api/analyze",
        headers=auth_headers(token),
        files={"image": ("sample.png", PNG_1X1, "image/png")},
    )
    # Without a key the endpoint must fail cleanly, not leak a stack trace.
    assert response.status_code == 503
    assert "GEMINI_API_KEY" in response.json()["detail"]
