import re
import csv
import io
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.models import Form, Question, QuestionOption, FormVersion, Response, ResponseAnswer, FormEvent
from app.schemas.response import ResponseSubmitRequest, IndividualResponseView, ResponseListResponse, ResponseListItem, AnswerResponse
from app.schemas.analytics import FormAnalyticsResponse, QuestionAnalytics, ChoiceBreakdown
from app.services.form_service import verify_form_ownership

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

async def get_public_form_by_slug(db: AsyncSession, slug: str) -> dict:
    stmt = (
        select(Form)
        .where(Form.slug == slug)
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
            detail={"error": {"code": "FORM_NOT_FOUND", "message": "This form is unavailable or does not exist."}}
        )

    # Get latest published FormVersion snapshot if published
    ver_stmt = (
        select(FormVersion)
        .where(FormVersion.form_id == form.id)
        .order_by(desc(FormVersion.version_number))
        .limit(1)
    )
    ver_res = await db.execute(ver_stmt)
    latest_ver = ver_res.scalar_one_or_none()

    if latest_ver and form.status == "published":
        event = FormEvent(
            form_id=form.id,
            event_type="RESPONSE_STARTED",
            metadata_json={"slug": slug, "version": latest_ver.version_number}
        )
        db.add(event)
        await db.commit()

        snapshot = latest_ver.snapshot_json
        return {
            "id": form.id,
            "title": snapshot.get("title", form.title),
            "description": snapshot.get("description", form.description),
            "slug": form.slug,
            "status": form.status,
            "theme_id": snapshot.get("theme_id", form.theme_id),
            "theme_data": snapshot.get("theme_data", form.theme_data),
            "thank_you_title": snapshot.get("thank_you_title", form.thank_you_title),
            "thank_you_message": snapshot.get("thank_you_message", form.thank_you_message),
            "allow_back_navigation": snapshot.get("allow_back_navigation", form.allow_back_navigation),
            "show_progress": snapshot.get("show_progress", form.show_progress),
            "version_number": latest_ver.version_number,
            "form_version_id": latest_ver.id,
            "questions": snapshot.get("questions", [])
        }

    # Fallback for draft form preview or forms without snapshot
    questions_data = []
    for q in sorted(form.questions, key=lambda x: x.position):
        opts = [
            {"id": o.id, "label": o.label, "value": o.value, "position": o.position}
            for o in sorted(q.options, key=lambda x: x.position)
        ]
        questions_data.append({
            "id": q.id,
            "type": q.type,
            "title": q.title,
            "description": q.description,
            "required": q.required,
            "position": q.position,
            "settings_json": q.settings_json or {},
            "options": opts
        })

    return {
        "id": form.id,
        "title": form.title,
        "description": form.description,
        "slug": form.slug,
        "status": form.status,
        "theme_id": form.theme_id,
        "theme_data": form.theme_data,
        "thank_you_title": form.thank_you_title,
        "thank_you_message": form.thank_you_message,
        "allow_back_navigation": form.allow_back_navigation,
        "show_progress": form.show_progress,
        "version_number": 0,
        "questions": questions_data
    }

