from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.models import Question, QuestionOption, FormEvent
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionReorderRequest
from app.services.form_service import verify_form_ownership

async def add_question(db: AsyncSession, form_id: str, user_id: str, data: QuestionCreate) -> Question:
    form = await verify_form_ownership(db, form_id, user_id)

    # Determine position if not provided
    if data.position is None or data.position == 0:
        pos_stmt = select(func.max(Question.position)).where(Question.form_id == form_id)
        pos_res = await db.execute(pos_stmt)
        max_pos = pos_res.scalar_one_or_none()
        pos = (max_pos + 1) if max_pos is not None else 0
    else:
        pos = data.position

    q = Question(
        form_id=form_id,
        type=data.type,
        title=data.title,
        description=data.description,
        required=data.required,
        position=pos,
        settings_json=data.settings_json,
        created_at=datetime.now(timezone.utc)
    )
    db.add(q)
    await db.flush()

    if data.options:
        for idx, opt in enumerate(data.options):
            o = QuestionOption(
                question_id=q.id,
                label=opt.label,
                value=opt.value,
                position=opt.position if opt.position is not None else idx
            )
            db.add(o)

    # Event
    event = FormEvent(
        form_id=form_id,
        event_type="QUESTION_ADDED",
        metadata_json={"question_id": q.id, "type": q.type}
    )
    db.add(event)
    await db.commit()

    # Refetch question with options
    stmt = select(Question).where(Question.id == q.id).options(selectinload(Question.options))
    res = await db.execute(stmt)
    return res.scalar_one()

async def update_question(db: AsyncSession, question_id: str, user_id: str, data: QuestionUpdate) -> Question:
    # First find question to get form_id
    q_stmt = select(Question).where(Question.id == question_id).options(selectinload(Question.options))
    res = await db.execute(q_stmt)
    q = res.scalar_one_or_none()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "QUESTION_NOT_FOUND", "message": "Question not found."}}
        )

    # Ownership check
    await verify_form_ownership(db, q.form_id, user_id)

    if data.type is not None:
        q.type = data.type
    if data.title is not None:
        q.title = data.title
    if data.description is not None:
        q.description = data.description
    if data.required is not None:
        q.required = data.required
    if data.position is not None:
        q.position = data.position
    if data.settings_json is not None:
        q.settings_json = data.settings_json

    q.updated_at = datetime.now(timezone.utc)

    if data.options is not None:
        # Clear existing options and add new
        await db.execute(delete(QuestionOption).where(QuestionOption.question_id == q.id))
        await db.flush()
        for idx, opt in enumerate(data.options):
            o = QuestionOption(
                question_id=q.id,
                label=opt.label,
                value=opt.value,
                position=opt.position if opt.position is not None else idx
            )
            db.add(o)

    event = FormEvent(
        form_id=q.form_id,
        event_type="QUESTION_UPDATED",
        metadata_json={"question_id": q.id}
    )
    db.add(event)
    await db.commit()

    # Reload
    res = await db.execute(select(Question).where(Question.id == q.id).options(selectinload(Question.options)))
    return res.scalar_one()

async def delete_question(db: AsyncSession, question_id: str, user_id: str) -> dict:
    q_stmt = select(Question).where(Question.id == question_id)
    res = await db.execute(q_stmt)
    q = res.scalar_one_or_none()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "QUESTION_NOT_FOUND", "message": "Question not found."}}
        )

    form_id = q.form_id
    await verify_form_ownership(db, form_id, user_id)

    await db.delete(q)
    event = FormEvent(
        form_id=form_id,
        event_type="QUESTION_DELETED",
        metadata_json={"question_id": question_id}
    )
    db.add(event)
    await db.commit()

    return {"message": "Question deleted."}

async def reorder_questions(db: AsyncSession, form_id: str, user_id: str, data: QuestionReorderRequest) -> List[Question]:
    await verify_form_ownership(db, form_id, user_id)

    for item in data.questions:
        stmt = select(Question).where(Question.id == item.id, Question.form_id == form_id)
        res = await db.execute(stmt)
        q = res.scalar_one_or_none()
        if q:
            q.position = item.position
            q.updated_at = datetime.now(timezone.utc)

    event = FormEvent(
        form_id=form_id,
        event_type="QUESTION_UPDATED",
        metadata_json={"action": "reorder", "count": len(data.questions)}
    )
    db.add(event)
    await db.commit()

    res = await db.execute(
        select(Question)
        .where(Question.form_id == form_id)
        .order_by(Question.position)
        .options(selectinload(Question.options))
    )
    return res.scalars().all()
