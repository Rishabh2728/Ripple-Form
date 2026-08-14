import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_full_end_to_end_saas_journey():
    """
    E2E Test Journey:
    1. Register new creator user
    2. Create form with multiple question types (short_text, multiple_choice, rating, nps, email)
    3. Run form health check
    4. Publish form -> receive public slug
    5. Open public respondent form endpoint
    6. Submit valid response answers
    7. Creator views response list & individual submission details
    8. Creator views computed analytics
    9. Creator exports responses CSV
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Step 1: Register creator
        reg_res = await ac.post("/api/auth/register", json={
            "name": "E2E Creator",
            "email": "e2e.creator@ripple.com",
            "password": "productionpassword123"
        })
        assert reg_res.status_code == 201
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Step 2: Create Form
        form_res = await ac.post("/api/forms", headers=headers, json={
            "title": "E2E Product Experience Survey",
            "description": "Evaluating end-to-end user satisfaction.",
            "slug": "e2e-product-experience",
            "theme_id": "burgundy",
            "questions": [
                {
                    "type": "short_text",
                    "title": "What is your name?",
                    "required": True,
                    "position": 0
                },
                {
                    "type": "email",
                    "title": "What is your work email?",
                    "required": True,
                    "position": 1
                },
                {
                    "type": "multiple_choice",
                    "title": "What is your role?",
                    "required": True,
                    "position": 2,
                    "options": [
                        {"label": "Engineer", "value": "engineer", "position": 0},
                        {"label": "Designer", "value": "designer", "position": 1},
                        {"label": "Product Manager", "value": "pm", "position": 2}
                    ]
                },
                {
                    "type": "rating",
                    "title": "Rate our product onboarding",
                    "required": True,
                    "position": 3
                },
                {
                    "type": "nps",
                    "title": "How likely are you to recommend us?",
                    "required": True,
                    "position": 4
                }
            ]
        })
        assert form_res.status_code == 201
        form_data = form_res.json()
        form_id = form_data["id"]
        q_ids = [q["id"] for q in form_data["questions"]]

        # Step 3: Health check
        health_res = await ac.get(f"/api/forms/{form_id}/health", headers=headers)
        assert health_res.status_code == 200
        assert health_res.json()["is_valid"] is True

        # Step 4: Publish
        pub_res = await ac.post(f"/api/forms/{form_id}/publish", headers=headers)
        assert pub_res.status_code == 200
        assert pub_res.json()["status"] == "published"

        # Step 5: Open public form definition
        public_form_res = await ac.get("/api/public/forms/e2e-product-experience")
        assert public_form_res.status_code == 200
        assert len(public_form_res.json()["questions"]) == 5

        # Step 6: Submit response anonymously
        submit_res = await ac.post("/api/public/forms/e2e-product-experience/responses", json={
            "respondent_token": "e2e-respondent-token-999",
            "answers": [
                {"question_id": q_ids[0], "value": "Jordan Smith"},
                {"question_id": q_ids[1], "value": "jordan@example.com"},
                {"question_id": q_ids[2], "value": "engineer"},
                {"question_id": q_ids[3], "value": 5},
                {"question_id": q_ids[4], "value": 10}
            ],
            "completion_time_seconds": 38
        })
        assert submit_res.status_code == 201
        response_id = submit_res.json()["response_id"]

        # Step 7: Retrieve responses list & detail
        list_res = await ac.get(f"/api/forms/{form_id}/responses", headers=headers)
        assert list_res.status_code == 200
        assert list_res.json()["total"] == 1

        detail_res = await ac.get(f"/api/responses/{response_id}", headers=headers)
        assert detail_res.status_code == 200
        assert len(detail_res.json()["answers"]) == 5

        # Step 8: View Analytics
        an_res = await ac.get(f"/api/forms/{form_id}/analytics", headers=headers)
        assert an_res.status_code == 200
        analytics = an_res.json()
        assert analytics["total_completed"] == 1
        assert analytics["questions"][4]["nps_score"] == 100.0  # 10 is Promoter -> 100%

        # Step 9: Export CSV
        csv_res = await ac.get(f"/api/forms/{form_id}/responses/export", headers=headers)
        assert csv_res.status_code == 200
        assert "Jordan Smith" in csv_res.text
