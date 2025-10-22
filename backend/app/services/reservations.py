from datetime import datetime
from typing import Sequence

from fastapi import HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.models import Reservation, ReservationStatus, Space
from app.schemas.reservation import ReservationCreate, ReservationUpdate
from app.services.tasks import queue_reservation_confirmation


class ReservationService:
    @staticmethod
    def _ensure_availability(
        db: Session, space_id: int, start_time: datetime, end_time: datetime, *, exclude_id: int | None = None
    ) -> None:
        if start_time >= end_time:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End time must be after start time")
        overlapping_stmt = select(Reservation).where(
            Reservation.space_id == space_id,
            Reservation.status != ReservationStatus.CANCELLED,
            or_(
                and_(Reservation.start_time <= start_time, Reservation.end_time > start_time),
                and_(Reservation.start_time < end_time, Reservation.end_time >= end_time),
                and_(Reservation.start_time >= start_time, Reservation.end_time <= end_time),
            ),
        )
        if exclude_id is not None:
            overlapping_stmt = overlapping_stmt.where(Reservation.id != exclude_id)
        if db.scalar(overlapping_stmt) is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Time slot is not available")

    @staticmethod
    def create_reservation(db: Session, reservation_in: ReservationCreate) -> Reservation:
        space = db.get(Space, reservation_in.space_id)
        if not space:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")
        ReservationService._ensure_availability(
            db, reservation_in.space_id, reservation_in.start_time, reservation_in.end_time
        )
        reservation = Reservation(
            space=space,
            booked_by_id=reservation_in.booked_by_id,
            customer_name=reservation_in.customer_name,
            customer_email=reservation_in.customer_email,
            customer_phone=reservation_in.customer_phone,
            start_time=reservation_in.start_time,
            end_time=reservation_in.end_time,
            status=reservation_in.status,
            notes=reservation_in.notes,
        )
        db.add(reservation)
        db.commit()
        db.refresh(reservation)
        queue_reservation_confirmation(reservation.id, reservation.customer_email)
        return reservation

    @staticmethod
    def update_reservation(db: Session, reservation: Reservation, reservation_in: ReservationUpdate) -> Reservation:
        data = reservation_in.dict(exclude_unset=True)
        start_time = data.get("start_time", reservation.start_time)
        end_time = data.get("end_time", reservation.end_time)
        ReservationService._ensure_availability(db, reservation.space_id, start_time, end_time, exclude_id=reservation.id)
        for field, value in data.items():
            setattr(reservation, field, value)
        db.add(reservation)
        db.commit()
        db.refresh(reservation)
        queue_reservation_confirmation(reservation.id, reservation.customer_email)
        return reservation

    @staticmethod
    def cancel_reservation(db: Session, reservation: Reservation) -> Reservation:
        reservation.status = ReservationStatus.CANCELLED
        db.add(reservation)
        db.commit()
        db.refresh(reservation)
        queue_reservation_confirmation(reservation.id, reservation.customer_email)
        return reservation

    @staticmethod
    def list_reservations(
        db: Session,
        *,
        skip: int = 0,
        limit: int = 200,
        space_id: int | None = None,
        status_filter: ReservationStatus | None = None,
        start_from: datetime | None = None,
        end_before: datetime | None = None,
    ) -> Sequence[Reservation]:
        stmt = select(Reservation)
        if space_id is not None:
            stmt = stmt.where(Reservation.space_id == space_id)
        if status_filter is not None:
            stmt = stmt.where(Reservation.status == status_filter)
        if start_from is not None:
            stmt = stmt.where(Reservation.end_time >= start_from)
        if end_before is not None:
            stmt = stmt.where(Reservation.start_time <= end_before)
        stmt = stmt.order_by(Reservation.start_time).offset(skip).limit(limit)
        return db.scalars(stmt).unique().all()

    @staticmethod
    def count_reservations(db: Session) -> int:
        return db.query(Reservation).count()

    @staticmethod
    def get_reservation(db: Session, reservation_id: int) -> Reservation | None:
        return db.get(Reservation, reservation_id)

    @staticmethod
    def available_spaces(
        db: Session, start_time: datetime, end_time: datetime, *, venue_id: int | None = None
    ) -> Sequence[Space]:
        if start_time >= end_time:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End time must be after start time")
        occupied_stmt = select(Reservation.space_id).where(
            Reservation.status != ReservationStatus.CANCELLED,
            or_(
                and_(Reservation.start_time <= start_time, Reservation.end_time > start_time),
                and_(Reservation.start_time < end_time, Reservation.end_time >= end_time),
                and_(Reservation.start_time >= start_time, Reservation.end_time <= end_time),
            ),
        )
        stmt = select(Space).where(~Space.id.in_(occupied_stmt))
        if venue_id is not None:
            stmt = stmt.where(Space.venue_id == venue_id)
        return db.scalars(stmt).unique().all()
