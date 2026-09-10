"""Health endpoint tests."""


def test_health_ok(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "UrbanEye API"
    # In the test environment no API key is set, so AI is not configured.
    assert body["ai_configured"] is False
