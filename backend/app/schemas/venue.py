from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class SpaceBase(BaseModel):
    name: str
    slug: str
    capacity: int = 1
    amenities: Optional[list[str]] = None
    description: Optional[str] = None


class SpaceCreate(SpaceBase):
    venue_id: int


class SpaceUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    capacity: Optional[int] = None
    amenities: Optional[list[str]] = None
    description: Optional[str] = None


class SpaceRead(SpaceBase):
    id: int
    venue_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VenueBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    address: Optional[str] = None
    timezone: str = "UTC"


class VenueCreate(VenueBase):
    spaces: Optional[List[SpaceCreate]] = None


class VenueUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    timezone: Optional[str] = None


class VenueRead(VenueBase):
    id: int
    created_at: datetime
    updated_at: datetime
    spaces: List[SpaceRead] = Field(default_factory=list)

    class Config:
        from_attributes = True
