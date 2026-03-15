import asyncio
import logging
from celery import Celery
from celery.schedules import crontab

from app.config import settings

logger = logging.getLogger(__name__)

celery_app = Celery(
    "vlubvi_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.services.matching"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Moscow",
    enable_utc=True,
    worker_concurrency=2,
    task_track_started=True,
    beat_schedule={
        "renew_subscriptions_daily": {
            "task": "app.services.matching.renew_subscriptions_task",
            "schedule": crontab(hour=6, minute=0), # 09:00 MSK
        },
        "gdpr_hard_delete_daily": {
            "task": "app.services.matching.gdpr_hard_delete_task",
            "schedule": crontab(hour=1, minute=0), # Nightly
        }
    }
)
