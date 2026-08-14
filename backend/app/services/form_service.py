import re
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.models import Form, Question, QuestionOption, FormVersion, FormEvent, Response, Workspace
from app.schemas.form import FormCreate, FormUpdate, FormHealthResponse, FormHealthIssue, FormPublishResponse

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text or "form"

async def generate_unique_slug(db: AsyncSession, title: str, exclude_form_id: Optional[str] = None) -> str:
    base_slug = slugify(title)
    candidate = base_slug
    counter = 1

    while True:
        stmt = select(Form).where(Form.slug == candidate)
        if exclude_form_id:
            stmt = stmt.where(Form.id != exclude_form_id)
        res = await db.execute(stmt)
        if not res.scalar_one_or_none():
            return candidate
        counter += 1
        candidate = f"{base_slug}-{counter}"

async def verify_form_ownership(db: AsyncSession, form_id: str, user_id: str) -> Form:
    stmt = (
        select(Form)
        .join(Workspace)
        .where(Form.id == form_id, Workspace.owner_id == user_id)
        .options(
            selectinload(Form.questions).selectinload(Question.options),
            selectinload(Form.versions)
        )
    )
    res = await db.execute(stmt)
    form = res.scalar_one_or_none()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "FORM_NOT_FOUND", "message": "Form not found or access denied."}}
        )
    return form

