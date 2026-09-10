"""Pydantic request/response schemas."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from .models import CATEGORIES, REPORT_STATUSES, SEVERITIES


# --------------------------------------------------------------------------
# Auth
# --------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name must not be blank.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --------------------------------------------------------------------------
# AI analysis
# --------------------------------------------------------------------------

class AnalyzeResult(BaseModel):
    category: str
    severity: str
    confidence: int = Field(ge=0, le=100)
    description: str = ""


# --------------------------------------------------------------------------
# Reports
# --------------------------------------------------------------------------

class ReportCreate(BaseModel):
    category: str
    severity: str
    confidence: int = Field(default=0, ge=0, le=100)
    description: str = Field(default="", max_length=2000)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    address: str | None = Field(default=None, max_length=500)

    @field_validator("category")
    @classmethod
    def valid_category(cls, value: str) -> str:
        if value not in CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(CATEGORIES)}")
        return value

    @field_validator("severity")
    @classmethod
    def valid_severity(cls, value: str) -> str:
        if value not in SEVERITIES:
            raise ValueError(f"severity must be one of: {', '.join(SEVERITIES)}")
        return value


class ReportStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def valid_status(cls, value: str) -> str:
        if value not in REPORT_STATUSES:
            raise ValueError(
                f"status must be one of: {', '.join(REPORT_STATUSES)}"
            )
        return value


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    user_name: str | None = None
    category: str
    severity: str
    confidence: int
    description: str
    image_url: str | None = None
    latitude: float | None
    longitude: float | None
    address: str | None
    status: str
    priority_score: int
    created_at: datetime
    updated_at: datetime


# --------------------------------------------------------------------------
# Dashboard statistics
# --------------------------------------------------------------------------

class RecentReport(ReportOut):
    pass


class DashboardStats(BaseModel):
    total_reports: int
    status_counts: dict[str, int]
    category_counts: dict[str, int]
    severity_counts: dict[str, int]
    high_priority_count: int
    resolved_count: int
    recent_reports: list[ReportOut]


class PublicStats(BaseModel):
    total_reports: int
    resolved_reports: int
    open_reports: int
    categories_observed: int
