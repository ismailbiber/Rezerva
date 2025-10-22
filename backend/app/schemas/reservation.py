from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.venue import ReservationStatus


class ReservationBase(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: ReservationStatus = ReservationStatus.PENDING
    notes: Optional[str] = None


class ReservationCreate(ReservationBase):
    space_id: int
    booked_by_id: Optional[int] = Field(default=None, description="User responsible for the reservation")


class ReservationUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    customer_phone: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[ReservationStatus] = None
    notes: Optional[str] = None
    booked_by_id: Optional[int] = None


class ReservationRead(ReservationBase):
    id: int
    space_id: int
    booked_by_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
