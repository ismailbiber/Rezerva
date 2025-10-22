from typing import Sequence

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Space, Venue
from app.schemas.venue import SpaceCreate, SpaceUpdate, VenueCreate, VenueUpdate


class VenueService:
    @staticmethod
    def create_venue(db: Session, venue_in: VenueCreate) -> Venue:
        venue = Venue(
            name=venue_in.name,
            slug=venue_in.slug,
            description=venue_in.description,
            address=venue_in.address,
            timezone=venue_in.timezone,
        )
        db.add(venue)
        try:
            db.flush()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Venue already exists") from exc

        if venue_in.spaces:
            for space_in in venue_in.spaces:
                VenueService._create_space(db, venue, space_in)
        db.commit()
        db.refresh(venue)
        return venue

    @staticmethod
    def _create_space(db: Session, venue: Venue, space_in: SpaceCreate) -> Space:
        space = Space(
            name=space_in.name,
            slug=space_in.slug,
            capacity=space_in.capacity,
            amenities=space_in.amenities or [],
            description=space_in.description,
            venue=venue,
        )
        db.add(space)
        return space

    @staticmethod
    def update_venue(db: Session, venue: Venue, venue_in: VenueUpdate) -> Venue:
        for field, value in venue_in.dict(exclude_unset=True).items():
            setattr(venue, field, value)
        db.add(venue)
        db.commit()
        db.refresh(venue)
        return venue

    @staticmethod
    def delete_venue(db: Session, venue: Venue) -> None:
        db.delete(venue)
        db.commit()

    @staticmethod
    def list_venues(db: Session, *, skip: int = 0, limit: int = 100) -> Sequence[Venue]:
        stmt = select(Venue).offset(skip).limit(limit)
        return db.scalars(stmt).unique().all()

    @staticmethod
    def count_venues(db: Session) -> int:
        return db.query(Venue).count()

    @staticmethod
    def get_venue(db: Session, venue_id: int) -> Venue | None:
        return db.get(Venue, venue_id)


class SpaceService:
    @staticmethod
    def create_space(db: Session, space_in: SpaceCreate) -> Space:
        venue = db.get(Venue, space_in.venue_id)
        if not venue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
        space = Space(
            venue=venue,
            name=space_in.name,
            slug=space_in.slug,
            capacity=space_in.capacity,
            amenities=space_in.amenities or [],
            description=space_in.description,
        )
        db.add(space)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Space already exists") from exc
        db.refresh(space)
        return space

    @staticmethod
    def update_space(db: Session, space: Space, space_in: SpaceUpdate) -> Space:
        for field, value in space_in.dict(exclude_unset=True).items():
            if value is not None:
                setattr(space, field, value)
        db.add(space)
        db.commit()
        db.refresh(space)
        return space

    @staticmethod
    def delete_space(db: Session, space: Space) -> None:
        db.delete(space)
        db.commit()

    @staticmethod
    def list_spaces(db: Session, *, skip: int = 0, limit: int = 200) -> Sequence[Space]:
        stmt = select(Space).offset(skip).limit(limit)
        return db.scalars(stmt).unique().all()

    @staticmethod
    def get_space(db: Session, space_id: int) -> Space | None:
        return db.get(Space, space_id)

    @staticmethod
    def count_spaces(db: Session) -> int:
        return db.query(Space).count()
