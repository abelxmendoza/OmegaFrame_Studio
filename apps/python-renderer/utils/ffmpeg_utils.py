import subprocess
import os
from pathlib import Path
from typing import List


def concat_videos(clip_paths: List[str], output_path: str) -> bool:
    """Concatenate multiple video clips into one."""
    if not clip_paths:
        return False
    
    # Create concat file
    concat_file = Path(output_path).parent / "concat.txt"
    with open(concat_file, "w") as f:
        for clip in clip_paths:
            # Escape single quotes and use absolute paths
            abs_clip = os.path.abspath(clip)
            f.write(f"file '{abs_clip}'\n")
    
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",  # Overwrite output
                "-f", "concat",
                "-safe", "0",
                "-i", str(concat_file),
                "-c", "copy",  # Copy codec (faster, no re-encoding)
                output_path,
            ],
            check=True,
            capture_output=True,
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr.decode()}")
        return False
    finally:
        if concat_file.exists():
            concat_file.unlink()


def add_audio_to_video(video_path: str, audio_path: str, output_path: str) -> bool:
    """Add audio track to video."""
    if not os.path.exists(audio_path):
        return False
    
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i", video_path,
                "-i", audio_path,
                "-c:v", "copy",  # Copy video codec
                "-c:a", "aac",  # Encode audio as AAC
                "-shortest",  # Match shortest stream
                "-map", "0:v:0",  # Map video from first input
                "-map", "1:a:0",  # Map audio from second input
                output_path,
            ],
            check=True,
            capture_output=True,
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr.decode()}")
        return False


def create_transition(
    clip1_path: str, clip2_path: str, output_path: str, duration: float = 0.5
) -> bool:
    """Create a crossfade transition between two clips."""
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i", clip1_path,
                "-i", clip2_path,
                "-filter_complex",
                f"[0:v][1:v]xfade=transition=fade:duration={duration}:offset=0[v]",
                "-map", "[v]",
                "-c:v", "libx264",
                output_path,
            ],
            check=True,
            capture_output=True,
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr.decode()}")
        return False


def sync_audio_video(video_path: str, audio_path: str, output_path: str) -> bool:
    """Sync audio with video timing."""
    return add_audio_to_video(video_path, audio_path, output_path)

