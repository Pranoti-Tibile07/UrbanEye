"""Report endpoint tests (creation, retrieval, permissions, validation)."""
from backend import config

from .conftest import (
    PNG_1X1,
    auth_headers,
    create_report,
    make_admin,
    register_user,
)


def test_create_report_success(client):
    token = register_user(client, email="creator@example.com")["access_token"]
    response = create_report(client, token)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["category"] == "Pothole"
    assert body["severity"] == "High"
    assert body["status"] == "Submitted"
    assert body["image_url"].startswith("/uploads/")
    # Priority derived server-side: high severity + 90% confidence.
    assert 60 <= body["priority_score"] <= 100


def test_create_report_requires_auth(client):
    response = client.post("/api/reports")
    assert response.status_code == 401


def test_create_report_rejects_invalid_category(client):
    token = register_user(client, email="badcat@example.com")["access_token"]
    response = create_report(client, token, category="Aliens")
    assert response.status_code == 422


def test_create_report_rejects_invalid_severity(client):
    token = register_user(client, email="badsev@example.com")["access_token"]
    response = create_report(client, token, severity="Catastrophic")
    assert response.status_code == 422


def test_create_report_rejects_invalid_coordinates(client):
    token = register_user(client, email="badlat@example.com")["access_token"]
    response = create_report(client, token, latitude=200.0)
    assert response.status_code == 422


def test_create_report_rejects_non_image_file(client):
    token = register_user(client, email="badtxt@example.com")["access_token"]
    files = {"image": ("notes.txt", b"hello world", "text/plain")}
    data = {
        "category": "Pothole",
        "severity": "Medium",
        "confidence": "50",
        "description": "x",
    }
    response = client.post(
        "/api/reports", headers=auth_headers(token), files=files, data=data
    )
    assert response.status_code == 400


def test_create_report_rejects_oversized_file(client, monkeypatch):
    monkeypatch.setattr(config, "MAX_UPLOAD_BYTES", 10)
    token = register_user(client, email="bigfile@example.com")["access_token"]
    files = {"image": ("big.png", PNG_1X1, "image/png")}
    data = {
        "category": "Pothole",
        "severity": "Medium",
        "confidence": "50",
        "description": "x",
    }
    response = client.post(
        "/api/reports", headers=auth_headers(token), files=files, data=data
    )
    assert response.status_code == 413


def test_citizen_sees_only_own_reports(client):
    token_a = register_user(client, email="a@example.com")["access_token"]
    token_b = register_user(client, email="b@example.com")["access_token"]
    create_report(client, token_a, description="A's report")
    create_report(client, token_b, description="B's report")

    response = client.get("/api/reports", headers=auth_headers(token_a))
    assert response.status_code == 200
    descriptions = [r["description"] for r in response.json()]
    assert descriptions == ["A's report"]


def test_get_report_detail_and_ownership(client):
    token_a = register_user(client, email="owner@example.com")["access_token"]
    token_b = register_user(client, email="other@example.com")["access_token"]
    created = create_report(client, token_a).json()

    # Owner can read their report.
    response = client.get(
        f"/api/reports/{created['id']}", headers=auth_headers(token_a)
    )
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]

    # Another citizen cannot read it (treated as not found).
    response = client.get(
        f"/api/reports/{created['id']}", headers=auth_headers(token_b)
    )
    assert response.status_code == 404


def test_citizen_cannot_update_status(client):
    token = register_user(client, email="pleb@example.com")["access_token"]
    report_id = create_report(client, token).json()["id"]
    response = client.patch(
        f"/api/reports/{report_id}/status",
        headers=auth_headers(token),
        json={"status": "Resolved"},
    )
    assert response.status_code == 403


def test_admin_can_update_status(client):
    admin_token = make_admin(client)
    citizen_token = register_user(client, email="cit@example.com")["access_token"]
    report_id = create_report(client, citizen_token).json()["id"]

    response = client.patch(
        f"/api/reports/{report_id}/status",
        headers=auth_headers(admin_token),
        json={"status": "In Progress"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "In Progress"


def test_admin_cannot_set_invalid_status(client):
    admin_token = make_admin(client)
    citizen_token = register_user(client, email="cit2@example.com")["access_token"]
    report_id = create_report(client, citizen_token).json()["id"]

    response = client.patch(
        f"/api/reports/{report_id}/status",
        headers=auth_headers(admin_token),
        json={"status": "Destroyed"},
    )
    assert response.status_code == 422


def test_admin_sees_all_reports(client):
    admin_token = make_admin(client)
    create_report(client, admin_token, description="admin report")
    citizen_token = register_user(client, email="y@example.com")["access_token"]
    create_report(client, citizen_token, description="citizen report")

    response = client.get("/api/reports", headers=auth_headers(admin_token))
    assert response.status_code == 200
    assert len(response.json()) == 2
