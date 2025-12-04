# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install Dependencies

```bash
# Run the setup script
./setup.sh

# Or manually:
cd apps/frontend && npm install
cd ../python-renderer && pip install -r requirements.txt
```

### Step 2: Configure API Keys

**Frontend** (`apps/frontend/.env.local`):
```env
OPENAI_API_KEY="sk-..."
PYTHON_RENDER_URL="http://localhost:8000"
```

**Backend** (`apps/python-renderer/.env`):
```env
OPENAI_API_KEY="sk-..."
ELEVENLABS_API_KEY="..."
ELEVENLABS_VOICE_ID="your-voice-id"
PIKA_API_KEY="..."  # Optional
RUNWAY_API_KEY="..."  # Optional
PROJECTS_DIR="./projects"
```

### Step 3: Start Services

**Terminal 1 - Python Backend:**
```bash
cd apps/python-renderer
uvicorn main:app --reload
```

**Terminal 2 - Next.js Frontend:**
```bash
cd apps/frontend
npm run dev
```

### Step 4: Open Browser

Navigate to: **http://localhost:3000**

## 📋 Workflow

1. **Create Project** → Enter name and topic
2. **Generate Script** → AI creates video script
3. **Generate Voice** → ElevenLabs creates narration
4. **Generate Media** → Create images/videos for scenes
5. **Assemble** → FFmpeg combines everything into final video

## 🔧 Troubleshooting

- **Port 3000 in use?** → Change in `package.json`
- **Port 8000 in use?** → Change in `main.py`
- **FFmpeg errors?** → Install FFmpeg: `brew install ffmpeg`
- **CORS errors?** → Check backend CORS settings in `main.py`

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Customize voice settings in `services/voice_service.py`
- Add more video providers in `services/`
- Enhance UI components in `apps/frontend/components/`

