from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from contextlib import asynccontextmanager
from services.voice_service import generate_cloud_voice, generate_voice
from services.voice_cloning_service import clone_voice_from_audio, list_cloned_voices, delete_cloned_voice
from services.pika_service import generate_pika_clip, poll_pika_job
from services.runway_service import generate_runway_clip, poll_runway_job
from services.image_service import generate_image
from services.assemble_service import assemble_video
from services.job_events import start_job_event_listener
from services.redis_client import close_redis
from routes.ws import router as ws_router
from config import RENDER_DIR


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting OmegaFrame Studio backend...")
    try:
        await start_job_event_listener()
        print("✅ Job event listener started")
    except Exception as e:
        print(f"⚠️ Warning: Could not start job event listener: {e}")
        print("   Progress updates will not work. Is Redis running?")
    yield
    # Shutdown
    print("🛑 Shutting down...")
    await close_redis()
    print("✅ Redis connection closed")


app = FastAPI(title="OmegaFrame Studio Renderer", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VoiceRequest(BaseModel):
    projectId: str
    script: str
    voiceId: str | None = None
    engine: str = "cloud"  # "cloud" or "local"
    language: str = "en"  # "en", "es", "ja"
    style: str = "neutral"  # "neutral", "calm", "hype", "narrator", "sinister"


class VideoRequest(BaseModel):
    projectId: str
    prompt: str
    provider: str


class JobStatusRequest(BaseModel):
    job_id: str
    provider: str  # "pika" or "runway"


class ImageRequest(BaseModel):
    projectId: str
    prompt: str
    provider: str = "dalle"


class ClipData(BaseModel):
    path: str
    start: float = 0.0
    end: float | None = None

class AssembleRequest(BaseModel):
    projectId: str
    clips: list[ClipData] | list[str] | None = None


class CloneVoiceRequest(BaseModel):
    voice_name: str
    description: str = ""


@app.get("/")
def root():
    return {"message": "OmegaFrame Studio Renderer API"}


@app.post("/voice")
def voice_endpoint(payload: VoiceRequest):
    """Legacy endpoint for backward compatibility."""
    try:
        from services.voice_service import generate_cloud_voice
        result = generate_cloud_voice(
            payload.projectId,
            payload.script,
            payload.voiceId,
            payload.language,
            payload.style,
        )
        return result
    except Exception as e:
        return {"error": str(e)}


@app.post("/voice/generate")
def generate_voice_endpoint(payload: VoiceRequest):
    """Unified voice generation endpoint supporting cloud and local engines."""
    try:
        if payload.engine == "local":
            from services.local_voice_service import generate_voice_local, list_local_voices
            
            # For local voices, we need to find the model path from voice_id
            # This is a placeholder - will be implemented with actual model lookup
            local_voices = list_local_voices()
            voice_model = next(
                (v for v in local_voices if v.get("voice_name") == payload.voiceId),
                None
            )
            
            if not voice_model:
                raise ValueError(f"Local voice model not found: {payload.voiceId}")
            
            audio_bytes = generate_voice_local(
                voice_model["model_path"],
                payload.script,
                payload.language,
                payload.style,
            )
            
            # Save audio file
            from utils.file_utils import save_audio
            audio_path = save_audio(payload.projectId, audio_bytes)
            
            return {
                "audio": audio_path,
                "url": f"/projects/{payload.projectId}/audio.wav",
            }
        else:
            # Cloud engine (ElevenLabs)
            from services.voice_service import generate_cloud_voice
            result = generate_cloud_voice(
                payload.projectId,
                payload.script,
                payload.voiceId,
                payload.language,
                payload.style,
            )
            return result
    except NotImplementedError as e:
        return {"error": str(e), "phase": 2}
    except Exception as e:
        return {"error": str(e)}


@app.post("/voice/cloud/clone")
async def clone_voice_endpoint(
    file: UploadFile = File(...),
    voice_name: str = Form("Cloned Voice"),
    description: str = Form("")
):
    """Clone a voice from uploaded audio sample using ElevenLabs."""
    try:
        if not voice_name or voice_name == "Cloned Voice":
            voice_name = file.filename or "Cloned Voice"
        if not voice_name:
            voice_name = "Cloned Voice"
        
        # Read audio file
        audio_data = await file.read()
        
        # Clone voice
        result = clone_voice_from_audio(audio_data, voice_name, description)
        return result
    except Exception as e:
        return {"error": str(e)}


@app.get("/voice/cloud/list")
def list_cloned_voices_endpoint():
    """List all cloned voices from ElevenLabs."""
    try:
        voices = list_cloned_voices()
        return {"voices": voices}
    except Exception as e:
        return {"error": str(e)}


@app.delete("/voice/cloud/{voice_id}")
def delete_cloned_voice_endpoint(voice_id: str):
    """Delete a cloned voice from ElevenLabs."""
    try:
        delete_cloned_voice(voice_id)
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}


