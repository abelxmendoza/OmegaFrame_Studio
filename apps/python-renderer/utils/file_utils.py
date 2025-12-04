import os
import requests
from pathlib import Path
from config import PROJECTS_DIR


def ensure_project_folder(project_id: str) -> Path:
    """Create project folder structure if it doesn't exist."""
    folder = PROJECTS_DIR / project_id
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "clips").mkdir(exist_ok=True)
    return folder


def save_audio(project_id: str, data: bytes) -> str:
    """Save audio data to project folder."""
    folder = ensure_project_folder(project_id)
    path = folder / "audio.wav"
    with open(path, "wb") as f:
        f.write(data)
    return str(path)


def save_clip(project_id: str, url: str) -> str:
    """Download and save video clip from URL."""
    folder = ensure_project_folder(project_id)
    filename = os.path.basename(url).split("?")[0]  # Remove query params
    if not filename.endswith((".mp4", ".mov", ".webm")):
        filename = f"{filename}.mp4"
    clip_path = folder / "clips" / filename
    
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    with open(clip_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    return str(clip_path)


def save_image(project_id: str, url: str) -> str:
    """Download and save image from URL."""
    folder = ensure_project_folder(project_id)
    filename = os.path.basename(url).split("?")[0]
    if not filename.endswith((".jpg", ".jpeg", ".png", ".webp")):
        filename = f"{filename}.jpg"
    image_path = folder / "clips" / filename
    
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    with open(image_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    return str(image_path)


def get_project_paths(project_id: str) -> dict:
    """Get all paths for a project."""
    folder = ensure_project_folder(project_id)
    clips_dir = folder / "clips"
    
    # Get all media files
    clips = []
    if clips_dir.exists():
        clips = [str(p) for p in clips_dir.glob("*") if p.is_file()]
    
    return {
        "folder": str(folder),
        "audio": str(folder / "audio.wav"),
        "clips": clips,
        "final": str(folder / "final.mp4"),
    }