async def submit_response(db: AsyncSession, slug: str, data: ResponseSubmitRequest) -> dict:
    stmt = select(Form).where(Form.slug == slug, Form.status == "published")
    res = await db.execute(stmt)
    form = res.scalar_one_or_none()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "FORM_NOT_FOUND", "message": "Form not found or not published."}}
        )

    # Get latest published FormVersion snapshot
    ver_stmt = (
        select(FormVersion)
        .where(FormVersion.form_id == form.id)
        .order_by(desc(FormVersion.version_number))
        .limit(1)
    )
    ver_res = await db.execute(ver_stmt)
    latest_ver = ver_res.scalar_one_or_none()
    if not latest_ver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "NO_PUBLISHED_VERSION", "message": "Published version not found."}}
        )

    snapshot = latest_ver.snapshot_json
    snapshot_questions = snapshot.get("questions", [])
    q_map = {q["id"]: q for q in snapshot_questions}
    submitted_answers_map = {a.question_id: a.value for a in data.answers}

    # SERVER-SIDE VALIDATION
    for q in snapshot_questions:
        q_id = q["id"]
        q_title = q.get("title", "Question")
        q_type = q["type"]
        is_req = q.get("required", False)
        settings = q.get("settings_json") or {}
        val = submitted_answers_map.get(q_id)

        # Required check
        if is_req:
            if val is None or val == "" or (isinstance(val, list) and len(val) == 0):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail={"error": {"code": "VALIDATION_ERROR", "message": f"'{q_title}' is required.", "question_id": q_id}}
                )

        if val is not None and val != "":
            # Type specific validation
            if q_type == "email":
                val_str = str(val).strip()
                if not EMAIL_REGEX.match(val_str):
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail={"error": {"code": "INVALID_EMAIL", "message": f"Please enter a valid email address for '{q_title}'.", "question_id": q_id}}
                    )

            elif q_type in ["short_text", "long_text"]:
                val_str = str(val)
                min_len = settings.get("min_length")
                max_len = settings.get("max_length")
                if min_len is not None and len(val_str) < min_len:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail={"error": {"code": "TEXT_TOO_SHORT", "message": f"'{q_title}' must be at least {min_len} characters.", "question_id": q_id}}
                    )
                if max_len is not None and len(val_str) > max_len:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail={"error": {"code": "TEXT_TOO_LONG", "message": f"'{q_title}' cannot exceed {max_len} characters.", "question_id": q_id}}
                    )

            elif q_type == "number":
                try:
                    num_val = float(val)
                except (ValueError, TypeError):
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail={"error": {"code": "INVALID_NUMBER", "message": f"'{q_title}' must be a valid number.", "question_id": q_id}}
                    )
                min_val = settings.get("min")
                max_val = settings.get("max")
                if min_val is not None and num_val < min_val:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail={"error": {"code": "NUMBER_TOO_SMALL", "message": f"'{q_title}' must be at least {min_val}.", "question_id": q_id}}
                    )
                if max_val is not None and num_val > max_val:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail={"error": {"code": "NUMBER_TOO_LARGE", "message": f"'{q_title}' must be at most {max_val}.", "question_id": q_id}}
                    )

            elif q_type in ["multiple_choice", "dropdown"]:
                valid_option_values = {opt["value"] for opt in q.get("options", [])}
                if isinstance(val, list):
                    for selected in val:
                        if selected not in valid_option_values:
                            raise HTTPException(
                                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                                detail={"error": {"code": "INVALID_OPTION", "message": f"Invalid option selected for '{q_title}'.", "question_id": q_id}}
                            )
                else:
                    if str(val) not in valid_option_values:
                        raise HTTPException(
                            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail={"error": {"code": "INVALID_OPTION", "message": f"Invalid option '{val}' selected for '{q_title}'.", "question_id": q_id}}
                        )

            elif q_type == "yes_no":
                if str(val).lower() not in ["yes", "no", "true", "false"]:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail={"error": {"code": "INVALID_YES_NO", "message": f"Select Yes or No for '{q_title}'.", "question_id": q_id}}
                    )

    # PERSIST RESPONSE IN TRANSACTION
    started_at = data.started_at if data.started_at else datetime.now(timezone.utc)
    submitted_at = datetime.now(timezone.utc)

    response = Response(
        form_id=form.id,
        form_version_id=latest_ver.id,
        respondent_token=data.respondent_token,
        started_at=started_at,
        submitted_at=submitted_at,
        completion_time_seconds=data.completion_time_seconds or max(1, int((submitted_at - started_at.replace(tzinfo=timezone.utc if started_at.tzinfo is None else started_at.tzinfo)).total_seconds())),
        status="completed"
    )
    db.add(response)
    await db.flush()

    for item in data.answers:
        if item.question_id in q_map:
            ans = ResponseAnswer(
                response_id=response.id,
                question_id=item.question_id,
                value=item.value,
                created_at=submitted_at
            )
            db.add(ans)

    event = FormEvent(
        form_id=form.id,
        response_id=response.id,
        event_type="RESPONSE_COMPLETED",
        metadata_json={"completion_time": response.completion_time_seconds}
    )
    db.add(event)
    await db.commit()

    return {
        "response_id": response.id,
        "status": "completed",
        "thank_you_title": snapshot.get("thank_you_title", form.thank_you_title),
        "thank_you_message": snapshot.get("thank_you_message", form.thank_you_message)
    }

