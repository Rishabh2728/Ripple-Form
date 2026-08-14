import uuid
from datetime import datetime, timezone
from typing import List, Optional, Any
from sqlalchemy import String, Text, Boolean, Integer, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    workspaces: Mapped[List["Workspace"]] = relationship("Workspace", back_populates="owner", cascade="all, delete-orphan")


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    owner: Mapped["User"] = relationship("User", back_populates="workspaces")
    forms: Mapped[List["Form"]] = relationship("Form", back_populates="workspace", cascade="all, delete-orphan")


class Form(Base):
    __tablename__ = "forms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    workspace_id: Mapped[str] = mapped_column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", index=True)
    theme_id: Mapped[str] = mapped_column(String(50), default="burgundy")
    theme_data: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    thank_you_title: Mapped[str] = mapped_column(String(255), default="Thank You!")
    thank_you_message: Mapped[str] = mapped_column(Text, default="Your response has been successfully submitted.")
    allow_back_navigation: Mapped[bool] = mapped_column(Boolean, default=True)
    show_progress: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="forms")
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.position")
    versions: Mapped[List["FormVersion"]] = relationship("FormVersion", back_populates="form", cascade="all, delete-orphan", order_by="FormVersion.version_number.desc()")
    responses: Mapped[List["Response"]] = relationship("Response", back_populates="form", cascade="all, delete-orphan")
    events: Mapped[List["FormEvent"]] = relationship("FormEvent", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    form_id: Mapped[str] = mapped_column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), index=True, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    required: Mapped[bool] = mapped_column(Boolean, default=False)
    position: Mapped[int] = mapped_column(Integer, default=0, index=True)
    settings_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    form: Mapped["Form"] = relationship("Form", back_populates="questions")
    options: Mapped[List["QuestionOption"]] = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan", order_by="QuestionOption.position")


class QuestionOption(Base):
    __tablename__ = "question_options"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    question_id: Mapped[str] = mapped_column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0)

    question: Mapped["Question"] = relationship("Question", back_populates="options")


class FormVersion(Base):
    __tablename__ = "form_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    form_id: Mapped[str] = mapped_column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), index=True, nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot_json: Mapped[Any] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    form: Mapped["Form"] = relationship("Form", back_populates="versions")
    responses: Mapped[List["Response"]] = relationship("Response", back_populates="form_version")


class Response(Base):
    __tablename__ = "responses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    form_id: Mapped[str] = mapped_column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), index=True, nullable=False)
    form_version_id: Mapped[str] = mapped_column(String(36), ForeignKey("form_versions.id", ondelete="CASCADE"), index=True, nullable=False)
    respondent_token: Mapped[str] = mapped_column(String(255), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completion_time_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="in_progress")

    form: Mapped["Form"] = relationship("Form", back_populates="responses")
    form_version: Mapped["FormVersion"] = relationship("FormVersion", back_populates="responses")
    answers: Mapped[List["ResponseAnswer"]] = relationship("ResponseAnswer", back_populates="response", cascade="all, delete-orphan")


class ResponseAnswer(Base):
    __tablename__ = "response_answers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    response_id: Mapped[str] = mapped_column(String(36), ForeignKey("responses.id", ondelete="CASCADE"), index=True, nullable=False)
    question_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    value: Mapped[Any] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    response: Mapped["Response"] = relationship("Response", back_populates="answers")


class FormEvent(Base):
    __tablename__ = "form_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    form_id: Mapped[str] = mapped_column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), index=True, nullable=False)
    response_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("responses.id", ondelete="SET NULL"), nullable=True)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    metadata_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)

    form: Mapped["Form"] = relationship("Form", back_populates="events")
