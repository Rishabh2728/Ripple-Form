from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.form import FormCreate, FormResponse
from app.schemas.question import QuestionCreate, QuestionOptionCreate
from app.services.form_service import create_form
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/templates", tags=["Form Templates"])

# Seeded Template Library
TEMPLATES = [
    {
        "id": "customer-satisfaction",
        "title": "Customer Satisfaction Survey (CSAT)",
        "description": "Measure customer happiness and gather actionable product feedback.",
        "category": "Customer Support",
        "questions": [
            {"type": "short_text", "title": "What is your name?", "required": True},
            {"type": "email", "title": "What is your email address?", "required": True},
            {"type": "rating", "title": "How satisfied are you with Ripple overall?", "required": True},
            {"type": "multiple_choice", "title": "Which plan are you currently using?", "required": True, "options": [{"label": "Free Tier", "value": "free"}, {"label": "Pro Plan", "value": "pro"}, {"label": "Enterprise", "value": "enterprise"}]},
            {"type": "nps", "title": "How likely are you to recommend us to a friend or colleague?", "required": True},
            {"type": "long_text", "title": "What feature could we add to improve your experience?", "required": False}
        ]
    },
    {
        "id": "event-registration",
        "title": "Event Registration Form",
        "description": "Collect attendee registrations, meal preferences, and session choices.",
        "category": "Events",
        "questions": [
            {"type": "short_text", "title": "Full Name", "required": True},
            {"type": "email", "title": "Email Address", "required": True},
            {"type": "dropdown", "title": "Select Ticket Type", "required": True, "options": [{"label": "Standard Pass", "value": "standard"}, {"label": "VIP Pass", "value": "vip"}, {"label": "Student Pass", "value": "student"}]},
            {"type": "yes_no", "title": "Will you join the networking lunch?", "required": True},
            {"type": "long_text", "title": "Dietary restrictions or special accommodations", "required": False}
        ]
    },
    {
        "id": "job-application",
        "title": "Job Application Form",
        "description": "Streamline candidate applications and screening questions.",
        "category": "HR & Hiring",
        "questions": [
            {"type": "short_text", "title": "Full Name", "required": True},
            {"type": "email", "title": "Email Address", "required": True},
            {"type": "short_text", "title": "LinkedIn Profile URL", "required": True},
            {"type": "number", "title": "Years of experience in relevant field", "required": True},
            {"type": "long_text", "title": "Why do you want to join our team?", "required": True}
        ]
    },
    {
        "id": "product-research",
        "title": "Product Research Survey",
        "description": "Validate product ideas and understand user pain points.",
        "category": "Product",
        "questions": [
            {"type": "multiple_choice", "title": "How often do you build online forms?", "required": True, "options": [{"label": "Daily", "value": "daily"}, {"label": "Weekly", "value": "weekly"}, {"label": "Monthly", "value": "monthly"}, {"label": "Rarely", "value": "rarely"}]},
            {"type": "rating", "title": "How complex is your current form builder software?", "required": True},
            {"type": "long_text", "title": "What is the biggest frustration with your existing tool?", "required": True}
        ]
    },
    {
        "id": "employee-engagement",
        "title": "Employee Engagement Survey",
        "description": "Gather anonymous feedback on workplace culture and satisfaction.",
        "category": "HR",
        "questions": [
            {"type": "rating", "title": "I feel valued and recognized for my contributions.", "required": True},
            {"type": "rating", "title": "I have the tools and resources I need to do my job well.", "required": True},
            {"type": "yes_no", "title": "Would you recommend our company as a great place to work?", "required": True},
            {"type": "long_text", "title": "What can leadership do to better support your team?", "required": False}
        ]
    },
    {
        "id": "lead-qualification",
        "title": "Lead Qualification Form",
        "description": "Capture high-intent sales leads with qualifying questions.",
        "category": "Sales",
        "questions": [
            {"type": "short_text", "title": "Company Name", "required": True},
            {"type": "email", "title": "Business Email", "required": True},
            {"type": "dropdown", "title": "Company Size", "required": True, "options": [{"label": "1-10 employees", "value": "1-10"}, {"label": "11-50 employees", "value": "11-50"}, {"label": "51-200 employees", "value": "51-200"}, {"label": "201+ employees", "value": "201+"}]},
            {"type": "short_text", "title": "Estimated Monthly Budget ($)", "required": False}
        ]
    },
    {
        "id": "course-feedback",
        "title": "Course & Workshop Feedback",
        "description": "Evaluate instructor effectiveness and course material quality.",
        "category": "Education",
        "questions": [
            {"type": "rating", "title": "Overall quality of the workshop", "required": True},
            {"type": "rating", "title": "Clarity of instructor explanations", "required": True},
            {"type": "yes_no", "title": "Were the course exercises practical and helpful?", "required": True},
            {"type": "long_text", "title": "Key takeaways or suggestions for improvement", "required": False}
        ]
    },
    {
        "id": "website-feedback",
        "title": "Website Feedback Poll",
        "description": "Collect instant visitor feedback on website usability.",
        "category": "UX",
        "questions": [
            {"type": "yes_no", "title": "Did you find what you were looking for today?", "required": True},
            {"type": "rating", "title": "How easy was it to navigate our website?", "required": True},
            {"type": "long_text", "title": "If no, what were you looking for?", "required": False}
        ]
    },
    {
        "id": "market-research",
        "title": "Market Research Survey",
        "description": "Understand target audience demographics and purchasing behavior.",
        "category": "Marketing",
        "questions": [
            {"type": "dropdown", "title": "What is your age range?", "required": True, "options": [{"label": "18-24", "value": "18-24"}, {"label": "25-34", "value": "25-34"}, {"label": "35-44", "value": "35-44"}, {"label": "45+", "value": "45+"}]},
            {"type": "multiple_choice", "title": "Where do you discover new SaaS tools?", "required": True, "options": [{"label": "Social Media (X / LinkedIn)", "value": "social"}, {"label": "Google Search", "value": "google"}, {"label": "Product Hunt", "value": "ph"}, {"label": "Word of Mouth", "value": "referral"}]}
        ]
    },
    {
        "id": "nps-survey",
        "title": "Net Promoter Score (NPS) Survey",
        "description": "Standardized 2-question NPS benchmark survey.",
        "category": "Product",
        "questions": [
            {"type": "nps", "title": "How likely are you to recommend Ripple to a colleague?", "description": "0 = Not likely at all, 10 = Extremely likely", "required": True},
            {"type": "long_text", "title": "What is the primary reason for your score?", "required": False}
        ]
    }
]

@router.get("")
async def get_templates():
    """Retrieve template gallery."""
    return TEMPLATES

@router.post("/{template_id}/use", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
async def use_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Instantiate a new draft form from a pre-built template."""
    tmpl = next((t for t in TEMPLATES if t["id"] == template_id), None)
    if not tmpl:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "TEMPLATE_NOT_FOUND", "message": "Template not found."}}
        )

    q_creates = []
    for idx, q in enumerate(tmpl["questions"]):
        opts = []
        if "options" in q:
            for opt_idx, o in enumerate(q["options"]):
                opts.append(QuestionOptionCreate(label=o["label"], value=o["value"], position=opt_idx))
        q_creates.append(QuestionCreate(
            type=q["type"],
            title=q["title"],
            description=q.get("description"),
            required=q.get("required", False),
            position=idx,
            options=opts
        ))

    form_create = FormCreate(
        title=tmpl["title"],
        description=tmpl["description"],
        questions=q_creates
    )

    return await create_form(db, current_user["id"], current_user["workspace_id"], form_create)
