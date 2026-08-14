import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_form_crud_and_publishing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register user
        reg_res = await ac.post("/api/auth/register", json={
            "name": "Form Tester",
            "email": "formtester@example.com",
            "password": "password123"
        })
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create Form
        create_res = await ac.post("/api/forms", headers=headers, json={
            "title": "Customer Feedback Form",
            "description": "Please give us your thoughts.",
            "questions": [
                {
                    "type": "short_text",
                    "title": "What is your name?",
                    "required": True,
                    "position": 0
                },
                {
                    "type": "multiple_choice",
                    "title": "Which feature do you like?",
                    "required": True,
                    "position": 1,
                    "options": [
                        {"label": "Builder", "value": "builder", "position": 0},
                        {"label": "Analytics", "value": "analytics", "position": 1}
                    ]
                }
            ]
        })
        assert create_res.status_code == 201
        form_data = create_res.json()
        form_id = form_data["id"]
        assert form_data["title"] == "Customer Feedback Form"
        assert len(form_data["questions"]) == 2

        # Health Check
        health_res = await ac.get(f"/api/forms/{form_id}/health", headers=headers)
        assert health_res.status_code == 200
        assert health_res.json()["is_valid"] is True

        # Publish Form
        pub_res = await ac.post(f"/api/forms/{form_id}/publish", headers=headers)
        assert pub_res.status_code == 200
        assert pub_res.json()["status"] == "published"
        assert pub_res.json()["version_number"] == 1

        # Duplicate Form
        dup_res = await ac.post(f"/api/forms/{form_id}/duplicate", headers=headers)
        assert dup_res.status_code == 200
        assert dup_res.json()["title"] == "Customer Feedback Form (Copy)"
        assert dup_res.json()["status"] == "draft"
