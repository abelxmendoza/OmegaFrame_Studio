import requests
import time
from config import RUNWAY_API_KEY
from utils.file_utils import save_clip
from typing import Dict, Any


def generate_runway_clip(project_id: str, prompt: str) -> dict:
    """Generate video clip using Runway Gen-2 API."""
    if not RUNWAY_API_KEY:
        raise ValueError("RUNWAY_API_KEY not configured")
    
    # Submit generation request
    url = "https://api.runwayml.com/v1/gen2"
    headers = {
        "Authorization": f"Bearer {RUNWAY_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "prompt": prompt,
        "ratio": "16:9",
    }
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    
    data = response.json()
    
    # Runway returns a job/task ID, you'll need to poll for completion
    if "asset_url" in data or "url" in data:
        asset_url = data.get("asset_url") or data.get("url")
        clip_path = save_clip(project_id, asset_url)
        return {
            "clip": clip_path,
            "url": asset_url,
            "status": "completed",
        }
    elif "task_id" in data or "id" in data:
        # Return task ID for polling
        task_id = data.get("task_id") or data.get("id")
        return {
            "task_id": task_id,
            "job_id": task_id,  # Use job_id for consistency
            "status": "processing",
            "message": "Video generation started. Poll for completion.",
            "provider": "runway",
        }
    else:
        raise ValueError("Unexpected response from Runway API")


def poll_runway_job(job_id: str, max_attempts: int = 60, poll_interval: int = 3) -> Dict[str, Any]:
    """
    Poll Runway API for job completion.
    
    Args:
        job_id: The Runway task/job ID to poll
        max_attempts: Maximum number of polling attempts (default: 60 = 3 minutes)
        poll_interval: Seconds between polls (default: 3)
    
    Returns:
        dict with status, video_url (if completed), or error
    """
    if not RUNWAY_API_KEY:
        raise ValueError("RUNWAY_API_KEY not configured")
    
    url = f"https://api.runwayml.com/v1/tasks/{job_id}"
    headers = {
        "Authorization": f"Bearer {RUNWAY_API_KEY}",
        "Content-Type": "application/json",
    }
    
    for attempt in range(max_attempts):
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Check task status
            status = data.get("status", "").lower()
            
            if status == "succeeded" or status == "completed":
                # Get video URL from output
                output = data.get("output") or data.get("result")
                if isinstance(output, list) and len(output) > 0:
                    video_url = output[0].get("url") if isinstance(output[0], dict) else output[0]
                elif isinstance(output, dict):
                    video_url = output.get("url") or output.get("video_url")
                elif "asset_url" in data:
                    video_url = data["asset_url"]
                else:
                    video_url = None
                
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

