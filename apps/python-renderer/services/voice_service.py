import requests
import os
from config import ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID
from utils.file_utils import save_audio


# Style presets for different emotional tones
STYLE_PRESETS = {
    "neutral": {
        "stability": 0.5,
        "similarity_boost": 0.5,
    },
    "calm": {
        "stability": 0.8,
        "similarity_boost": 0.5,
    },
    "hype": {
        "stability": 0.4,
        "similarity_boost": 0.7,
    },
    "narrator": {
        "stability": 0.9,
        "similarity_boost": 0.9,
    },
    "sinister": {
        "stability": 0.3,
        "similarity_boost": 0.2,
    },
}


def generate_cloud_voice(
    project_id: str,
    script: str,
    voice_id: str | None = None,
    language: str = "en",
    style: str = "neutral",
) -> dict:
    """Generate voice using ElevenLabs TTS API with multilingual and style support."""
    if not ELEVENLABS_API_KEY:
        raise ValueError("ELEVENLABS_API_KEY not configured")
    
    # Use provided voice_id or fall back to config default
    selected_voice_id = voice_id or ELEVENLABS_VOICE_ID
    
    if not selected_voice_id or selected_voice_id == "your-voice-id":
        # Default to Rachel if no voice is configured
        selected_voice_id = "21m00Tcm4TlvDq8ikWAM"
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{selected_voice_id}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
    }
    
    # Get style preset
    style_settings = STYLE_PRESETS.get(style, STYLE_PRESETS["neutral"])
    
    # Use multilingual model for non-English languages
    model_id = "eleven_multilingual_v2" if language != "en" else "eleven_monolingual_v1"
    
    data = {
        "text": script,
        "model_id": model_id,
        "voice_settings": {
            "stability": style_settings["stability"],
            "similarity_boost": style_settings["similarity_boost"],
        },
    }
    
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    
    # Save audio file
    audio_path = save_audio(project_id, response.content)
    
    return {
        "audio": audio_path,
        "url": f"/projects/{project_id}/audio.wav",
    }


# Keep backward compatibility
def generate_voice(project_id: str, script: str, voice_id: str | None = None) -> dict:
    """Generate voice using ElevenLabs TTS API (backward compatible)."""
    return generate_cloud_voice(project_id, script, voice_id, "en", "neutral")

