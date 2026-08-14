from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime
from app.schemas.question import QuestionResponse, QuestionCreate

class FormBase(BaseModel):
    title: str
    description: Optional[str] = None
    theme_id: str = "burgundy"
    theme_data: Optional[Dict[str, Any]] = None
    thank_you_title: str = "Thank You!"
    thank_you_message: str = "Your response has been successfully submitted."
    allow_back_navigation: bool = True
    show_progress: bool = True

class FormCreate(FormBase):
    slug: Optional[str] = None
    questions: Optional[List[QuestionCreate]] = None

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None
    status: Optional[str] = None
    theme_id: Optional[str] = None
    theme_data: Optional[Dict[str, Any]] = None
    thank_you_title: Optional[str] = None
    thank_you_message: Optional[str] = None
    allow_back_navigation: Optional[bool] = None
    show_progress: Optional[bool] = None

class FormResponse(FormBase):
    id: str
    workspace_id: str
    slug: str
    status: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    questions: List[QuestionResponse] = []
    question_count: Optional[int] = 0
    response_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class FormListResponse(BaseModel):
    forms: List[FormResponse]
    total: int

class FormHealthIssue(BaseModel):
    question_id: Optional[str] = None
    question_title: Optional[str] = None
    issue: str

class FormHealthResponse(BaseModel):
    is_valid: bool
    issues: List[FormHealthIssue] = []

class FormPublishResponse(BaseModel):
    status: str
    slug: str
    version_number: int
    published_at: datetime
