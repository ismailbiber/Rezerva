from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models here so Alembic autogenerates tables
from app.models import user  # noqa: F401
from app.models import venue  # noqa: F401
