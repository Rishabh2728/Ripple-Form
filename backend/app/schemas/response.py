from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

class AnswerItem(BaseModel):
    question_id: str
    value: Any

class ResponseSubmitRequest(BaseModel):
    respondent_token: str
    answers: List[AnswerItem]
    started_at: Optional[datetime] = None
    completion_time_seconds: Optional[int] = 0

class AnswerResponse(BaseModel):
    id: str
    question_id: str
    value: Any
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IndividualResponseView(BaseModel):
    id: str
    form_id: str
    form_version_id: str
    version_number: int
    respondent_token: str
    started_at: datetime
    submitted_at: Optional[datetime] = None
    completion_time_seconds: Optional[int] = None
    status: str
    answers: List[AnswerResponse] = []
    # Snapshot stored questions/titles for context
    questions_snapshot: List[Dict[str, Any]] = []

    model_config = ConfigDict(from_attributes=True)

class ResponseListItem(BaseModel):
    id: str
    respondent_token: str
    submitted_at: Optional[datetime] = None
    completion_time_seconds: Optional[int] = None
    status: str

class ResponseListResponse(BaseModel):
    responses: List[ResponseListItem]
    total: int
    page: int
    page_size: int

class CSVExportResponse(BaseModel):
    filename: str
    content: str
