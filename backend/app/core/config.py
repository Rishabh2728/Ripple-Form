import json
import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

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

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_str = v.strip()
            if not v_str:
                return ["*"]
            if v_str.startswith("["):
                try:
                    parsed = json.loads(v_str)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed]
                except Exception:
                    pass
            if "," in v_str:
                return [i.strip() for i in v_str.split(",") if i.strip()]
            return [v_str]
        elif isinstance(v, list):
            return [str(item).strip() for item in v]
        return ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
