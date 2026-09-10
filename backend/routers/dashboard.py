"""Dashboard statistics (admin) and public landing-page statistics."""
from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db
from .reports import _to_out

router = APIRouter(prefix="/api", tags=["dashboard"])

HIGH_PRIORITY_THRESHOLD = 70
OPEN_STATUSES = ("Submitted", "Under Review", "In Progress")


@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def dashboard_stats(
    _admin: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db),
):
    """Aggregate statistics computed from real database records (admin only)."""
    total = db.query(func.count(models.Report.id)).scalar() or 0
    resolved = (
        db.query(func.count(models.Report.id))
        .filter(models.Report.status == "Resolved")
        .scalar()
        or 0
    )
    high_priority = (
        db.query(func.count(models.Report.id))
        .filter(models.Report.priority_score >= HIGH_PRIORITY_THRESHOLD)
        .scalar()
        or 0
    )

    status_counts = dict(
        db.query(models.Report.status, func.count(models.Report.id))
        .group_by(models.Report.status)
        .all()
    )
    category_counts = dict(
        db.query(models.Report.category, func.count(models.Report.id))
        .group_by(models.Report.category)
        .all()
    )
    severity_counts = dict(
        db.query(models.Report.severity, func.count(models.Report.id))
        .group_by(models.Report.severity)
        .all()
    )

    recent = (
        db.query(models.Report)
        .order_by(models.Report.created_at.desc())
        .limit(5)
        .all()
    )

    return schemas.DashboardStats(
        total_reports=total,
        status_counts=status_counts,
        category_counts=category_counts,
        severity_counts=severity_counts,
        high_priority_count=high_priority,
        resolved_count=resolved,
        recent_reports=[_to_out(report) for report in recent],
    )


@router.get("/stats/public", response_model=schemas.PublicStats)
def public_stats(db: Session = Depends(get_db)):
    """Lightweight public statistics for the landing page."""
    total = db.query(func.count(models.Report.id)).scalar() or 0
    resolved = (
        db.query(func.count(models.Report.id))
        .filter(models.Report.status == "Resolved")
        .scalar()
        or 0
    )
    open_count = (
        db.query(func.count(models.Report.id))
        .filter(models.Report.status.in_(OPEN_STATUSES))
        .scalar()
        or 0
    )
    categories = (
        db.query(func.count(func.distinct(models.Report.category))).scalar() or 0
    )

    return schemas.PublicStats(
        total_reports=total,
        resolved_reports=resolved,
        open_reports=open_count,
        categories_observed=categories,
    )
