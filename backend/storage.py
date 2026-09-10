"""Upload validation and image storage helpers."""
import uuid

from fastapi import HTTPException, UploadFile, status

from . import config
from Ai_ import urbaneye_ai

_EXT_BY_MIME = {"image/jpeg": ".jpg", "image/png": ".png"}


def validate_image(upload: UploadFile) -> tuple[bytes, str]:
    """Read and validate an uploaded image.

    Returns (file_bytes, mime_type). Rejects non-images and files over the
    configured size limit. The content type is detected from magic bytes,
    not trusted from the client.
    """
    data = upload.file.read()

    if len(data) > config.MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=(
                f"Image is too large. Maximum allowed size is "
                f"{config.MAX_UPLOAD_MB} MB."
            ),
        )

    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    mime_type = urbaneye_ai.detect_image_mime(data)
    if mime_type is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload a JPG, JPEG or PNG image.",
        )

    return data, mime_type


def save_image(data: bytes, mime_type: str) -> str:
    """Persist image bytes and return the relative path (e.g. uploads/x.jpg)."""
    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{_EXT_BY_MIME[mime_type]}"
    (config.UPLOAD_DIR / filename).write_bytes(data)
    return f"uploads/{filename}"
