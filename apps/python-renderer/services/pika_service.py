import requests
import time
from config import PIKA_API_KEY
from utils.file_utils import save_clip
from typing import Dict, Any, Optional


def generate_pika_clip(project_id: str, prompt: str) -> dict:
    """Generate video clip using Pika API."""
    if not PIKA_API_KEY:
        raise ValueError("PIKA_API_KEY not configured")
    
    # Submit generation request
    url = "https://api.pika.art/api/v1/video"
    headers = {
        "Authorization": f"Bearer {PIKA_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "prompt": prompt,
        "aspect_ratio": "16:9",
    }
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    
    data = response.json()
    
    # Pika returns a job ID, you'll need to poll for completion
    # For now, we'll assume it returns a video URL directly
    # In production, implement polling logic
    if "video_url" in data:
        clip_path = save_clip(project_id, data["video_url"])
        return {
            "clip": clip_path,
            "url": data["video_url"],
            "status": "completed",
        }
    elif "job_id" in data or "id" in data:
        # Return job ID for polling
        job_id = data.get("job_id") or data.get("id")
        return {
            "job_id": job_id,
            "status": "processing",
            "message": "Video generation started. Poll for completion.",
            "provider": "pika",
        }
    else:
        raise ValueError("Unexpected response from Pika API")


def poll_pika_job(job_id: str, max_attempts: int = 60, poll_interval: int = 3) -> Dict[str, Any]:
    """
    Poll Pika API for job completion.
    
    Args:
        job_id: The Pika job ID to poll
        max_attempts: Maximum number of polling attempts (default: 60 = 3 minutes)
        poll_interval: Seconds between polls (default: 3)
    
    Returns:
        dict with status, video_url (if completed), or error
    """
    if not PIKA_API_KEY:
        raise ValueError("PIKA_API_KEY not configured")
    
    url = f"https://api.pika.art/api/v1/video/{job_id}"
    headers = {
        "Authorization": f"Bearer {PIKA_API_KEY}",
        "Content-Type": "application/json",
    }
    
    for attempt in range(max_attempts):
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Check job status
            status = data.get("status", "").lower()
            
            if status == "completed" or "video_url" in data or "video" in data:
                video_url = data.get("video_url") or data.get("video") or data.get("url")
                if video_url:
                    return {
                        "status": "completed",
                        "video_url": video_url,
                        "url": video_url,
                        "job_id": job_id,
                    }
            
            if status == "failed" or status == "error":
                error_msg = data.get("error") or data.get("message") or "Generation failed"
                return {
                    "status": "failed",
                    "error": error_msg,
                    "job_id": job_id,
                }
            
            # Still processing
            progress = data.get("progress", 0)
            return {
                "status": "processing",
                "progress": progress,
                "job_id": job_id,
                "message": data.get("message", "Generating video..."),
            }
            
        except requests.exceptions.RequestException as e:
            # On last attempt, return error
            if attempt == max_attempts - 1:
                return {
                    "status": "error",
                    "error": f"Polling failed: {str(e)}",
                    "job_id": job_id,
                }
            # Otherwise, wait and retry
            time.sleep(poll_interval)
            continue
        
        # Wait before next poll
        if attempt < max_attempts - 1:
            time.sleep(poll_interval)
    
    # Timeout
    return {
        "status": "timeout",
        "error": "Job polling timed out after maximum attempts",
        "job_id": job_id,
    }

