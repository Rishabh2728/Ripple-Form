from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.auth import UserRegister, UserLogin, UserWithWorkspace
from app.services.auth_service import register_user, login_user
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user account and default workspace."""
    return await register_user(db, data)

@router.post("/login")
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate creator account and return JWT access token."""
    return await login_user(db, data)

@router.post("/logout")
async def logout():
    """Client handles token deletion; returns confirmation."""
    return {"message": "Successfully logged out."}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_active_user)):
    """Get current authenticated user profile and workspace info."""
    return current_user
