"""
Job publish helpers for sending progress updates via Redis.
"""
import json
from .redis_client import get_redis_client, CHANNEL_PREFIX


async def publish(job_id: str, event: dict):
    """Publish an event to Redis for a specific job."""
    try:
        redis = await get_redis_client()
        await redis.publish(
            f"{CHANNEL_PREFIX}{job_id}",
            json.dumps(event)
        )
    except Exception as e:
        print(f"Error publishing to Redis: {e}")


async def publish_progress(job_id: str, progress: int, message: str = ""):
    """Publish progress update."""
    await publish(job_id, {
        "type": "progress",
        "progress": progress,
        "message": message,
    })


async def publish_status(job_id: str, status: str, message: str = ""):
    """Publish status update."""
    await publish(job_id, {
        "type": "status",
        "status": status,
        "message": message,
    })


async def publish_error(job_id: str, error: str):
    """Publish error update."""
    await publish(job_id, {
        "type": "error",
        "status": "error",
        "message": error,
    })


async def publish_complete(job_id: str, result: dict = None):
    """Publish completion update."""
    await publish(job_id, {
        "type": "complete",
        "status": "success",
        "progress": 100,
        "result": result or {},
    })
