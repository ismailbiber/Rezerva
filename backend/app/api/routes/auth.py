from datetime import timedelta

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.core.security import create_access_token
from app.models import User
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserRead
from app.services.users import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db_session), form_data: OAuth2PasswordRequestForm = Depends()
) -> Token:
    user = UserService.authenticate(db, email=form_data.username, password=form_data.password)
    token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(subject=str(user.id), expires_delta=token_expires)
    return Token(access_token=access_token)


@router.post("/register", response_model=UserRead)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(deps.get_db_session),
    _: User = Depends(deps.require_superuser),
) -> UserRead:
    user = UserService.create_user(db, user_in)
    return UserRead.model_validate(user)


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(deps.require_active_user)) -> UserRead:
    return UserRead.model_validate(current_user)
