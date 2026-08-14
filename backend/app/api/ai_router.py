from fastapi import APIRouter
from app.schemas.ai import AIGenerateRequest, AIGenerateResponse
from app.services.ai_service import generate_form_with_ai

router = APIRouter(prefix="/ai", tags=["AI Form Generation"])

@router.post("/generate-form", response_model=AIGenerateResponse)
async def generate_form(request: AIGenerateRequest):
    """Generate structured form JSON from natural language prompt."""
    return await generate_form_with_ai(request)
