from typing import Optional
from fastapi import APIRouter, Depends, Query, Response as FastAPIResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.response import ResponseListResponse, IndividualResponseView
from app.schemas.analytics import FormAnalyticsResponse
from app.services.response_service import (
    list_form_responses, get_individual_response, calculate_form_analytics, export_responses_csv
)
from app.api.deps import get_current_active_user

router = APIRouter(tags=["Responses & Analytics"])

@router.get("/forms/{form_id}/responses", response_model=ResponseListResponse)
async def get_responses_list(
    form_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """List paginated completed responses for a form."""
    return await list_form_responses(db, form_id, current_user["id"], page=page, page_size=page_size, search=search)

@router.get("/responses/{response_id}", response_model=IndividualResponseView)
async def get_response_detail(
    response_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get individual submission detail with snapshot questions."""
    return await get_individual_response(db, response_id, current_user["id"])

@router.get("/forms/{form_id}/analytics", response_model=FormAnalyticsResponse)
async def get_analytics(
    form_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get aggregated analytics, completion rates, and question statistics."""
    return await calculate_form_analytics(db, form_id, current_user["id"])

@router.get("/forms/{form_id}/responses/export")
async def export_csv(
    form_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Export responses as an RFC4180 CSV file."""
    result = await export_responses_csv(db, form_id, current_user["id"])
    return FastAPIResponse(
        content=result["content"],
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={result['filename']}"}
    )
