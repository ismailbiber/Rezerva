from typing import Iterable, Sequence

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models import User, UserRole
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    @staticmethod
    def create_user(db: Session, user_in: UserCreate, *, as_superuser: bool = False) -> User:
        existing = db.scalar(select(User).where(User.email == user_in.email))
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        user = User(
            email=user_in.email.lower(),
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            role=user_in.role,
            is_active=user_in.is_active,
            is_superuser=as_superuser or user_in.role == UserRole.ADMIN,
        )
        db.add(user)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered") from exc
        db.refresh(user)
        return user

    @staticmethod
    def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
        for field, value in user_in.dict(exclude_unset=True).items():
            if field == "password" and value:
                setattr(user, "hashed_password", get_password_hash(value))
            elif field == "email" and value:
                setattr(user, field, value.lower())
            elif value is not None:
                setattr(user, field, value)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> User:
        user = db.scalar(select(User).where(User.email == email.lower()))
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
        return user

    @staticmethod
    def list_users(db: Session, *, skip: int = 0, limit: int = 100) -> Sequence[User]:
        stmt = select(User).offset(skip).limit(limit)
        return db.scalars(stmt).all()

    @staticmethod
    def count_users(db: Session) -> int:
        return db.query(User).count()

    @staticmethod
    def ensure_superuser(db: Session, email: str, password: str, full_name: str | None = None) -> User:
        user = db.scalar(select(User).where(User.email == email.lower()))
        if user:
            if not user.is_superuser:
                user.is_superuser = True
                user.role = UserRole.ADMIN
                db.add(user)
                db.commit()
                db.refresh(user)
            return user
        user_in = UserCreate(email=email, password=password, full_name=full_name or "Administrator", role=UserRole.ADMIN)
        return UserService.create_user(db, user_in, as_superuser=True)

    @staticmethod
    def bulk_create(db: Session, users: Iterable[UserCreate]) -> list[User]:
        created: list[User] = []
        for user_in in users:
            created.append(UserService.create_user(db, user_in))
        return created
