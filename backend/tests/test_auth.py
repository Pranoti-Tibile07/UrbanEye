"""Authentication endpoint tests."""
from .conftest import auth_headers, login_user, register_user


def test_register_returns_token_and_citizen_role(client):
    body = register_user(client, email="new@example.com")
    assert body["access_token"]
    assert body["token_type"] == "bearer"
    assert body["user"]["role"] == "citizen"
    assert body["user"]["email"] == "new@example.com"


def test_register_duplicate_email_conflict(client):
    register_user(client, email="dup@example.com")
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Other",
            "email": "dup@example.com",
            "password": "secret123",
        },
    )
    assert response.status_code == 409


def test_register_short_password_rejected(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "Short", "email": "short@example.com", "password": "123"},
    )
    assert response.status_code == 422


def test_login_success(client):
    register_user(client, email="login@example.com", password="secret123")
    token = login_user(client, "login@example.com", "secret123")
    assert token


def test_login_wrong_password_unauthorized(client):
    register_user(client, email="wrong@example.com", password="secret123")
    response = client.post(
        "/api/auth/login",
        json={"email": "wrong@example.com", "password": "nope-nope"},
    )
    assert response.status_code == 401


def test_me_requires_token(client):
    assert client.get("/api/auth/me").status_code == 401


def test_me_returns_current_user(client):
    body = register_user(client, email="me@example.com")
    response = client.get(
        "/api/auth/me", headers=auth_headers(body["access_token"])
    )
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


def test_me_with_invalid_token_rejected(client):
    response = client.get(
        "/api/auth/me", headers=auth_headers("not-a-real-token")
    )
    assert response.status_code == 401
