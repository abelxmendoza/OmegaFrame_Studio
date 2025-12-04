"""
ElevenLabs Voice Cloning Service (Phase 1 - Cloud)
Handles voice sample upload and training via ElevenLabs API
"""
import requests
import os
import base64
from io import BytesIO
from config import ELEVENLABS_API_KEY


def clone_voice_from_audio(audio_data: bytes, voice_name: str, description: str = "") -> dict:
    """
    Clone a voice from audio sample using ElevenLabs API.
    
    Args:
        audio_data: Audio file bytes (WAV, MP3, etc.)
        voice_name: Name for the cloned voice
        description: Optional description
    
    Returns:
        dict with voice_id and voice details
    """
    if not ELEVENLABS_API_KEY:
        raise ValueError("ELEVENLABS_API_KEY not configured")
    
    # ElevenLabs voice cloning endpoint
    url = "https://api.elevenlabs.io/v1/voices/add"
    
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
    }
    
    # Prepare multipart form data
    files = {
        "files": ("voice_sample.wav", BytesIO(audio_data), "audio/wav")
    }
    
    data = {
        "name": voice_name,
        "description": description or f"Cloned voice: {voice_name}",
    }
    
    response = requests.post(url, headers=headers, files=files, data=data)
    response.raise_for_status()
    
    result = response.json()
    
    # Extract voice_id from response
    voice_id = result.get("voice_id")
    if not voice_id:
        raise ValueError("No voice_id returned from ElevenLabs")
    
    return {
        "voice_id": voice_id,
        "name": voice_name,
        "description": description,
        "type": "cloud",  # Mark as cloud voice
        "provider": "elevenlabs",
    }


def list_cloned_voices() -> list[dict]:
    """
    List all cloned voices from ElevenLabs account.
    
    Returns:
        List of voice dictionaries with voice_id, name, etc.
    """
    if not ELEVENLABS_API_KEY:
        raise ValueError("ELEVENLABS_API_KEY not configured")
    
    url = "https://api.elevenlabs.io/v1/voices"
    
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    result = response.json()
    voices = result.get("voices", [])
    
    # Filter to only cloned voices (custom voices)
    # Default ElevenLabs voices to exclude
    default_voice_ids = [
        "21m00Tcm4TlvDq8ikWAM",  # Rachel
        "AZnzlk1XvdvUeBnXmlld",  # Domi
        "EXAVITQu4vr4xnSDxMaL",  # Bella
        "MF3mGyEYCl7XYWbV9V6O",  # Elli
        "ThT5KcBeYPX3keUQqHPh",  # Dorothy
        "ErXwobaYiN019PkySvjV",  # Antoni
        "TxGEqnHWrfWFTfGW9XjX",  # Josh
        "VR6AewLTigWG4xSOukaG",  # Arnold
        "pNInz6obpgDQGcFmaJgB",  # Adam
        "yoZ06aMxZJJ28mfd3POQ",  # Sam
        "onwK4e9ZLuTAKqWW03F9",  # Daniel
    ]
    
    cloned_voices = [
        {
            "voice_id": voice.get("voice_id"),
            "name": voice.get("name"),
            "description": voice.get("description", ""),
            "type": "cloud",
            "provider": "elevenlabs",
            "category": voice.get("category", "Cloned"),
        }
        for voice in voices
        if voice.get("voice_id") not in default_voice_ids
    ]
    
    return cloned_voices


def delete_cloned_voice(voice_id: str) -> bool:
    """
    Delete a cloned voice from ElevenLabs.
    
    Args:
        voice_id: The voice ID to delete
    
    Returns:
        True if successful
    """
    if not ELEVENLABS_API_KEY:
        raise ValueError("ELEVENLABS_API_KEY not configured")
    
    url = f"https://api.elevenlabs.io/v1/voices/{voice_id}"
    
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
    }
    
    response = requests.delete(url, headers=headers)
    response.raise_for_status()
    
    return True