async def create_form(db: AsyncSession, user_id: str, workspace_id: str, data: FormCreate) -> Form:
    # Verify workspace ownership
    ws_stmt = select(Workspace).where(Workspace.id == workspace_id, Workspace.owner_id == user_id)
    ws_res = await db.execute(ws_stmt)
    ws = ws_res.scalar_one_or_none()
    if not ws:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": {"code": "FORBIDDEN", "message": "Invalid workspace or permission denied."}}
        )

    slug = data.slug if data.slug else await generate_unique_slug(db, data.title)

    form = Form(
        workspace_id=workspace_id,
        title=data.title,
        description=data.description,
        slug=slug,
        status="draft",
        theme_id=data.theme_id,
        theme_data=data.theme_data,
        thank_you_title=data.thank_you_title,
        thank_you_message=data.thank_you_message,
        allow_back_navigation=data.allow_back_navigation,
        show_progress=data.show_progress,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(form)
    await db.flush()

    if data.questions:
        for idx, q_data in enumerate(data.questions):
            q = Question(
                form_id=form.id,
                type=q_data.type,
                title=q_data.title,
                description=q_data.description,
                required=q_data.required,
                position=q_data.position if q_data.position is not None else idx,
                settings_json=q_data.settings_json,
                created_at=datetime.now(timezone.utc)
            )
            db.add(q)
            await db.flush()
            if q_data.options:
                for opt_idx, opt in enumerate(q_data.options):
                    o = QuestionOption(
                        question_id=q.id,
                        label=opt.label,
                        value=opt.value,
                        position=opt.position if opt.position is not None else opt_idx
                    )
                    db.add(o)

    # Log event
    event = FormEvent(
        form_id=form.id,
        event_type="FORM_CREATED",
        metadata_json={"title": form.title}
    )
    db.add(event)
    await db.commit()

    return await verify_form_ownership(db, form.id, user_id)

async def list_user_forms(db: AsyncSession, user_id: str, status_filter: Optional[str] = None) -> List[dict]:
    # Find user workspace
    ws_stmt = select(Workspace.id).where(Workspace.owner_id == user_id)
    ws_res = await db.execute(ws_stmt)
    ws_ids = ws_res.scalars().all()
    if not ws_ids:
        return []

    stmt = select(Form).where(Form.workspace_id.in_(ws_ids))
    if status_filter and status_filter.lower() != "all":
        stmt = stmt.where(Form.status == status_filter.lower())

    stmt = stmt.order_by(Form.updated_at.desc()).options(
        selectinload(Form.questions),
        selectinload(Form.responses)
    )
    res = await db.execute(stmt)
    forms = res.scalars().all()

    result = []
    for f in forms:
        result.append({
            "id": f.id,
            "workspace_id": f.workspace_id,
            "title": f.title,
            "description": f.description,
            "slug": f.slug,
            "status": f.status,
            "theme_id": f.theme_id,
            "theme_data": f.theme_data,
            "thank_you_title": f.thank_you_title,
            "thank_you_message": f.thank_you_message,
            "allow_back_navigation": f.allow_back_navigation,
            "show_progress": f.show_progress,
            "created_at": f.created_at,
            "updated_at": f.updated_at,
            "published_at": f.published_at,
            "question_count": len(f.questions),
            "response_count": len([r for r in f.responses if r.status == "completed"]),
            "questions": []
        })
    return result

async def update_form(db: AsyncSession, form_id: str, user_id: str, data: FormUpdate) -> Form:
    form = await verify_form_ownership(db, form_id, user_id)

    if data.title is not None and data.title != form.title:
        form.title = data.title
        if data.slug is None:
            form.slug = await generate_unique_slug(db, data.title, exclude_form_id=form.id)

    if data.slug is not None and data.slug != form.slug:
        form.slug = await generate_unique_slug(db, data.slug, exclude_form_id=form.id)

    if data.description is not None:
        form.description = data.description
    if data.status is not None:
        form.status = data.status
    if data.theme_id is not None:
        form.theme_id = data.theme_id
    if data.theme_data is not None:
        form.theme_data = data.theme_data
    if data.thank_you_title is not None:
        form.thank_you_title = data.thank_you_title
    if data.thank_you_message is not None:
        form.thank_you_message = data.thank_you_message
    if data.allow_back_navigation is not None:
        form.allow_back_navigation = data.allow_back_navigation
    if data.show_progress is not None:
        form.show_progress = data.show_progress

    form.updated_at = datetime.now(timezone.utc)

    event = FormEvent(
        form_id=form.id,
        event_type="FORM_UPDATED",
        metadata_json={"updated_fields": list(data.model_dump(exclude_unset=True).keys())}
    )
    db.add(event)
    await db.commit()

    return await verify_form_ownership(db, form.id, user_id)

async def check_form_health(form: Form) -> FormHealthResponse:
    issues: List[FormHealthIssue] = []

    if not form.title or not form.title.strip():
        issues.append(FormHealthIssue(issue="Form title cannot be empty."))

    if not form.questions:
        issues.append(FormHealthIssue(issue="Form must have at least one question before publishing."))
    else:
        for idx, q in enumerate(form.questions, start=1):
            if not q.title or not q.title.strip():
                issues.append(FormHealthIssue(
                    question_id=q.id,
                    question_title=f"Question {idx}",
                    issue=f"Question {idx} has an empty title."
                ))
            
            if q.type in ["multiple_choice", "dropdown"]:
                if not q.options:
                    issues.append(FormHealthIssue(
                        question_id=q.id,
                        question_title=q.title or f"Question {idx}",
                        issue=f"Question {idx} ('{q.type}') has no choices defined."
                    ))
                else:
                    opt_values = set()
                    for opt in q.options:
                        if not opt.label or not opt.label.strip():
                            issues.append(FormHealthIssue(
                                question_id=q.id,
                                question_title=q.title or f"Question {idx}",
                                issue=f"Question {idx} contains a choice with an empty label."
                            ))
                        if opt.value in opt_values:
                            issues.append(FormHealthIssue(
                                question_id=q.id,
                                question_title=q.title or f"Question {idx}",
                                issue=f"Question {idx} contains duplicate choice values ('{opt.value}')."
                            ))
                        opt_values.add(opt.value)

    return FormHealthResponse(is_valid=len(issues) == 0, issues=issues)

async def publish_form(db: AsyncSession, form_id: str, user_id: str) -> FormPublishResponse:
    form = await verify_form_ownership(db, form_id, user_id)

    # Form health check
    health = await check_form_health(form)
    if not health.is_valid:
        first_issue = health.issues[0].issue
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "UNHEALTHY_FORM", "message": f"Cannot publish: {first_issue}", "issues": [i.model_dump() for i in health.issues]}}
        )

    # Determine next version number
    version_stmt = select(func.max(FormVersion.version_number)).where(FormVersion.form_id == form.id)
    version_res = await db.execute(version_stmt)
    max_ver = version_res.scalar_one_or_none()
    next_ver = (max_ver or 0) + 1

    # Build immutable snapshot payload
    snapshot = {
        "form_id": form.id,
        "title": form.title,
        "description": form.description,
        "slug": form.slug,
        "theme_id": form.theme_id,
        "theme_data": form.theme_data,
        "thank_you_title": form.thank_you_title,
        "thank_you_message": form.thank_you_message,
        "allow_back_navigation": form.allow_back_navigation,
        "show_progress": form.show_progress,
        "published_at": datetime.now(timezone.utc).isoformat(),
        "version_number": next_ver,
        "questions": [
            {
                "id": q.id,
                "type": q.type,
                "title": q.title,
                "description": q.description,
                "required": q.required,
                "position": q.position,
                "settings_json": q.settings_json or {},
                "options": [
                    {
                        "id": opt.id,
                        "label": opt.label,
                        "value": opt.value,
                        "position": opt.position
                    } for opt in q.options
                ]
            } for q in form.questions
        ]
    }

    form_version = FormVersion(
        form_id=form.id,
        version_number=next_ver,
        snapshot_json=snapshot,
        created_at=datetime.now(timezone.utc),
        published_at=datetime.now(timezone.utc)
    )
    db.add(form_version)

    form.status = "published"
    form.published_at = datetime.now(timezone.utc)
    form.updated_at = datetime.now(timezone.utc)

    event = FormEvent(
        form_id=form.id,
        event_type="FORM_PUBLISHED",
        metadata_json={"version": next_ver, "slug": form.slug}
    )
    db.add(event)
    await db.commit()

    return FormPublishResponse(
        status=form.status,
        slug=form.slug,
        version_number=next_ver,
        published_at=form.published_at
    )

