from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models import User
from app.schemas.common import PaginatedResponse
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.users import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=PaginatedResponse[UserRead])
def list_users(
    *, db: Session = Depends(deps.get_db_session), _: User = Depends(deps.require_superuser), skip: int = 0, limit: int = 100
) -> PaginatedResponse[UserRead]:
    users = UserService.list_users(db, skip=skip, limit=min(limit, 250))
    total = UserService.count_users(db)
    return PaginatedResponse(total=total, items=[UserRead.model_validate(u) for u in users])


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    *, user_in: UserCreate, db: Session = Depends(deps.get_db_session), _: User = Depends(deps.require_superuser)
) -> UserRead:
    user = UserService.create_user(db, user_in)
    return UserRead.model_validate(user)


@router.get("/{user_id}", response_model=UserRead)
def read_user(
    *, user_id: int, db: Session = Depends(deps.get_db_session), current_user: User = Depends(deps.require_active_user)
) -> UserRead:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
    return UserRead.model_validate(user)


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    *,
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(deps.get_db_session),
    _: User = Depends(deps.require_superuser),
) -> UserRead:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    updated_user = UserService.update_user(db, user, user_in)
    return UserRead.model_validate(updated_user)
