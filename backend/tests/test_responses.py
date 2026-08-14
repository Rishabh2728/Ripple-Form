import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_public_response_submission_validation_and_analytics():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register and setup published form
        reg_res = await ac.post("/api/auth/register", json={
            "name": "Respondent Tester",
            "email": "resptester@example.com",
            "password": "password123"
        })
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        create_res = await ac.post("/api/forms", headers=headers, json={
            "title": "Public Survey Test",
            "slug": "public-survey-test",
            "questions": [
                {"type": "short_text", "title": "Your Name", "required": True, "position": 0},
                {"type": "email", "title": "Email Address", "required": True, "position": 1},
                {"type": "rating", "title": "Overall Score", "required": True, "position": 2}
            ]
        })
        form_data = create_res.json()
        form_id = form_data["id"]
        q1_id = form_data["questions"][0]["id"]
        q2_id = form_data["questions"][1]["id"]
        q3_id = form_data["questions"][2]["id"]

        # Publish form
        await ac.post(f"/api/forms/{form_id}/publish", headers=headers)

        # Get public form definition
        pub_res = await ac.get("/api/public/forms/public-survey-test")
        assert pub_res.status_code == 200
        assert pub_res.json()["title"] == "Public Survey Test"

        # Invalid Submission (invalid email format)
        bad_submit = await ac.post("/api/public/forms/public-survey-test/responses", json={
            "respondent_token": "token-123",
            "answers": [
                {"question_id": q1_id, "value": "John Doe"},
                {"question_id": q2_id, "value": "not-an-email"},
                {"question_id": q3_id, "value": 5}
            ]
        })
        assert bad_submit.status_code == 422

        # Valid Submission
        good_submit = await ac.post("/api/public/forms/public-survey-test/responses", json={
            "respondent_token": "token-123",
            "answers": [
                {"question_id": q1_id, "value": "John Doe"},
                {"question_id": q2_id, "value": "john@example.com"},
                {"question_id": q3_id, "value": 5}
            ],
            "completion_time_seconds": 45
        })
        assert good_submit.status_code == 201
        resp_id = good_submit.json()["response_id"]

        # Fetch Analytics
        analytics_res = await ac.get(f"/api/forms/{form_id}/analytics", headers=headers)
        assert analytics_res.status_code == 200
        an_data = analytics_res.json()
        assert an_data["total_completed"] == 1
        assert an_data["questions"][2]["average_score"] == 5.0

        # Export CSV
        csv_res = await ac.get(f"/api/forms/{form_id}/responses/export", headers=headers)
        assert csv_res.status_code == 200
        assert "text/csv" in csv_res.headers["content-type"]
        assert "John Doe" in csv_res.text
