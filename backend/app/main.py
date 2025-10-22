from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1 import api_router
from app.core.config import settings
from app.db import session
from app.db.base import Base
from app.services.users import UserService


@asynccontextmanager
def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=session.engine)
    with session.SessionLocal() as db:
        UserService.ensure_superuser(
            db,
            email=settings.SUPERUSER_EMAIL,
            password=settings.SUPERUSER_PASSWORD,
            full_name="System Administrator",
        )
    yield


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan, openapi_url=f"{settings.API_V1_STR}/openapi.json")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix=settings.API_V1_STR)
