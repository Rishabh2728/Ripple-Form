from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.models import User, Workspace
from app.schemas.auth import UserRegister, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token

async def register_user(db: AsyncSession, data: UserRegister) -> dict:
    # Check existing email
    stmt = select(User).where(User.email == data.email.lower())
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "EMAIL_EXISTS", "message": "User with this email already exists."}}
        )

    # Create user
    hashed_pwd = get_password_hash(data.password)
    user = User(
        name=data.name,
        email=data.email.lower(),
        password_hash=hashed_pwd,
        created_at=datetime.now(timezone.utc),
        last_login_at=datetime.now(timezone.utc)
    )
    db.add(user)
    await db.flush()

    # Create default workspace
    workspace = Workspace(
        name=f"{data.name}'s Workspace",
        owner_id=user.id
    )
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

async def login_user(db: AsyncSession, data: UserLogin) -> dict:
    stmt = select(User).where(User.email == data.email.lower())
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."}}
        )

    user.last_login_at = datetime.now(timezone.utc)

    # Fetch default workspace
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
