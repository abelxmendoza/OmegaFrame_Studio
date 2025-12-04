"""
Redis client for pub/sub messaging.
"""
import os
import redis.asyncio as redis
from typing import Optional

# Redis connection
redis_client: Optional[redis.Redis] = None

CHANNEL_PREFIX = "OMEGAFRAME_JOB_"


async def get_redis_client() -> redis.Redis:
    """Get or create Redis client."""
    global redis_client
    if redis_client is None:
        redis_client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", "6379")),
            decode_responses=True,
            db=0,
        )
    return redis_client


async def close_redis():
    """Close Redis connection."""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
