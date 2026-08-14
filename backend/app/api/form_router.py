from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.form import FormCreate, FormUpdate, FormResponse, FormHealthResponse, FormPublishResponse
from app.services.form_service import (
    create_form, list_user_forms, verify_form_ownership, update_form,
    publish_form, unpublish_form, duplicate_form, delete_form, check_form_health
)
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/forms", tags=["Forms"])

@router.get("", response_model=List[FormResponse])
async def list_forms(
    status: Optional[str] = Query(None, description="Filter status: draft, published, archived"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """List all forms in the user's workspace."""
    return await list_user_forms(db, current_user["id"], status_filter=status)

@router.post("", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
async def create_new_form(
    data: FormCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Create a new form within creator's workspace."""
    return await create_form(db, current_user["id"], current_user["workspace_id"], data)

@router.get("/{form_id}", response_model=FormResponse)
async def get_form(
    form_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Get single form details including all questions and options."""
    return await verify_form_ownership(db, form_id, current_user["id"])

@router.patch("/{form_id}", response_model=FormResponse)
async def update_form_details(
    form_id: str,
    data: FormUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Update form attributes (title, description, settings, theme, thank-you screen)."""
    return await update_form(db, form_id, current_user["id"], data)

@router.delete("/{form_id}")
async def delete_or_archive_form(
    form_id: str,
    archive: bool = Query(False, description="Set True to archive instead of permanent deletion"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Archive or permanently delete a form."""
    return await delete_form(db, form_id, current_user["id"], archive_only=archive)

@router.post("/{form_id}/duplicate", response_model=FormResponse)
async def duplicate_existing_form(
    form_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Duplicate form definition (questions, options, theme) into a new draft form."""
    return await duplicate_form(db, form_id, current_user["id"])

@router.get("/{form_id}/health", response_model=FormHealthResponse)
async def get_form_health(
    form_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Run pre-publish health audit on form."""
    form = await verify_form_ownership(db, form_id, current_user["id"])
    return await check_form_health(form)

@router.post("/{form_id}/publish", response_model=FormPublishResponse)
async def publish_form_endpoint(
    form_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Validate and publish form, creating an immutable version snapshot."""
    return await publish_form(db, form_id, current_user["id"])

@router.post("/{form_id}/unpublish", response_model=FormResponse)
async def unpublish_form_endpoint(
    form_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    """Unpublish form and revert status to draft."""
    return await unpublish_form(db, form_id, current_user["id"])
