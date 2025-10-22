from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models import User
from app.schemas.common import PaginatedResponse
from app.schemas.venue import (
    SpaceCreate,
    SpaceRead,
    SpaceUpdate,
    VenueCreate,
    VenueRead,
    VenueUpdate,
)
from app.services.venues import SpaceService, VenueService

router = APIRouter(prefix="/venues", tags=["venues"])


@router.get("/", response_model=PaginatedResponse[VenueRead])
def list_venues(
    *, db: Session = Depends(deps.get_db_session), skip: int = 0, limit: int = 100
) -> PaginatedResponse[VenueRead]:
    venues = VenueService.list_venues(db, skip=skip, limit=min(limit, 200))
    total = VenueService.count_venues(db)
    items = [VenueRead.model_validate(v, from_attributes=True) for v in venues]
    return PaginatedResponse(total=total, items=items)


@router.post("/", response_model=VenueRead, status_code=status.HTTP_201_CREATED)
def create_venue(
    *,
    venue_in: VenueCreate,
    db: Session = Depends(deps.get_db_session),
    _: User = Depends(deps.require_superuser),
) -> VenueRead:
    venue = VenueService.create_venue(db, venue_in)
    return VenueRead.model_validate(venue, from_attributes=True)


@router.get("/{venue_id}", response_model=VenueRead)
def read_venue(*, venue_id: int, db: Session = Depends(deps.get_db_session)) -> VenueRead:
    venue = VenueService.get_venue(db, venue_id)
    if not venue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
    return VenueRead.model_validate(venue, from_attributes=True)


@router.put("/{venue_id}", response_model=VenueRead)
def update_venue(
    *,
    venue_id: int,
    venue_in: VenueUpdate,
    db: Session = Depends(deps.get_db_session),
    _: User = Depends(deps.require_superuser),
) -> VenueRead:
    venue = VenueService.get_venue(db, venue_id)
    if not venue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
    updated = VenueService.update_venue(db, venue, venue_in)
    return VenueRead.model_validate(updated, from_attributes=True)


@router.delete("/{venue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_venue(
    *,
    venue_id: int,
    db: Session = Depends(deps.get_db_session),
    _: User = Depends(deps.require_superuser),
) -> None:
    venue = VenueService.get_venue(db, venue_id)
    if not venue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
    VenueService.delete_venue(db, venue)


@router.post("/{venue_id}/spaces", response_model=SpaceRead, status_code=status.HTTP_201_CREATED)
def create_space_for_venue(
    *,
    venue_id: int,
    space_in: SpaceCreate,
    db: Session = Depends(deps.get_db_session),
    _: User = Depends(deps.require_superuser),
) -> SpaceRead:
    payload = space_in.model_dump()
    payload["venue_id"] = venue_id
    space = SpaceService.create_space(db, SpaceCreate(**payload))
    return SpaceRead.model_validate(space, from_attributes=True)


@router.get("/{venue_id}/spaces", response_model=list[SpaceRead])
def list_spaces_for_venue(*, venue_id: int, db: Session = Depends(deps.get_db_session)) -> Sequence[SpaceRead]:
    venue = VenueService.get_venue(db, venue_id)
    if not venue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
    return [SpaceRead.model_validate(space, from_attributes=True) for space in venue.spaces]


@router.put("/spaces/{space_id}", response_model=SpaceRead)
def update_space(
    *,
    space_id: int,
    space_in: SpaceUpdate,
    db: Session = Depends(deps.get_db_session),
    _: User = Depends(deps.require_superuser),
) -> SpaceRead:
    space = SpaceService.get_space(db, space_id)
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")
    updated = SpaceService.update_space(db, space, space_in)
    return SpaceRead.model_validate(updated, from_attributes=True)



@router.get('/spaces', response_model=list[SpaceRead])
def list_all_spaces(*, db: Session = Depends(deps.get_db_session)) -> list[SpaceRead]:
    spaces = SpaceService.list_spaces(db)
    return [SpaceRead.model_validate(space, from_attributes=True) for space in spaces]
@router.delete("/spaces/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_space(
    *,
    space_id: int,
    db: Session = Depends(deps.get_db_session),
    _: User = Depends(deps.require_superuser),
) -> None:
    space = SpaceService.get_space(db, space_id)
    if not space:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")
    SpaceService.delete_space(db, space)
