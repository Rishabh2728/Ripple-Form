from pydantic import BaseModel
from typing import List, Optional
from app.schemas.question import QuestionCreate

class AIGenerateRequest(BaseModel):
    prompt: str

class AIGeneratedForm(BaseModel):
    title: str
    description: str
    questions: List[QuestionCreate]

class AIGenerateResponse(BaseModel):
    configured: bool
    message: Optional[str] = None
    form: Optional[AIGeneratedForm] = None
