"""UrbanEye FastAPI application entry point."""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import config
from .database import init_db
from .routers import analyze, auth, dashboard, health, reports


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Ensure tables and the uploads directory exist on startup.
    init_db()
    yield


app = FastAPI(
    title="UrbanEye API",
    description="AI-powered civic issue reporting and monitoring platform.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(analyze.router)
app.include_router(reports.router)
app.include_router(dashboard.router)

# Serve uploaded report images.
config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=config.UPLOAD_DIR), name="uploads")

# --------------------------------------------------------------------------
# Optional: serve the built frontend (Frontend/dist) from the same server.
# This keeps deployment to a single process when a production build exists.
# --------------------------------------------------------------------------
_DIST_DIR = config.REPO_ROOT / "Frontend" / "dist"

if _DIST_DIR.is_dir():
    assets_dir = _DIST_DIR / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str):
        if full_path.startswith(("api/", "uploads/")):
            raise HTTPException(status_code=404, detail="Not found")
        file_path = _DIST_DIR / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(_DIST_DIR / "index.html")
