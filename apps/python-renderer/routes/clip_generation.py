"""
Example route showing how to integrate Supabase with clip generation.
This demonstrates the pattern for saving generated clips to Supabase Storage and DB.
"""
from fastapi import APIRouter, HTTPException
from services.supabase_storage import upload_video_clip
from services.supabase_db import save_clip_record
from services.pika_service import generate_pika_clip
from services.runway_service import generate_runway_clip
import requests
from typing import Dict, Any

router = APIRouter()


async def generate_clip_bytes(url: str) -> bytes:
    """Download clip from URL and return as bytes."""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    return response.content


@router.post("/video")
async def generate_video_clip(request: Dict[str, Any]):
    """
    Generate a video clip and save to Supabase.
    
    Request body:
    {
        "projectId": "uuid",
        "sceneId": "uuid" (optional),
        "provider": "pika" | "runway",
        "prompt": "video generation prompt"
    }
    """
    project_id = request.get("projectId")
    scene_id = request.get("sceneId")
    provider = request.get("provider", "pika")
    prompt = request.get("prompt")

    if not project_id or not prompt:
        raise HTTPException(status_code=400, detail="projectId and prompt are required")

    try:
        # Generate clip using provider
        if provider == "pika":
            result = generate_pika_clip(project_id, prompt)
        elif provider == "runway":
            result = generate_runway_clip(project_id, prompt)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")

        # If result has a URL, download and upload to Supabase
        clip_url = result.get("url") or result.get("clip")
        if not clip_url:
            # If it's a job ID, return that for polling
            return result

        # Download clip
        clip_bytes = await generate_clip_bytes(clip_url)

        # Upload to Supabase Storage
        file_url = upload_video_clip(project_id, scene_id or "clip", clip_bytes, provider)

        # Save to database
        clip_record = save_clip_record(
            project_id=project_id,
            scene_id=scene_id,
            provider=provider,
            file_url=file_url,
            prompt=prompt,
            status="done"
        )

        return {
            "url": file_url,
            "clip": file_url,  # For backward compatibility
            "id": clip_record.get("id"),
            "status": "done"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating clip: {str(e)}")
