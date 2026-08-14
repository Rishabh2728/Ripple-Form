from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any, Dict

class QuestionOptionBase(BaseModel):
    label: str
    value: str
    position: int = 0

class QuestionOptionCreate(QuestionOptionBase):
    pass

class QuestionOptionResponse(QuestionOptionBase):
    id: str
    question_id: str

    model_config = ConfigDict(from_attributes=True)

class QuestionBase(BaseModel):
    type: str  # short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating, nps
    title: str
    description: Optional[str] = None
    required: bool = False
    position: int = 0
    settings_json: Optional[Dict[str, Any]] = None

class QuestionCreate(QuestionBase):
    options: Optional[List[QuestionOptionCreate]] = []

class QuestionUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    position: Optional[int] = None
    settings_json: Optional[Dict[str, Any]] = None
    options: Optional[List[QuestionOptionCreate]] = None

class QuestionResponse(QuestionBase):
    id: str
    form_id: str
    options: List[QuestionOptionResponse] = []

    model_config = ConfigDict(from_attributes=True)

class QuestionReorderItem(BaseModel):
    id: str
    position: int

class QuestionReorderRequest(BaseModel):
    questions: List[QuestionReorderItem]
