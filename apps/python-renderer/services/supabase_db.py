"""
Supabase Database service for CRUD operations.
"""
import os
from supabase import create_client, Client
from typing import Optional, Dict, Any, List

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL", "https://kdycnltygfhduvpprruz.supabase.co")
# Note: Backend should use SERVICE ROLE KEY, not anon key
# Get this from Supabase Dashboard > Settings > API > service_role key
supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_service_key:
    print("Warning: Supabase SERVICE KEY not configured. Set SUPABASE_SERVICE_KEY")
    print("Note: Use the service_role key (not anon key) for backend operations")

supabase: Optional[Client] = None
if supabase_url and supabase_service_key:
    supabase = create_client(supabase_url, supabase_service_key)
    print("✅ Supabase database client initialized")


def save_clip_record(
    project_id: str,
    scene_id: Optional[str],
    provider: str,
    file_url: str,
    thumbnail_url: Optional[str] = None,
    duration: Optional[float] = None,
    prompt: Optional[str] = None,
    status: str = "done",
    order_index: int = 0
) -> Dict[str, Any]:
    """
    Save or update a clip record in the database.
    
    Args:
        project_id: Project ID
        scene_id: Scene ID (optional)
        provider: Video provider (pika, runway, etc.)
        file_url: URL of the clip file
        thumbnail_url: URL of the thumbnail (optional)
        duration: Clip duration in seconds (optional)
        prompt: Generation prompt (optional)
        status: Clip status (default: "done")
        order_index: Order in timeline (default: 0)
        
    Returns:
        Saved clip record
        
    Raises:
        Exception: If save fails or Supabase is not configured
    """
    if not supabase:
        raise Exception("Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY")
    
    clip_data = {
        "project_id": project_id,
        "scene_id": scene_id,
        "provider": provider,
        "file_url": file_url,
        "thumbnail_url": thumbnail_url,
        "duration": duration,
        "prompt": prompt,
        "status": status,
        "order_index": order_index,
    }
    
    # Remove None values
    clip_data = {k: v for k, v in clip_data.items() if v is not None}
    
    res = supabase.table("clips").upsert(clip_data).execute()
    
    if not res.data:
        raise Exception("Failed to save clip record")
    
    return res.data[0] if isinstance(res.data, list) else res.data


def save_export_record(
    project_id: str,
    file_url: str,
    thumbnail_url: Optional[str] = None,
    resolution: Optional[str] = None,
    duration: Optional[float] = None
) -> Dict[str, Any]:
    """
    Save an export record in the database.
    
    Args:
        project_id: Project ID
        file_url: URL of the exported video
        thumbnail_url: URL of the thumbnail (optional)
        resolution: Video resolution (optional)
        duration: Video duration in seconds (optional)
        
    Returns:
        Saved export record
        
    Raises:
        Exception: If save fails or Supabase is not configured
    """
    if not supabase:
        raise Exception("Supabase not configured")
    
    export_data = {
        "project_id": project_id,
        "file_url": file_url,
        "thumbnail_url": thumbnail_url,
        "resolution": resolution,
        "duration": duration,
    }
    
    # Remove None values
    export_data = {k: v for k, v in export_data.items() if v is not None}
    
    res = supabase.table("exports").insert(export_data).execute()
    
    if not res.data:
        raise Exception("Failed to save export record")
    
    return res.data[0] if isinstance(res.data, list) else res.data


def update_project_status(project_id: str, status: str) -> Dict[str, Any]:
    """
    Update project status.
    
    Args:
        project_id: Project ID
        status: New status (draft, generating, rendering, completed, error)
        
    Returns:
        Updated project record
        
    Raises:
        Exception: If update fails
    """
    if not supabase:
        raise Exception("Supabase not configured")
    
    res = supabase.table("projects").update({"status": status}).eq("id", project_id).execute()
    
    if not res.data:
        raise Exception("Failed to update project status")
    
    return res.data[0] if isinstance(res.data, list) else res.data


def get_project_clips(project_id: str) -> List[Dict[str, Any]]:
    """
    Get all clips for a project.
    
    Args:
        project_id: Project ID
        
    Returns:
        List of clip records
        
    Raises:
        Exception: If query fails
    """
    if not supabase:
        raise Exception("Supabase not configured")
    
    res = supabase.table("clips").select("*").eq("project_id", project_id).order("order_index").execute()
    
    if not res.data:
        return []
    
    return res.data if isinstance(res.data, list) else [res.data]
