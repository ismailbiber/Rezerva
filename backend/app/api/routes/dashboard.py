from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api import deps
from app.models import Reservation, Space, Venue
from app.schemas.reservation import ReservationRead

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_summary(db: Session = Depends(deps.get_db_session)) -> dict:
    total_venues = db.scalar(select(func.count()).select_from(Venue)) or 0
    total_spaces = db.scalar(select(func.count()).select_from(Space)) or 0
    total_reservations = db.scalar(select(func.count()).select_from(Reservation)) or 0
    upcoming_stmt = (
        select(Reservation)
        .where(Reservation.start_time >= datetime.utcnow() - timedelta(hours=1))
        .order_by(Reservation.start_time)
        .limit(5)
    )
    upcoming = db.scalars(upcoming_stmt).all()
    return {
        "totals": {
            "venues": total_venues,
            "spaces": total_spaces,
            "reservations": total_reservations,
        },
        "upcoming": [ReservationRead.model_validate(r, from_attributes=True) for r in upcoming],
    }
