"""Application configuration, read from environment variables.

Sensible defaults are provided so the app runs out of the box for local
development. Override any value through a `.env` file or real environment
variables.
"""
import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

# Load a .env file (searched from backend/ upward, so the root .env is found).
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent          # .../UrbanEye/backend
REPO_ROOT = BASE_DIR.parent                          # .../UrbanEye


def _get_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


# --- Database -------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./urbaneye.db")

# --- Auth -----------------------------------------------------------------
JWT_SECRET = os.getenv("JWT_SECRET", "").strip()
if not JWT_SECRET:
    JWT_SECRET = secrets.token_hex(32)
    print(
        "[UrbanEye] WARNING: JWT_SECRET is not set — using an ephemeral "
        "random secret. Logins will not survive a server restart. "
        "Set JWT_SECRET in your .env file."
    )

JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

# --- Uploads --------------------------------------------------------------
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", REPO_ROOT / "uploads")).resolve()
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "10"))
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

# --- CORS -----------------------------------------------------------------
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

# --- Misc -----------------------------------------------------------------
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
