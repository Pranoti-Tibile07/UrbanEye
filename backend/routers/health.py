"""Health check endpoint."""
from fastapi import APIRouter

from .. import ai_service

router = APIRouter(tags=["health"])


@router.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "UrbanEye API",
        "ai_configured": ai_service.is_ai_configured(),
    }
