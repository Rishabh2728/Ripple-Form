from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse, QuestionReorderRequest
from app.services.question_service import add_question, update_question, delete_question, reorder_questions
from app.api.deps import get_current_active_user

router = APIRouter(tags=["Questions"])

@router.post("/forms/{form_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question_endpoint(
    form_id: str,
    data: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Add a new question to a form."""
    return await add_question(db, form_id, current_user["id"], data)

@router.put("/questions/{question_id}", response_model=QuestionResponse)
@router.patch("/questions/{question_id}", response_model=QuestionResponse)
async def update_question_endpoint(
    question_id: str,
    data: QuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Update question attributes and options."""
    return await update_question(db, question_id, current_user["id"], data)

@router.delete("/questions/{question_id}")
async def delete_question_endpoint(
    question_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Delete a question from a form."""
    return await delete_question(db, question_id, current_user["id"])

@router.post("/forms/{form_id}/questions/reorder", response_model=List[QuestionResponse])
@router.put("/forms/{form_id}/questions/reorder", response_model=List[QuestionResponse])
async def reorder_questions_endpoint(
    form_id: str,
    data: QuestionReorderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Reorder questions within a form."""
    return await reorder_questions(db, form_id, current_user["id"], data)
