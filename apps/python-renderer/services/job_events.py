"""
Job event listener that bridges Redis pub/sub to WebSocket broadcasts.
"""
import asyncio
import json
from .redis_client import get_redis_client, CHANNEL_PREFIX
from .ws_manager import ws_manager


async def job_event_listener():
    """Listen to Redis pub/sub and forward to WebSockets."""
    try:
        redis = await get_redis_client()
        pubsub = redis.pubsub()
        await pubsub.psubscribe(f"{CHANNEL_PREFIX}*")
        
        print("✅ Job event listener started, listening on Redis...")
        
        async for message in pubsub.listen():
            if message["type"] != "pmessage":
                continue
            
            try:
                channel = message["channel"].replace(CHANNEL_PREFIX, "")
                job_id = channel
                payload = json.loads(message["data"])
                
                # Forward to WebSocket clients
                await ws_manager.broadcast(job_id, payload)
                
            except json.JSONDecodeError as e:
                print(f"Error parsing Redis message: {e}")
            except Exception as e:
                print(f"Error in job event listener: {e}")
                
    except Exception as e:
        print(f"Fatal error in job event listener: {e}")
        # Retry after delay
        await asyncio.sleep(5)
        await job_event_listener()


async def start_job_event_listener():
    """Start the job event listener in background."""
    task = asyncio.create_task(job_event_listener())
    return task
