"""SQLAlchemy models for UrbanEye."""
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base

# Canonical values shared across the app.
CATEGORIES = [
    "Pothole",
    "Garbage",
    "Broken Streetlight",
    "Water Leakage",
    "Damaged Public Property",
    "Other",
]

SEVERITIES = ["Low", "Medium", "High"]

REPORT_STATUSES = [
    "Submitted",
    "Under Review",
    "In Progress",
    "Resolved",
    "Rejected",
]

USER_ROLES = ["citizen", "admin"]

# Priority weight applied to each severity level.
SEVERITY_WEIGHT = {"Low": 1, "Medium": 2, "High": 3}


def now_utc() -> datetime:
    """Timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)


def compute_priority(severity: str, confidence: int) -> int:
    """Derive a 0-100 priority score from severity (dominant) + confidence.

    severity_weight (0..3) contributes 70% and confidence (0..100) 30%,
    so a High-severity, high-confidence report ranks highest.
    """
    weight = SEVERITY_WEIGHT.get(severity, 1)
    severity_part = (weight / 3.0) * 100
    confidence_part = confidence
    return round(0.7 * severity_part + 0.3 * confidence_part)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="citizen")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc, nullable=False
    )

    reports: Mapped[list["Report"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    category: Mapped[str] = mapped_column(String(40), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    confidence: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")

    # Relative path inside the uploads folder, e.g. "uploads/abc123.jpg".
    image_path: Mapped[str] = mapped_column(String(255), nullable=False)

    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="Submitted"
    )
    priority_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="reports")
