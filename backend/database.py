"""Database engine, session factory and initialization.

Uses SQLAlchemy 2.x with a declarative base. The database URL comes from
the DATABASE_URL environment variable (SQLite by default, switchable to
PostgreSQL without changing any model code).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from . import config


class Base(DeclarativeBase):
    """Declarative base for all UrbanEye models."""


# `connect_args` keeps SQLite happy when the same engine is used across
# threads (e.g. FastAPI's threadpool). It is ignored by other databases.
connect_args = {}
if config.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    config.DATABASE_URL,
    connect_args=connect_args,
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables (and the upload folder) if they don't exist yet."""
    # Import models so they are registered on the Base metadata.
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


if __name__ == "__main__":
    init_db()
    print("[UrbanEye] Database initialized.")