async def list_form_responses(
    db: AsyncSession,
    form_id: str,
    user_id: str,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None
) -> ResponseListResponse:
    form = await verify_form_ownership(db, form_id, user_id)

    stmt = (
        select(Response)
        .where(Response.form_id == form_id, Response.status == "completed")
        .order_by(desc(Response.submitted_at))
    )

    if search:
        stmt = stmt.where(Response.respondent_token.contains(search))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_res = await db.execute(count_stmt)
    total = total_res.scalar_one() or 0

    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)
    res = await db.execute(stmt)
    responses = res.scalars().all()

    items = [
        ResponseListItem(
            id=r.id,
            respondent_token=r.respondent_token,
            submitted_at=r.submitted_at,
            completion_time_seconds=r.completion_time_seconds,
            status=r.status
        ) for r in responses
    ]

    return ResponseListResponse(
        responses=items,
        total=total,
        page=page,
        page_size=page_size
    )

async def get_individual_response(db: AsyncSession, response_id: str, user_id: str) -> IndividualResponseView:
    r_stmt = (
        select(Response)
        .where(Response.id == response_id)
        .options(
            selectinload(Response.form_version),
            selectinload(Response.answers)
        )
    )
    res = await db.execute(r_stmt)
    resp = res.scalar_one_or_none()
    if not resp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "RESPONSE_NOT_FOUND", "message": "Response not found."}}
        )

    # Check authorization on form
    await verify_form_ownership(db, resp.form_id, user_id)

    version_snapshot = resp.form_version.snapshot_json if resp.form_version else {}
    questions_snapshot = version_snapshot.get("questions", [])

    answers_list = [
        AnswerResponse(
            id=ans.id,
            question_id=ans.question_id,
            value=ans.value,
            created_at=ans.created_at
        ) for ans in resp.answers
    ]

    return IndividualResponseView(
        id=resp.id,
        form_id=resp.form_id,
        form_version_id=resp.form_version_id,
        version_number=resp.form_version.version_number if resp.form_version else 1,
        respondent_token=resp.respondent_token,
        started_at=resp.started_at,
        submitted_at=resp.submitted_at,
        completion_time_seconds=resp.completion_time_seconds,
        status=resp.status,
        answers=answers_list,
        questions_snapshot=questions_snapshot
    )

