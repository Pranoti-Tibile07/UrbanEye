"""DEMO DATA SEED SCRIPT (development only).

Creates a demo admin + citizen account and a handful of sample reports so
the dashboard and map have something meaningful to show. Sample report
images are copied from the existing Ai_/ test images.

Usage:
    python -m backend.seed

Credentials are configurable via SEED_ADMIN_* environment variables
(see .env.example). This is clearly labeled demo data, not production data.
"""
import os
import shutil
import uuid
from pathlib import Path

from . import config
from .database import SessionLocal, init_db
from .models import Report, compute_priority

# (source image, category, severity, confidence, status, lat, lng, address)
SAMPLES = [
    ("pothole.jpg", "Pothole", "High", 93, "In Progress",
     18.5204, 73.8567, "FC Road, Pune"),
    ("test_images/garbage.jpg", "Garbage", "Medium", 88, "Submitted",
     18.5158, 73.8645, "Koregaon Park, Pune"),
    ("test_images/streetlight.jpg", "Broken Streetlight", "High", 90, "Under Review",
     18.5018, 73.8636, "Swargate, Pune"),
    ("test_images/water_leakage.jpg", "Water Leakage", "High", 86, "Submitted",
     18.5523, 73.9212, "Viman Nagar, Pune"),
    ("test_images/damaged_property.jpg", "Damaged Public Property", "Medium", 82, "Resolved",
     18.5290, 73.8750, "Kalyani Nagar, Pune"),
]

# A few extra reports reusing existing images to make the dashboard richer.
EXTRA_SAMPLES = [
    ("pothole.jpg", "Pothole", "Medium", 78, "Resolved",
     18.4671, 73.8262, "Kothrud, Pune"),
    ("test_images/garbage.jpg", "Garbage", "Low", 74, "Rejected",
     18.5626, 73.7767, "Baner, Pune"),
    ("test_images/water_leakage.jpg", "Water Leakage", "Medium", 81, "Under Review",
     18.4575, 73.8505, "Karve Nagar, Pune"),
]

_ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@urbaneye.com")
_ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "admin123")
_ADMIN_NAME = os.getenv("SEED_ADMIN_NAME", "UrbanEye Admin")


def _copy_sample_image(source: str) -> str:
    """Copy a sample image into the uploads folder; return its relative path."""
    src = config.REPO_ROOT / "Ai_" / source
    if not src.is_file():
        raise FileNotFoundError(f"Sample image not found: {src}")

    ext = src.suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, config.UPLOAD_DIR / filename)
    return f"uploads/{filename}"


def seed() -> None:
    init_db()

    from . import auth, models  # local import to keep top-level imports light

    db = SessionLocal()
    try:
        # Admin account
        existing_admin = (
            db.query(models.User)
            .filter(models.User.email == _ADMIN_EMAIL)
            .first()
        )
        if existing_admin is None:
            auth.create_user(db, _ADMIN_NAME, _ADMIN_EMAIL, _ADMIN_PASSWORD, role="admin")
            print(f"Created admin account: {_ADMIN_EMAIL}")
        else:
            print(f"Admin account already exists: {_ADMIN_EMAIL}")

        # Demo citizen
        citizen_email = "citizen@urbaneye.com"
        existing_citizen = (
            db.query(models.User)
            .filter(models.User.email == citizen_email)
            .first()
        )
        if existing_citizen is None:
            citizen = auth.create_user(
                db, "Aarav Sharma", citizen_email, "citizen123", role="citizen"
            )
        else:
            citizen = existing_citizen
        print(f"Demo citizen account: {citizen_email} / password: citizen123")

        # Sample reports
        created = 0
        for (src, category, severity, confidence, status,
             lat, lng, address) in SAMPLES + EXTRA_SAMPLES:
            image_path = _copy_sample_image(src)
            db.add(
                Report(
                    user_id=citizen.id,
                    category=category,
                    severity=severity,
                    confidence=confidence,
                    description=(
                        f"Demo report: {category.lower()} reported near {address}."
                    ),
                    image_path=image_path,
                    latitude=lat,
                    longitude=lng,
                    address=address,
                    status=status,
                    priority_score=compute_priority(severity, confidence),
                )
            )
            created += 1

        db.commit()
        print(f"Created {created} sample reports.")
        print()
        print("Demo credentials (for local testing only):")
        print(f"  Admin   -> {_ADMIN_EMAIL} / {_ADMIN_PASSWORD}")
        print("  Citizen -> citizen@urbaneye.com / citizen123")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
