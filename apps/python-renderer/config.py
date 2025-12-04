import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
PIKA_API_KEY = os.getenv("PIKA_API_KEY")
RUNWAY_API_KEY = os.getenv("RUNWAY_API_KEY")

# Paths
BASE_DIR = Path(__file__).parent
PROJECTS_DIR = Path(os.getenv("PROJECTS_DIR", BASE_DIR / "projects"))
PROJECTS_DIR.mkdir(parents=True, exist_ok=True)

# Render output directory
RENDER_DIR = BASE_DIR / "renders"
RENDER_DIR.mkdir(exist_ok=True)
(RENDER_DIR / "thumbnails").mkdir(exist_ok=True)

# ElevenLabs Voice ID (you'll need to set this)
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "your-voice-id")

