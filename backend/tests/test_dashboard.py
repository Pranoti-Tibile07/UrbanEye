"""Dashboard statistics endpoint tests."""
from .conftest import auth_headers, create_report, make_admin, register_user


def test_public_stats_accessible_without_auth(client):
    response = client.get("/api/stats/public")
    assert response.status_code == 200
    body = response.json()
    assert body["total_reports"] == 0


def test_dashboard_requires_admin(client):
    token = register_user(client, email="cit@example.com")["access_token"]
    response = client.get(
        "/api/dashboard/stats", headers=auth_headers(token)
    )
    assert response.status_code == 403


def test_dashboard_stats_reflect_real_data(client):
    admin_token = make_admin(client)
    citizen_token = register_user(client, email="r@example.com")["access_token"]

    create_report(client, citizen_token, category="Pothole", severity="High")
    create_report(client, citizen_token, category="Garbage", severity="Low")

    response = client.get(
        "/api/dashboard/stats", headers=auth_headers(admin_token)
    )
    assert response.status_code == 200
    body = response.json()

    assert body["total_reports"] == 2
    assert body["category_counts"]["Pothole"] == 1
    assert body["category_counts"]["Garbage"] == 1
    assert body["severity_counts"]["High"] == 1
    assert body["severity_counts"]["Low"] == 1
    assert body["resolved_count"] == 0
    assert len(body["recent_reports"]) == 2

    # After resolving one report, the resolved count updates.
    report_id = body["recent_reports"][0]["id"]
    client.patch(
        f"/api/reports/{report_id}/status",
        headers=auth_headers(admin_token),
        json={"status": "Resolved"},
    )
    updated = client.get(
        "/api/dashboard/stats", headers=auth_headers(admin_token)
    ).json()
    assert updated["resolved_count"] == 1
