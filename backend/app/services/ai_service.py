import json
import httpx
from typing import Optional
from app.core.config import settings
from app.schemas.ai import AIGenerateRequest, AIGenerateResponse, AIGeneratedForm
from app.schemas.question import QuestionCreate, QuestionOptionCreate

async def generate_form_with_ai(request: AIGenerateRequest) -> AIGenerateResponse:
    api_key = settings.GROQ_API_KEY or settings.AI_API_KEY

    if not api_key:
        prompt_lower = request.prompt.lower()
        title = "Generated Form"
        description = f"AI Generated Form based on: '{request.prompt}'"

        if "feedback" in prompt_lower or "satisfaction" in prompt_lower or "saas" in prompt_lower:
            title = "Customer Feedback Survey"
            description = "We value your opinion. Help us improve our SaaS product experience."
            questions = [
                QuestionCreate(
                    type="short_text",
                    title="What is your primary goal using our product?",
                    description="Briefly describe what brought you to us.",
                    required=True,
                    position=0
                ),
                QuestionCreate(
                    type="rating",
                    title="How satisfied are you with the platform overall?",
                    description="Rate from 1 to 5 stars.",
                    required=True,
                    position=1
                ),
                QuestionCreate(
                    type="multiple_choice",
                    title="Which feature do you use most frequently?",
                    required=True,
                    position=2,
                    options=[
                        QuestionOptionCreate(label="Form Builder", value="form_builder", position=0),
                        QuestionOptionCreate(label="Analytics Dashboard", value="analytics", position=1),
                        QuestionOptionCreate(label="Integrations", value="integrations", position=2)
                    ]
                ),
                QuestionCreate(
                    type="nps",
                    title="How likely are you to recommend Ripple to a colleague?",
                    description="0 = Not likely, 10 = Extremely likely",
                    required=True,
                    position=3
                ),
                QuestionCreate(
                    type="long_text",
                    title="What is one thing we could do to make your experience better?",
                    required=False,
                    position=4
                ),
                QuestionCreate(
                    type="email",
                    title="Can we contact you regarding your feedback?",
                    description="Leave your email if you'd like follow-up.",
                    required=False,
                    position=5
                )
            ]
        elif "event" in prompt_lower or "registration" in prompt_lower:
            title = "Event Registration Form"
            description = "Register for our upcoming tech summit."
            questions = [
                QuestionCreate(type="short_text", title="Full Name", required=True, position=0),
                QuestionCreate(type="email", title="Work Email Address", required=True, position=1),
                QuestionCreate(
                    type="dropdown",
                    title="Ticket Category",
                    required=True,
                    position=2,
                    options=[
                        QuestionOptionCreate(label="General Admission", value="general", position=0),
                        QuestionOptionCreate(label="VIP Access", value="vip", position=1),
                        QuestionOptionCreate(label="Virtual Stream", value="virtual", position=2)
                    ]
                ),
                QuestionCreate(
                    type="yes_no",
                    title="Will you attend the networking dinner?",
                    required=True,
                    position=3
                )
            ]
        else:
            title = "Custom Feedback Form"
            description = f"Custom form created for: {request.prompt}"
            questions = [
                QuestionCreate(type="short_text", title="Full Name", required=True, position=0),
                QuestionCreate(type="email", title="Email Address", required=True, position=1),
                QuestionCreate(type="rating", title="Overall Rating", required=True, position=2),
                QuestionCreate(type="long_text", title="Any additional comments or questions?", required=False, position=3)
            ]

        return AIGenerateResponse(
            configured=False,
            message="Groq API Key not configured. Generated a standard template matching your prompt.",
            form=AIGeneratedForm(
                title=title,
                description=description,
                questions=questions
            )
        )

    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        system_instruction = (
            "You are a form generation assistant. Respond ONLY with a valid JSON object matching keys: "
            "title (string), description (string), questions (array of objects with type, title, description, required, position, options)."
        )

        payload = {
            "model": settings.AI_MODEL,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": request.prompt}
            ],
            "temperature": 0.2
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload, timeout=20.0)
            if resp.status_code == 200:
                data = resp.json()
                text_content = data["choices"][0]["message"]["content"]
                parsed = json.loads(text_content)
                form_obj = AIGeneratedForm.model_validate(parsed)
                return AIGenerateResponse(configured=True, form=form_obj)
    except Exception:
        pass

    return AIGenerateResponse(
        configured=True,
        message="Groq API request failed; fallback form generated.",
        form=AIGeneratedForm(
            title="AI Feedback Form",
            description="Generated form based on your input.",
            questions=[
                QuestionCreate(type="short_text", title="Your Name", required=True, position=0),
                QuestionCreate(type="email", title="Email Address", required=True, position=1),
                QuestionCreate(type="rating", title="Overall Rating", required=True, position=2),
                QuestionCreate(type="long_text", title="Comments", required=False, position=3)
            ]
        )
    )
