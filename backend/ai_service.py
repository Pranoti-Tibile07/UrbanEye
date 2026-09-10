"""Thin wrapper around the existing Gemini module (Ai_/urbaneye_ai.py).

Maps the AI module's domain errors onto FastAPI-friendly HTTP exceptions so
callers get useful, consistent messages without exposing internals.
"""
from fastapi import HTTPException, status

from Ai_ import urbaneye_ai


def is_ai_configured() -> bool:
    """True when a Gemini API key is available in the environment."""
    import os

    return bool(os.getenv("GEMINI_API_KEY"))


def analyze_image(image_data: bytes, mime_type: str | None = None) -> dict:
    """Analyze an image with Gemini.

    Returns the validated {"category", "severity", "confidence",
    "description"} result. Raises HTTPException with an appropriate status
    code and message on failure.
    """
    try:
        return urbaneye_ai.analyze_image_bytes(image_data, mime_type=mime_type)
    except urbaneye_ai.InvalidImageError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        )
    except urbaneye_ai.AIConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        )
    except urbaneye_ai.UrbanEyeAIError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)
        )
