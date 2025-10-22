from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models import ReservationStatus, User
from app.schemas.common import PaginatedResponse
from app.schemas.reservation import ReservationCreate, ReservationRead, ReservationUpdate
from app.schemas.venue import SpaceRead
from app.services.reservations import ReservationService

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.get("/", response_model=PaginatedResponse[ReservationRead])
def list_reservations(
    *,
    db: Session = Depends(deps.get_db_session),
    skip: int = 0,
    limit: int = 100,
    space_id: int | None = None,
    status_filter: ReservationStatus | None = Query(default=None, alias="status"),
    start_from: datetime | None = None,
    end_before: datetime | None = None,
) -> PaginatedResponse[ReservationRead]:
    reservations = ReservationService.list_reservations(
        db,
        skip=skip,
        limit=min(limit, 200),
        space_id=space_id,
        status_filter=status_filter,
        start_from=start_from,
        end_before=end_before,
    )
    total = ReservationService.count_reservations(db)
    items = [ReservationRead.model_validate(r, from_attributes=True) for r in reservations]
    return PaginatedResponse(total=total, items=items)


@router.post("/", response_model=ReservationRead, status_code=status.HTTP_201_CREATED)
def create_reservation(
    *,
    reservation_in: ReservationCreate,
    db: Session = Depends(deps.get_db_session),
    current_user: User = Depends(deps.require_active_user),
) -> ReservationRead:
    payload = reservation_in.model_dump()
    if payload.get("booked_by_id") is None:
        payload["booked_by_id"] = current_user.id
    reservation = ReservationService.create_reservation(db, ReservationCreate(**payload))
    return ReservationRead.model_validate(reservation, from_attributes=True)


@router.put("/{reservation_id}", response_model=ReservationRead)
def update_reservation(
    *,
    reservation_id: int,
    reservation_in: ReservationUpdate,
    db: Session = Depends(deps.get_db_session),
    _: User = Depends(deps.require_active_user),
) -> ReservationRead:
    reservation = ReservationService.get_reservation(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    updated = ReservationService.update_reservation(db, reservation, reservation_in)
    return ReservationRead.model_validate(updated, from_attributes=True)


@router.post("/{reservation_id}/cancel", response_model=ReservationRead)
def cancel_reservation(
    *,
    reservation_id: int,
    db: Session = Depends(deps.get_db_session),
    _: User = Depends(deps.require_active_user),
) -> ReservationRead:
    reservation = ReservationService.get_reservation(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    cancelled = ReservationService.cancel_reservation(db, reservation)
    return ReservationRead.model_validate(cancelled, from_attributes=True)


@router.get("/available", response_model=list[SpaceRead])
def available_spaces(
    *,
    start_time: Annotated[datetime, Query(description="Start datetime in ISO format")],
    end_time: Annotated[datetime, Query(description="End datetime in ISO format")],
    venue_id: int | None = None,
    db: Session = Depends(deps.get_db_session),
    _: User = Depends(deps.require_active_user),
) -> list[SpaceRead]:
    spaces = ReservationService.available_spaces(db, start_time, end_time, venue_id=venue_id)
    return [SpaceRead.model_validate(space, from_attributes=True) for space in spaces]
