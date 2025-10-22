from datetime import datetime, timedelta
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.models.venue import ReservationStatus, Space, Venue
from app.schemas.reservation import ReservationCreate
from app.services import reservations


def test_ensure_availability_rejects_invalid_range():
    db = MagicMock()
    with pytest.raises(HTTPException):
        reservations.ReservationService._ensure_availability(
            db, space_id=1, start_time=datetime.utcnow(), end_time=datetime.utcnow() - timedelta(hours=1)
        )


def test_create_reservation_enqueues_confirmation(monkeypatch):
    venue = Venue(id=1, name="Test Venue", slug="test-venue", timezone="UTC")
    space = Space(id=1, name="Salon", slug="salon", venue=venue, capacity=10, amenities=[])
    payload = ReservationCreate(
        space_id=1,
        customer_name="Jane Doe",
        customer_email="jane@example.com",
        start_time=datetime.utcnow() + timedelta(hours=1),
        end_time=datetime.utcnow() + timedelta(hours=2),
        status=ReservationStatus.CONFIRMED,
    )

    db = MagicMock()
    db.get.side_effect = lambda model, pk: space if model is Space and pk == 1 else None

    called = {}

    def fake_queue(reservation_id: int, customer_email: str) -> None:  # pragma: no cover - trivial
        called["reservation_id"] = reservation_id
        called["customer_email"] = customer_email

    monkeypatch.setattr(reservations, "queue_reservation_confirmation", fake_queue)
    reservation = reservations.ReservationService.create_reservation(db, payload)

    assert reservation.customer_email == "jane@example.com"
    assert called["customer_email"] == "jane@example.com"
    db.add.assert_called()
    db.commit.assert_called()
    db.refresh.assert_called()
