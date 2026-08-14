import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Ripple"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "super-secret-key-change-in-production-ripple-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    DATABASE_URL: str = "sqlite+aiosqlite:///./ripple.db"

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    GROQ_API_KEY: str = ""
    AI_API_KEY: str = ""
    AI_MODEL: str = "llama-3.3-70b-versatile"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
