"""AI image-analysis endpoint."""
from fastapi import APIRouter, Depends, File, UploadFile

from .. import ai_service, auth, models, schemas
from ..storage import validate_image

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze", response_model=schemas.AnalyzeResult)
def analyze_image(
    image: UploadFile = File(...),
    _user: models.User = Depends(auth.get_current_user),
):
    """Analyze an uploaded image with Gemini and return a structured result.

    Requires authentication (the endpoint consumes paid API quota).
    The Gemini API key is only ever used server-side.
    """
    data, mime_type = validate_image(image)
    return ai_service.analyze_image(data, mime_type=mime_type)