async def unpublish_form(db: AsyncSession, form_id: str, user_id: str) -> Form:
    form = await verify_form_ownership(db, form_id, user_id)
    form.status = "draft"
    form.updated_at = datetime.now(timezone.utc)

    event = FormEvent(
        form_id=form.id,
        event_type="FORM_UNPUBLISHED",
        metadata_json={"slug": form.slug}
    )
    db.add(event)
    await db.commit()

    return form

async def duplicate_form(db: AsyncSession, form_id: str, user_id: str) -> Form:
    original = await verify_form_ownership(db, form_id, user_id)
    new_title = f"{original.title} (Copy)"
    new_slug = await generate_unique_slug(db, new_title)

    new_form = Form(
        workspace_id=original.workspace_id,
        title=new_title,
        description=original.description,
        slug=new_slug,
        status="draft",
        theme_id=original.theme_id,
        theme_data=original.theme_data,
        thank_you_title=original.thank_you_title,
        thank_you_message=original.thank_you_message,
        allow_back_navigation=original.allow_back_navigation,
        show_progress=original.show_progress,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(new_form)
    await db.flush()

    for q in original.questions:
        new_q = Question(
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            position=q.position,
            settings_json=q.settings_json,
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_q)
        await db.flush()
        for opt in q.options:
            new_opt = QuestionOption(
                question_id=new_q.id,
                label=opt.label,
                value=opt.value,
                position=opt.position
            )
            db.add(new_opt)

    event = FormEvent(
        form_id=new_form.id,
        event_type="FORM_CREATED",
        metadata_json={"duplicated_from": original.id}
    )
    db.add(event)
    await db.commit()

    return await verify_form_ownership(db, new_form.id, user_id)

async def delete_form(db: AsyncSession, form_id: str, user_id: str, archive_only: bool = False) -> dict:
    form = await verify_form_ownership(db, form_id, user_id)

    if archive_only:
        form.status = "archived"
        form.updated_at = datetime.now(timezone.utc)
        await db.commit()
        return {"message": "Form archived successfully."}
    else:
        await db.delete(form)
        await db.commit()
        return {"message": "Form deleted permanently."}