async def calculate_form_analytics(db: AsyncSession, form_id: str, user_id: str) -> FormAnalyticsResponse:
    form = await verify_form_ownership(db, form_id, user_id)

    # Total events count
    started_cnt_stmt = select(func.count(FormEvent.id)).where(FormEvent.form_id == form_id, FormEvent.event_type == "RESPONSE_STARTED")
    started_cnt_res = await db.execute(started_cnt_stmt)
    total_started = started_cnt_res.scalar_one() or 0

    # Responses count and completion time
    responses_stmt = (
        select(Response)
        .where(Response.form_id == form_id, Response.status == "completed")
        .options(selectinload(Response.answers))
    )
    res = await db.execute(responses_stmt)
    responses = res.scalars().all()
    total_completed = len(responses)

    if total_started < total_completed:
        total_started = total_completed

    completion_rate = (total_completed / total_started * 100.0) if total_started > 0 else 0.0

    times = [r.completion_time_seconds for r in responses if r.completion_time_seconds is not None]
    avg_time = (sum(times) / len(times)) if times else 0.0

    # Build question analytics based on current form questions or latest snapshot
    q_analytics_list: List[QuestionAnalytics] = []

    for q in form.questions:
        # Collect answers for this question
        q_answers = []
        for r in responses:
            for ans in r.answers:
                if ans.question_id == q.id and ans.value is not None:
                    q_answers.append(ans.value)

        total_ans = len(q_answers)

        choices_bd = None
        avg_score = None
        distrib = None
        nps_score = None
        prom_pct = None
        pas_pct = None
        det_pct = None
        min_v = None
        max_v = None
        recent_texts = None

        if q.type in ["multiple_choice", "dropdown", "yes_no"]:
            counts: Dict[str, int] = {}
            if q.type == "yes_no":
                counts = {"Yes": 0, "No": 0}

            for opt in (q.options or []):
                counts[opt.label] = 0

            for val in q_answers:
                # Value could be label or value
                val_str = str(val)
                # match option
                matched = False
                for opt in (q.options or []):
                    if val_str in [opt.value, opt.label]:
                        counts[opt.label] = counts.get(opt.label, 0) + 1
                        matched = True
                        break
                if not matched:
                    if q.type == "yes_no":
                        if val_str.lower() in ["yes", "true"]:
                            counts["Yes"] = counts.get("Yes", 0) + 1
                        elif val_str.lower() in ["no", "false"]:
                            counts["No"] = counts.get("No", 0) + 1
                    else:
                        counts[val_str] = counts.get(val_str, 0) + 1

            choices_bd = [
                ChoiceBreakdown(
                    label=lbl,
                    count=cnt,
                    percentage=(cnt / total_ans * 100.0) if total_ans > 0 else 0.0
                ) for lbl, cnt in counts.items()
            ]

        elif q.type in ["rating", "nps"]:
            numeric_vals = []
            distrib = {}
            for v in q_answers:
                try:
                    num = float(v)
                    numeric_vals.append(num)
                    k = str(int(num))
                    distrib[k] = distrib.get(k, 0) + 1
                except (ValueError, TypeError):
                    pass

            if numeric_vals:
                avg_score = round(sum(numeric_vals) / len(numeric_vals), 2)

            if q.type == "nps" and numeric_vals:
                promoters = len([v for v in numeric_vals if v >= 9])
                passives = len([v for v in numeric_vals if 7 <= v <= 8])
                detractors = len([v for v in numeric_vals if v <= 6])
                n_total = len(numeric_vals)
                prom_pct = round(promoters / n_total * 100.0, 1)
                pas_pct = round(passives / n_total * 100.0, 1)
                det_pct = round(detractors / n_total * 100.0, 1)
                nps_score = round(prom_pct - det_pct, 1)

        elif q.type == "number":
            numeric_vals = []
            for v in q_answers:
                try:
                    numeric_vals.append(float(v))
                except (ValueError, TypeError):
                    pass
            if numeric_vals:
                avg_score = round(sum(numeric_vals) / len(numeric_vals), 2)
                min_v = round(min(numeric_vals), 2)
                max_v = round(max(numeric_vals), 2)

        elif q.type in ["short_text", "long_text", "email"]:
            recent_texts = [str(v) for v in q_answers[:10] if str(v).strip()]

        q_analytics_list.append(QuestionAnalytics(
            question_id=q.id,
            type=q.type,
            title=q.title,
            total_answers=total_ans,
            choices_breakdown=choices_bd,
            average_score=avg_score,
            distribution=distrib,
            nps_score=nps_score,
            promoters_pct=prom_pct,
            passives_pct=pas_pct,
            detractors_pct=det_pct,
            min_value=min_v,
            max_value=max_v,
            recent_text_responses=recent_texts
        ))

    return FormAnalyticsResponse(
        form_id=form.id,
        title=form.title,
        total_views=total_started,
        total_started=total_started,
        total_completed=total_completed,
        completion_rate=round(completion_rate, 1),
        average_completion_time_seconds=round(avg_time, 1),
        questions=q_analytics_list
    )

async def export_responses_csv(db: AsyncSession, form_id: str, user_id: str) -> dict:
    form = await verify_form_ownership(db, form_id, user_id)

    # Fetch completed responses
    responses_stmt = (
        select(Response)
        .where(Response.form_id == form_id, Response.status == "completed")
        .order_by(desc(Response.submitted_at))
        .options(selectinload(Response.answers))
    )
    res = await db.execute(responses_stmt)
    responses = res.scalars().all()

    # Column headers: Response ID, Submitted At, Completion Time (s), [Questions...]
    headers = ["Response ID", "Submitted At", "Completion Time (seconds)"]
    q_ids = [q.id for q in form.questions]
    for q in form.questions:
        headers.append(f"{q.title} ({q.type})")

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(headers)

    for r in responses:
        ans_map = {a.question_id: a.value for a in r.answers}
        row = [
            r.id,
            r.submitted_at.isoformat() if r.submitted_at else "",
            r.completion_time_seconds or 0
        ]
        for q_id in q_ids:
            val = ans_map.get(q_id, "")
            if isinstance(val, (list, dict)):
                val_str = str(val)
            else:
                val_str = str(val) if val is not None else ""
            row.append(val_str)
        writer.writerow(row)

    filename = f"{form.slug}_responses_{datetime.now().strftime('%Y%m%d')}.csv"
    return {
        "filename": filename,
        "content": output.getvalue()
    }
