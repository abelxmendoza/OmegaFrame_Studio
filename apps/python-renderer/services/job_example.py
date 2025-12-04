"""
Example: How to use job publishing in your services.

This shows how to integrate real-time progress updates into clip generation,
voice generation, rendering, etc.
"""
import asyncio
from .job_publish import publish_progress, publish_status, publish_complete, publish_error
from uuid import uuid4


async def example_generate_clip(job_id: str, project_id: str, prompt: str):
    """
    Example clip generation with real-time progress updates.
    """
    try:
        # Start job
        await publish_status(job_id, "running", "Starting clip generation...")
        await publish_progress(job_id, 0, "Initializing...")

        # Step 1: Prepare request
        await publish_progress(job_id, 10, "Preparing generation request...")
        await asyncio.sleep(0.5)  # Simulate work

        # Step 2: Call Pika/Runway API
        await publish_progress(job_id, 30, "Calling video generation API...")
        await asyncio.sleep(2)  # Simulate API call

        # Step 3: Download video
        await publish_progress(job_id, 60, "Downloading generated video...")
        await asyncio.sleep(1)  # Simulate download

        # Step 4: Process video
        await publish_progress(job_id, 80, "Processing video...")
        await asyncio.sleep(0.5)

        # Step 5: Upload to Supabase
        await publish_progress(job_id, 90, "Uploading to cloud storage...")
        await asyncio.sleep(1)

        # Complete
        result = {
            "url": "https://example.com/clip.mp4",
            "thumbnail": "https://example.com/thumb.png",
        }
        await publish_complete(job_id, result)
        await publish_progress(job_id, 100, "Clip generated successfully!")

    except Exception as e:
        await publish_error(job_id, str(e))
        raise


async def example_render_video(job_id: str, project_id: str, clips: list):
    """
    Example video rendering with real-time progress updates.
    """
    try:
        await publish_status(job_id, "running", "Starting video render...")
        await publish_progress(job_id, 0, "Initializing render pipeline...")

        # Step 1: Prepare clips
        await publish_progress(job_id, 10, "Preparing video clips...")
        await asyncio.sleep(0.5)

        # Step 2: Trim clips
        await publish_progress(job_id, 30, "Trimming clips...")
        await asyncio.sleep(1)

        # Step 3: Concatenate
        await publish_progress(job_id, 50, "Concatenating clips with FFmpeg...")
        await asyncio.sleep(2)

        # Step 4: Add audio
        await publish_progress(job_id, 70, "Adding audio track...")
        await asyncio.sleep(1)

        # Step 5: Generate thumbnail
        await publish_progress(job_id, 85, "Generating thumbnail...")
        await asyncio.sleep(0.5)

        # Step 6: Upload final video
        await publish_progress(job_id, 95, "Uploading final video...")
        await asyncio.sleep(1)

        # Complete
        result = {
            "videoUrl": "https://example.com/final.mp4",
            "thumbnail": "https://example.com/thumb.png",
        }
        await publish_complete(job_id, result)
        await publish_progress(job_id, 100, "Render complete!")

    except Exception as e:
        await publish_error(job_id, str(e))
        raise
