from loguru import logger
from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "rezerva",
    broker=settings.effective_celery_broker,
    backend=settings.effective_celery_backend,
)


@celery_app.task(name="notifications.send_reservation_confirmation")
def send_reservation_confirmation(reservation_id: int, customer_email: str) -> None:
    logger.info("Sending confirmation for reservation %s to %s", reservation_id, customer_email)


def queue_reservation_confirmation(reservation_id: int, customer_email: str) -> None:
    try:
        send_reservation_confirmation.delay(reservation_id, customer_email)
    except Exception as exc:  # pragma: no cover - only logs if broker missing
        logger.warning("Celery broker unreachable, skipping confirmation dispatch: %s", exc)
