"""
Supabase Storage service for uploading files.
"""
import os
from supabase import create_client, Client
from typing import Optional

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
    print("✅ Supabase storage client initialized")


def upload_file(
    bucket: str,
    path: str,
    file_bytes: bytes,
    content_type: str = "application/octet-stream"
) -> str:
    """
    Upload a file to Supabase Storage.
    
    Args:
        bucket: Storage bucket name
        path: File path within bucket
        file_bytes: File content as bytes
        content_type: MIME type of the file
        
    Returns:
        Public URL of the uploaded file
        
    Raises:
        Exception: If upload fails or Supabase is not configured
    """
    if not supabase:
        raise Exception("Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY")
    
    # Upload file
    res = supabase.storage.from_(bucket).upload(
        path,
        file_bytes,
        file_options={"content-type": content_type, "upsert": True}
    )
    
    if res.get("error"):
        raise Exception(f"Supabase upload error: {res['error']}")
    
    # Get public URL
    public_res = supabase.storage.from_(bucket).get_public_url(path)
    return public_res


def upload_video_clip(project_id: str, scene_id: str, file_bytes: bytes, provider: str = "pika") -> str:
    """
    Upload a video clip to Supabase Storage.
    
    Args:
        project_id: Project ID
        scene_id: Scene ID (or clip identifier)
        file_bytes: Video file bytes
        provider: Video provider (pika, runway, etc.)
        
    Returns:
        Public URL of the uploaded clip
    """
    path = f"projects/{project_id}/clips/{scene_id}.mp4"
    return upload_file("clips", path, file_bytes, "video/mp4")


def upload_audio_file(project_id: str, file_bytes: bytes, filename: str = "audio.wav") -> str:
    """
    Upload an audio file to Supabase Storage.
    
    Args:
        project_id: Project ID
        file_bytes: Audio file bytes
        filename: Audio filename
        
    Returns:
        Public URL of the uploaded audio
    """
    path = f"projects/{project_id}/audio/{filename}"
    return upload_file("audio", path, file_bytes, "audio/wav")


def upload_final_video(project_id: str, file_bytes: bytes, filename: str = "final.mp4") -> str:
    """
    Upload final rendered video to Supabase Storage.
    
    Args:
        project_id: Project ID
        file_bytes: Video file bytes
        filename: Video filename
        
    Returns:
        Public URL of the uploaded video
    """
    path = f"projects/{project_id}/final/{filename}"
    return upload_file("exports", path, file_bytes, "video/mp4")


def upload_thumbnail(project_id: str, file_bytes: bytes, filename: str = "thumbnail.png") -> str:
    """
    Upload a thumbnail image to Supabase Storage.
    
    Args:
        project_id: Project ID
        file_bytes: Image file bytes
        filename: Image filename
        
    Returns:
        Public URL of the uploaded thumbnail
    """
    path = f"projects/{project_id}/thumbnails/{filename}"
    return upload_file("thumbnails", path, file_bytes, "image/png")


def delete_file(bucket: str, path: str) -> None:
    """
    Delete a file from Supabase Storage.
    
    Args:
        bucket: Storage bucket name
        path: File path within bucket
        
    Raises:
        Exception: If deletion fails
    """
    if not supabase:
        raise Exception("Supabase not configured")
    
    res = supabase.storage.from_(bucket).remove([path])
    if res.get("error"):
        raise Exception(f"Supabase delete error: {res['error']}")
