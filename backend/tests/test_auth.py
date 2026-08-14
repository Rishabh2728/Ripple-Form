import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_register_and_login_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register
        reg_payload = {
            "name": "Test User",
            "email": "testuser@example.com",
            "password": "securepassword123"
        }
        res = await ac.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "testuser@example.com"
        assert "workspace_id" in data["user"]

        # Duplicate register should fail
        res_dup = await ac.post("/api/auth/register", json=reg_payload)
        assert res_dup.status_code == 400

        # Login
        login_payload = {
            "email": "testuser@example.com",
            "password": "securepassword123"
        }
        res_login = await ac.post("/api/auth/login", json=login_payload)
        assert res_login.status_code == 200
        token = res_login.json()["access_token"]

        # Get me
        res_me = await ac.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res_me.status_code == 200
        assert res_me.json()["email"] == "testuser@example.com"
