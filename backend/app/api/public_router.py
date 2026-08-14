from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.response import ResponseSubmitRequest
from app.services.response_service import get_public_form_by_slug, submit_response

router = APIRouter(prefix="/public", tags=["Public Respondent Experience"])

@router.get("/forms/{slug}")
async def get_public_form(slug: str, db: AsyncSession = Depends(get_db)):
    """Retrieve published form definition for respondent completion."""
    return await get_public_form_by_slug(db, slug)

@router.post("/forms/{slug}/responses", status_code=status.HTTP_201_CREATED)
async def submit_public_response(
    slug: str,
    data: ResponseSubmitRequest,
    db: AsyncSession = Depends(get_db)
):
    """Submit respondent answers to a published form with server-side validation."""
    return await submit_response(db, slug, data)
