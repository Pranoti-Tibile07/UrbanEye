"""Authentication endpoints: register, login, me."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _token_response(user: models.User) -> schemas.TokenResponse:
    return schemas.TokenResponse(
        access_token=auth.create_access_token(user),
        user=schemas.UserOut.model_validate(user),
    )


@router.post("/register", response_model=schemas.TokenResponse, status_code=201)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # Registrations always create citizen accounts. Admin accounts are
    # created via the seed script / manually so roles can't be self-assigned.
    user = auth.create_user(db, payload.name, payload.email, payload.password)
    return _token_response(user)


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = auth.authenticate(db, payload.email, payload.password)
    return _token_response(user)


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(auth.get_current_user)):
    return user