# Phase 2 - Local Voice Endpoints (Placeholder for GPU implementation)
@app.post("/voice/local/train")
async def train_local_voice_endpoint(
    file: UploadFile = File(...),
    voice_name: str = None,
):
    """Train a local voice model using XTTS-v2 (requires GPU)."""
    try:
        from services.local_voice_service import train_local_voice
        
        if not voice_name:
            voice_name = file.filename or "Local Voice"
        
        audio_data = await file.read()
        result = train_local_voice("local", audio_data, voice_name)
        return result
    except NotImplementedError as e:
        return {"error": str(e), "phase": 2}
    except Exception as e:
        return {"error": str(e)}


@app.get("/voice/local/list")
def list_local_voices_endpoint():
    """List all locally trained voice models."""
    try:
        from services.local_voice_service import list_local_voices
        voices = list_local_voices()
        return {"voices": voices}
    except Exception as e:
        return {"error": str(e)}


@app.post("/voice/local/generate")
def generate_local_voice_endpoint(payload: dict):
    """Generate voice using local XTTS-v2 model (requires GPU)."""
    try:
        from services.local_voice_service import generate_voice_local
        
        model_path = payload.get("model_path")
        text = payload.get("text")
        
        if not model_path or not text:
            return {"error": "model_path and text are required"}
        
        audio_bytes = generate_voice_local(model_path, text)
        return {"audio": audio_bytes.hex()}  # Return as hex for JSON
    except NotImplementedError as e:
        return {"error": str(e), "phase": 2}
    except Exception as e:
        return {"error": str(e)}


@app.post("/video")
def video_endpoint(payload: VideoRequest):
    """Generate a video clip. Returns either a completed video URL or a job_id for polling."""
    try:
        if payload.provider == "pika":
            result = generate_pika_clip(payload.projectId, payload.prompt)
        else:
            result = generate_runway_clip(payload.projectId, payload.prompt)
        return result
    except Exception as e:
        return {"error": str(e)}


@app.post("/video/status")
def video_status_endpoint(payload: JobStatusRequest):
    """Check the status of a video generation job."""
    try:
        if payload.provider == "pika":
            result = poll_pika_job(payload.job_id)
        elif payload.provider == "runway":
            result = poll_runway_job(payload.job_id)
        else:
            return {"error": f"Unknown provider: {payload.provider}"}
        return result
    except Exception as e:
        return {"error": str(e), "status": "error"}


@app.post("/image")
def image_endpoint(payload: ImageRequest):
    try:
        result = generate_image(payload.projectId, payload.prompt, payload.provider)
        return result
    except Exception as e:
        return {"error": str(e)}


@app.post("/assemble")
def assemble_endpoint(payload: AssembleRequest):
    try:
        result = assemble_video(payload.projectId, payload.clips)
        return result
    except Exception as e:
        return {"error": str(e)}


# Include WebSocket routes
app.include_router(ws_router)

# Mount static files for renders
app.mount("/renders", StaticFiles(directory=str(RENDER_DIR)), name="renders")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

