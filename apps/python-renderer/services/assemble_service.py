import os
import subprocess
import requests
from pathlib import Path
from utils.file_utils import get_project_paths, save_clip, ensure_project_folder
from utils.ffmpeg_utils import concat_videos, add_audio_to_video
from config import RENDER_DIR, PROJECTS_DIR


def extract_thumbnail(video_path: str, thumbnail_path: str) -> bool:
    """Extract a thumbnail from video at 1 second mark."""
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i", video_path,
                "-ss", "00:00:01",
                "-vframes", "1",
                "-q:v", "2",  # High quality
                str(thumbnail_path),
            ],
            check=True,
            capture_output=True,
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"Thumbnail extraction error: {e.stderr.decode() if e.stderr else 'Unknown error'}")
        return False


def resolve_clip_path(clip: str, project_id: str) -> str:
    """Resolve clip path - handle URLs, relative paths, and absolute paths."""
    # If it's a URL, download it first
    if clip.startswith("http://") or clip.startswith("https://"):
        try:
            return save_clip(project_id, clip)
        except Exception as e:
            print(f"Error downloading clip from URL {clip}: {e}")
            raise ValueError(f"Failed to download clip from URL: {clip}")
    
    # If it's already an absolute path and exists, use it
    if os.path.isabs(clip) and os.path.exists(clip):
        return clip
    
    # Try relative to project clips folder
    project_clips_dir = PROJECTS_DIR / project_id / "clips"
    relative_path = project_clips_dir / clip
    if relative_path.exists():
        return str(relative_path)
    
    # Try as absolute path from current working directory
    abs_path = Path(clip).resolve()
    if abs_path.exists():
        return str(abs_path)
    
    # If we can't find it, raise an error
    raise FileNotFoundError(f"Clip not found: {clip}")


def build_ffmpeg_trim_commands(clips: list[dict], output_path: str) -> list[str]:
    """Build FFmpeg command to trim and concatenate clips."""
    filter_complex_parts = []
    inputs = []
    
    for i, clip in enumerate(clips):
        clip_path = clip["path"]
        start = clip.get("start", 0)
        end = clip.get("end")
        
        inputs += ["-i", clip_path]
        
        # Build trim filter for video and audio
        if end is not None and end > start:
            # Trim both video and audio
            filter_complex_parts.append(
                f"[{i}:v]trim=start={start}:end={end},setpts=PTS-STARTPTS[v{i}];"
                f"[{i}:a]atrim=start={start}:end={end},asetpts=PTS-STARTPTS[a{i}]"
            )
        elif start > 0:
            # Only trim start
            filter_complex_parts.append(
                f"[{i}:v]trim=start={start},setpts=PTS-STARTPTS[v{i}];"
                f"[{i}:a]atrim=start={start},asetpts=PTS-STARTPTS[a{i}]"
            )
        else:
            # No trimming needed
            filter_complex_parts.append(
                f"[{i}:v]copy[v{i}];"
                f"[{i}:a]acopy[a{i}]"
            )
    
    # Concatenate all trimmed clips
    concat_inputs = "".join(f"[v{i}][a{i}]" for i in range(len(clips)))
    filter_complex_parts.append(
        f"{concat_inputs}concat=n={len(clips)}:v=1:a=1[outv][outa]"
    )
    
    return [
        "ffmpeg",
        "-y",
        *inputs,
        "-filter_complex", "".join(filter_complex_parts),
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-c:a", "aac",
        output_path,
    ]


def assemble_video(project_id: str, clips: list[dict] | list[str] | None = None) -> dict:
    """Assemble final video from clips and audio with optional trimming."""
    paths = get_project_paths(project_id)
    audio_path = paths["audio"]
    
    # Use provided clips or get from project paths
    if clips and len(clips) > 0:
        # Check if clips have trim data (dict) or are just paths (str)
        has_trim_data = isinstance(clips[0], dict)
        
        if has_trim_data:
            # Clips with trim data
            processed_clips = []
            for clip in clips:
                if not clip or not clip.get("path"):
                    continue
                try:
                    resolved_path = resolve_clip_path(clip["path"], project_id)
                    # Verify it's a video file
                    if resolved_path.lower().endswith((".mp4", ".mov", ".webm", ".avi")):
                        processed_clips.append({
                            "path": resolved_path,
                            "start": clip.get("start", 0),
                            "end": clip.get("end"),
                        })
                except Exception as e:
                    print(f"Warning: Skipping clip {clip.get('path', clip)}: {e}")
                    continue
            video_clips = processed_clips
        else:
            # Legacy: just paths (strings)
            video_clips = []
            for clip in clips:
                if not clip:
                    continue
                try:
                    resolved_path = resolve_clip_path(clip, project_id)
                    if resolved_path.lower().endswith((".mp4", ".mov", ".webm", ".avi")):
                        video_clips.append(resolved_path)
                except Exception as e:
                    print(f"Warning: Skipping clip {clip}: {e}")
                    continue
    else:
        # Fallback to project clips directory
        all_clips = paths["clips"]
        video_clips = [
            clip for clip in all_clips
            if clip.lower().endswith((".mp4", ".mov", ".webm", ".avi"))
        ]
    
    if not video_clips:
        raise ValueError("No valid video clips found to assemble")
    
    # Output to renders directory
    output_path = RENDER_DIR / f"{project_id}.mp4"
    thumbnail_path = RENDER_DIR / "thumbnails" / f"{project_id}.png"
    
    # Ensure thumbnail directory exists
    thumbnail_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Step 1: Concatenate all video clips (with trimming if needed)
    temp_video = RENDER_DIR / f"{project_id}_temp_concat.mp4"
    
    # Check if we need trimming
    needs_trimming = isinstance(video_clips[0], dict) and any(
        clip.get("start", 0) > 0 or (clip.get("end") is not None)
        for clip in video_clips
    )
    
    if needs_trimming:
        # Use FFmpeg filter_complex for trimming and concatenation
        try:
            cmd = build_ffmpeg_trim_commands(video_clips, str(temp_video))
            subprocess.run(cmd, check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg trim error: {e.stderr.decode() if e.stderr else 'Unknown error'}")
            raise RuntimeError("Failed to trim and concatenate video clips")
    else:
        # Use simple concatenation (legacy path)
        clip_paths = [clip if isinstance(clip, str) else clip["path"] for clip in video_clips]
        if not concat_videos(clip_paths, str(temp_video)):
            raise RuntimeError("Failed to concatenate video clips")
    
    # Step 2: Add audio track if it exists
    final_video_path = str(output_path)
    if os.path.exists(audio_path):
        if not add_audio_to_video(str(temp_video), audio_path, final_video_path):
            # If adding audio fails, just use the concatenated video
            if temp_video.exists():
                os.rename(str(temp_video), final_video_path)
        else:
            # Clean up temp file
            if temp_video.exists():
                temp_video.unlink()
    else:
        # No audio, just rename the concatenated video
        if temp_video.exists():
            os.rename(str(temp_video), final_video_path)
    
    # Step 3: Extract thumbnail (only if video was created successfully)
    if os.path.exists(final_video_path):
        extract_thumbnail(final_video_path, str(thumbnail_path))
    
    # Get file size
    file_size = output_path.stat().st_size if output_path.exists() else 0
    
    return {
        "videoUrl": f"/renders/{project_id}.mp4",
        "thumbnail": f"/renders/thumbnails/{project_id}.png" if thumbnail_path.exists() else None,
        "size": file_size,
        "clips_used": len(video_clips),
    }

