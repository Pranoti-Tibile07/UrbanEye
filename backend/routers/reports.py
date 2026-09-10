"""Report endpoints: create, list, read, and admin status updates."""
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.encoders import jsonable_encoder
from pydantic import ValidationError
from sqlalchemy import or_
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db
from ..storage import save_image, validate_image

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _to_out(report: models.Report) -> schemas.ReportOut:
    return schemas.ReportOut(
        id=report.id,
        user_id=report.user_id,
        user_name=report.user.name if report.user else None,
        category=report.category,
        severity=report.severity,
        confidence=report.confidence,
        description=report.description,
        image_url=f"/{report.image_path}" if report.image_path else None,
        latitude=report.latitude,
        longitude=report.longitude,
        address=report.address,
        status=report.status,
        priority_score=report.priority_score,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )


def _get_report_or_404(db: Session, report_id: int) -> models.Report:
    report = db.get(models.Report, report_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Report not found."
        )
    return report


@router.post("", response_model=schemas.ReportOut, status_code=201)
def create_report(
    image: UploadFile = File(...),
    category: str = Form(...),
    severity: str = Form(...),
    confidence: int = Form(0),
    description: str = Form(""),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    address: str | None = Form(None),
    user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new report from an image + citizen-reviewed AI classification.

    The category/severity/confidence the citizen reviewed are validated
    server-side against the allowed values; the priority score is always
    derived on the server.
    """
    try:
        payload = schemas.ReportCreate(
            category=category,
            severity=severity,
            confidence=confidence,
            description=description,
            latitude=latitude,
            longitude=longitude,
            address=address,
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=jsonable_encoder(exc.errors()),
        )

    data, mime_type = validate_image(image)
    image_path = save_image(data, mime_type)

    report = models.Report(
        user_id=user.id,
        category=payload.category,
        severity=payload.severity,
        confidence=payload.confidence,
        description=payload.description,
        image_path=image_path,
        latitude=payload.latitude,
        longitude=payload.longitude,
        address=payload.address,
        status="Submitted",
        priority_score=models.compute_priority(
            payload.severity, payload.confidence
        ),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return _to_out(report)


@router.get("", response_model=list[schemas.ReportOut])
def list_reports(
    q: str | None = Query(default=None, max_length=200),
    category: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    """List reports. Citizens see their own; admins see all.

    Optional filters: q (text search), category, severity, status.
    """
    query = db.query(models.Report)

    if user.role != "admin":
        query = query.filter(models.Report.user_id == user.id)

    if category:
        query = query.filter(models.Report.category == category)
    if severity:
        query = query.filter(models.Report.severity == severity)
    if status_filter:
        query = query.filter(models.Report.status == status_filter)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                models.Report.description.ilike(like),
                models.Report.address.ilike(like),
                models.Report.category.ilike(like),
            )
        )

    reports = (
        query.order_by(models.Report.created_at.desc())
        .limit(500)
        .all()
    )
    return [_to_out(report) for report in reports]


@router.get("/{report_id}", response_model=schemas.ReportOut)
def get_report(
    report_id: int,
    user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    report = _get_report_or_404(db, report_id)
    if user.role != "admin" and report.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Report not found."
        )
    return _to_out(report)


@router.patch("/{report_id}/status", response_model=schemas.ReportOut)
def update_report_status(
    report_id: int,
    payload: schemas.ReportStatusUpdate,
    _admin: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db),
):
    report = _get_report_or_404(db, report_id)
    report.status = payload.status
    db.commit()
    db.refresh(report)
    return _to_out(report)
