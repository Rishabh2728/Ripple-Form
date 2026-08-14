from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.models import User, Workspace, Form, Question
from app.schemas.auth import UserRegister, UserLogin
from app.core.security import get_password_hash_async, verify_password_async, create_access_token
from app.services.form_service import generate_unique_slug

async def register_user(db: AsyncSession, data: UserRegister) -> dict:
    stmt = select(User).where(User.email == data.email.lower())
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "EMAIL_EXISTS", "message": "User with this email already exists."}}
        )

    hashed_pwd = await get_password_hash_async(data.password)
    user = User(
        name=data.name,
        email=data.email.lower(),
        password_hash=hashed_pwd,
        created_at=datetime.now(timezone.utc),
        last_login_at=datetime.now(timezone.utc)
    )
    db.add(user)
    await db.flush()

    workspace = Workspace(
        name=f"{data.name}'s Workspace",
        owner_id=user.id
    )
    db.add(workspace)
    await db.flush()

    # Seed starter forms for every newly registered creator account
    f1 = Form(
        workspace_id=workspace.id,
        title="Customer Satisfaction Survey",
        description="Gather feedback from your SaaS customers on product quality and features.",
        slug=await generate_unique_slug(db, "customer-satisfaction-survey"),
        status="published",
        theme_id="burgundy",
        thank_you_title="Thank You for Your Feedback!",
        thank_you_message="Your insights directly influence our product roadmap.",
        published_at=datetime.now(timezone.utc)
    )
    f2 = Form(
        workspace_id=workspace.id,
        title="Event Registration & RSVP",
        description="Reserve spots for upcoming webinars, keynotes, or workshops.",
        slug=await generate_unique_slug(db, "event-registration-rsvp"),
        status="draft",
        theme_id="midnight"
    )
    f3 = Form(
        workspace_id=workspace.id,
        title="Product Beta Screening Pulse",
        description="Filter candidate beta testers for upcoming releases.",
        slug=await generate_unique_slug(db, "product-beta-screening-pulse"),
        status="draft",
        theme_id="forest"
    )
    db.add_all([f1, f2, f3])
    await db.flush()

    db.add_all([
        Question(form_id=f1.id, type="short_text", title="What is your full name?", required=True, position=0),
        Question(form_id=f1.id, type="email", title="What is your work email address?", required=True, position=1),
        Question(form_id=f1.id, type="rating", title="How satisfied are you with our user interface?", required=True, position=2),
        Question(form_id=f1.id, type="long_text", title="What is the single biggest feature request you have?", required=False, position=3),
        Question(form_id=f2.id, type="short_text", title="Attendee Name", required=True, position=0),
        Question(form_id=f2.id, type="email", title="Email Address", required=True, position=1),
        Question(form_id=f2.id, type="yes_no", title="Will you attend the evening networking reception?", required=True, position=2),
        Question(form_id=f3.id, type="short_text", title="Operating System (macOS, Windows, Linux)", required=True, position=0),
        Question(form_id=f3.id, type="number", title="Hours per week spent in form builders", required=True, position=1),
    ])
    await db.flush()
    await db.commit()

    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "workspace_id": workspace.id,
            "workspace_name": workspace.name,
            "created_at": user.created_at,
            "last_login_at": user.last_login_at
        }
    }

async def login_user(db: AsyncSession, data: UserLogin) -> dict:
    stmt = select(User).where(User.email == data.email.lower())
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."}}
        )

    is_valid = await verify_password_async(data.password, user.password_hash)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."}}
        )

    user.last_login_at = datetime.now(timezone.utc)

    ws_stmt = select(Workspace).where(Workspace.owner_id == user.id).limit(1)
    ws_res = await db.execute(ws_stmt)
    workspace = ws_res.scalar_one_or_none()

    if not workspace:
        workspace = Workspace(name=f"{user.name}'s Workspace", owner_id=user.id)
        db.add(workspace)
        await db.flush()

    await db.commit()

    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "workspace_id": workspace.id,
            "workspace_name": workspace.name,
            "created_at": user.created_at,
            "last_login_at": user.last_login_at
        }
    }

async def get_current_user(db: AsyncSession, user_id: str) -> dict:
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "USER_NOT_FOUND", "message": "User session invalid."}}
        )

    ws_stmt = select(Workspace).where(Workspace.owner_id == user.id).limit(1)
    ws_res = await db.execute(ws_stmt)
    workspace = ws_res.scalar_one_or_none()

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "workspace_id": workspace.id if workspace else "",
        "workspace_name": workspace.name if workspace else "",
        "created_at": user.created_at,
        "last_login_at": user.last_login_at
    }
