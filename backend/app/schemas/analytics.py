from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ChoiceBreakdown(BaseModel):
    label: str
    count: int
    percentage: float

class QuestionAnalytics(BaseModel):
    question_id: str
    type: str
    title: str
    total_answers: int
    # Choice / dropdown / yes_no breakdown
    choices_breakdown: Optional[List[ChoiceBreakdown]] = None
    # Rating / NPS breakdown
    average_score: Optional[float] = None
    distribution: Optional[Dict[str, int]] = None
    # NPS calculation
    nps_score: Optional[float] = None  # % Promoters - % Detractors
    promoters_pct: Optional[float] = None
    passives_pct: Optional[float] = None
    detractors_pct: Optional[float] = None
    # Number breakdown
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    # Text samples
    recent_text_responses: Optional[List[str]] = None

class FormAnalyticsResponse(BaseModel):
    form_id: str
    title: str
    total_views: int = 0
    total_started: int = 0
    total_completed: int = 0
    completion_rate: float = 0.0
    average_completion_time_seconds: float = 0.0
    questions: List[QuestionAnalytics] = []
