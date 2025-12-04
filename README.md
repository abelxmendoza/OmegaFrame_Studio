# OmegaFrame Studio

AI-powered video generation platform that creates videos from scripts using GPT-4, ElevenLabs TTS, and video generation APIs (Pika/Runway).

## Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Redux
- **Backend**: Python FastAPI server for video rendering and API integrations
- **APIs**: OpenAI (GPT-4), ElevenLabs (TTS), Pika/Runway (Video Generation)

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- FFmpeg (for video assembly)
- API keys for:
  - OpenAI (GPT-4)
  - ElevenLabs (TTS)
  - Pika (Video Generation) - Optional
  - Runway (Video Generation) - Optional

## Setup

### 1. Install Dependencies

#### Frontend
```bash
cd apps/frontend
npm install
```

#### Backend
```bash
cd apps/python-renderer
pip install -r requirements.txt
```

### 2. Configure Environment Variables

#### For Next.js Frontend
Create `apps/frontend/.env.local`:
```env
OPENAI_API_KEY="your_openai_key"
PYTHON_RENDER_URL="http://localhost:8000"
```

#### For Python Backend
Create `apps/python-renderer/.env`:
```env
OPENAI_API_KEY="your_openai_key"
ELEVENLABS_API_KEY="your_elevenlabs_key"
ELEVENLABS_VOICE_ID="your_voice_id"
PIKA_API_KEY="your_pika_key"
RUNWAY_API_KEY="your_runway_key"
PROJECTS_DIR="./projects"
```

### 3. Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### 4. Run the Application

#### Start Python Backend (Terminal 1)
```bash
cd apps/python-renderer
uvicorn main:app --reload
```
Backend will run on `http://localhost:8000`

#### Start Next.js Frontend (Terminal 2)
```bash
cd apps/frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## Usage

1. Navigate to `http://localhost:3000`
2. Click "Get Started" or go to Dashboard
3. Create a new project with a name and topic
4. Generate a script using AI
5. Generate voice narration
6. Generate images/videos for your project
7. Assemble the final video

## Project Structure

```
OmegaFrame_Studio/
├── apps/
│   ├── frontend/              # Next.js 14 application
│   │   ├── app/              # Next.js app router
│   │   ├── components/       # React components
│   │   ├── redux/            # Redux store and slices
│   │   └── lib/              # Utilities and API client
│   ├── python-renderer/      # FastAPI backend
│   │   ├── services/         # API service integrations
│   │   ├── utils/            # FFmpeg and file utilities
│   │   └── projects/         # Generated project files
│   └── shared/               # Shared TypeScript types
├── package.json              # Root workspace config
└── README.md
```

## API Endpoints

### Frontend API Routes (Next.js)
- `POST /api/generate/script` - Generate script from topic
- `POST /api/generate/voice` - Generate voice narration
- `POST /api/generate/image` - Generate images
- `POST /api/generate/video` - Generate video clips
- `POST /api/generate/assemble` - Assemble final video
- `POST /api/project/create` - Create new project
- `POST /api/project/update` - Update project
- `GET /api/project/status` - Get project status

### Backend API Routes (FastAPI)
- `POST /voice` - Generate voice using ElevenLabs
- `POST /video` - Generate video using Pika/Runway
- `POST /image` - Generate images using DALL-E
- `POST /assemble` - Assemble final video with FFmpeg

## Development

### Adding New Features

1. **Frontend Components**: Add to `apps/frontend/components/`
2. **API Routes**: Add to `apps/frontend/app/api/`
3. **Redux State**: Update slices in `apps/frontend/redux/`
4. **Backend Services**: Add to `apps/python-renderer/services/`

### Testing

Run linting:
```bash
cd apps/frontend
npm run lint
```

## Troubleshooting

- **FFmpeg not found**: Ensure FFmpeg is installed and in your PATH
- **API errors**: Check that all API keys are correctly set in `.env` files
- **CORS errors**: Ensure Python backend CORS settings match your frontend URL
- **Port conflicts**: Change ports in `package.json` (frontend) or `main.py` (backend)

## License

MIT

