# 🎬 OmegaFrame Studio

**Transform your ideas into professional videos with AI-powered automation.**

OmegaFrame Studio is a complete video production platform that uses artificial intelligence to help you create stunning videos from start to finish. Write a script, and our AI handles the rest—generating voiceovers, creating video clips, and assembling everything into a polished final video.

---

## ✨ What Makes OmegaFrame Studio Special?

### For Content Creators
- **No video editing experience needed** — Our AI handles the technical complexity
- **Create videos in minutes** — From script to final video in one workflow
- **Professional results** — Studio-quality voiceovers and video clips
- **Your voice, your brand** — Clone your own voice or choose from 11+ AI voices
- **Multilingual support** — Generate videos in English, Spanish, or Japanese
- **Emotional storytelling** — Choose voice styles: Neutral, Calm, Hype, Narrator, or Sinister

### For Developers
- **Modern tech stack** — Next.js 14, TypeScript, Python FastAPI
- **Production-ready** — Error handling, retry logic, async job polling
- **Cloud-ready** — Supabase integration for persistence and storage
- **Extensible architecture** — Easy to add new AI providers and features
- **Type-safe** — Full TypeScript coverage

---

## 🚀 Key Features

### 📝 **Intelligent Script Generation**
- **AI-powered writing**: Generate professional scripts from a simple topic using GPT-4
- **Auto-scene extraction**: Automatically parse your script into scenes
- **Smart formatting**: Supports industry-standard `[SCENE X: Title]` format
- **Real-time editing**: See your scenes update as you type

### 🎭 **AI-Powered Scene Editing**
- **Chat-based editing**: Edit scenes through natural language conversations
- **Context-aware AI**: Understands your project and suggests improvements
- **Batch processing**: Edit multiple scenes efficiently

### 🎥 **Professional Video Generation**
- **Multiple providers**: Choose between Pika Labs or Runway ML for video generation
- **Batch generation**: Create clips for all scenes simultaneously
- **Individual control**: Edit, regenerate, or delete specific clips
- **Real-time progress**: Watch your videos generate with live progress tracking
- **Smart retry logic**: Automatic retries on failures with exponential backoff

### 🎤 **Advanced Voice System**

#### Multilingual Voice Generation
- **3 languages**: English, Spanish, Japanese
- **5 emotion styles**: 
  - ⚪ **Neutral** — Balanced, professional delivery
  - 🌊 **Calm** — Soothing and stable narration
  - 🔥 **Hype** — Energetic and dynamic
  - 🎙️ **Narrator** — Authoritative and clear
  - 🌑 **Sinister** — Dark and mysterious

#### Voice Cloning
- **Your own voice**: Record and train AI to use your voice
- **Cloud cloning**: Fast ElevenLabs-based voice training
- **Multiple voices**: Save and manage multiple cloned voices
- **Instant generation**: Use cloned voices immediately after training

#### Voice Selection
- **11+ AI voices**: Pre-configured professional voices
- **Gender filtering**: Find voices by gender preference
- **Search functionality**: Quickly find the perfect voice
- **Voice preview**: Test voices before generating

### 🎬 **Video Preview & Playback**
- **Full-screen preview**: Click any clip to preview in a beautiful modal
- **Enhanced controls**: Custom video player with play/pause, seek, and volume
- **Thumbnail support**: Fast-loading thumbnails for quick previews
- **Download clips**: One-click download for individual clips or final videos
- **Responsive design**: Works perfectly on all screen sizes

### 🔄 **Smart Error Handling**
- **Automatic retries**: Intelligent retry system handles temporary failures
- **Clear error messages**: User-friendly explanations of what went wrong
- **Retry buttons**: Easy one-click retry for failed operations
- **Error categorization**: Network, server, authentication, and API errors handled differently
- **Graceful degradation**: App continues working even when services are down

### 💾 **Cloud Persistence** (Optional)
- **Auto-save**: Projects automatically save every 1.5 seconds
- **Cross-device sync**: Access your projects from any device
- **Supabase integration**: Secure cloud storage for all your work
- **Offline support**: Works without cloud when configured locally

### 🎨 **Beautiful User Interface**
- **Dark theme**: Cinematic dark interface that's easy on the eyes
- **Smooth animations**: Polished transitions and hover effects
- **Visual feedback**: Clear indicators for all actions
- **Intuitive navigation**: Easy-to-use workflow from script to final video

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 (App Router) — Latest React framework with server components
- **Language**: TypeScript — Type-safe development
- **Styling**: Tailwind CSS — Utility-first CSS with custom OmegaFrame theme
- **State Management**: Redux Toolkit — Predictable state management
- **UI Components**: Custom React components with accessibility in mind

### Backend Stack
- **Framework**: Python FastAPI — High-performance async API framework
- **Video Processing**: FFmpeg — Industry-standard video manipulation
- **API Integrations**: 
  - OpenAI (GPT-4) — Script generation and AI editing
  - ElevenLabs — Text-to-speech and voice cloning
  - Pika Labs — Video generation
  - Runway ML — Alternative video generation

### Design System
- **Color Palette**: Dark theme with purple accents (`#7938ff`)
- **Typography**: System fonts with Fira Code for code blocks
- **Effects**: Neon glow shadows, smooth transitions
- **Responsive**: Mobile-first design that scales to desktop

---

## 📋 Prerequisites

### Required
- **Node.js** 18+ and npm
- **Python** 3.9+
- **FFmpeg** (for video assembly)

### API Keys (Get Started)
- **OpenAI API Key** — For script generation and AI editing
- **ElevenLabs API Key** — For voice generation
- **Pika API Key** (Optional) — For video generation via Pika Labs
- **Runway API Key** (Optional) — For video generation via Runway ML

### Optional (For Cloud Features)
- **Supabase Account** — For cloud persistence and storage

---

## 🚀 Quick Start

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

### 2. Install FFmpeg

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

### 3. Configure Environment Variables

#### Frontend (`apps/frontend/.env.local`)
```env
# API Configuration
NEXT_PUBLIC_API_URL=""
PYTHON_RENDER_URL="http://localhost:8000"

# Optional: Supabase (for cloud persistence)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

#### Backend (`apps/python-renderer/.env`)
```env
# Required API Keys
OPENAI_API_KEY="your_openai_key"
ELEVENLABS_API_KEY="your_elevenlabs_key"

# Optional: Video Generation Providers
PIKA_API_KEY="your_pika_key"
RUNWAY_API_KEY="your_runway_key"

# Project Directories
PROJECTS_DIR="./projects"
RENDER_DIR="./renders"

# Optional: Supabase (for cloud storage)
SUPABASE_URL="your_supabase_url"
SUPABASE_SERVICE_KEY="your_supabase_service_key"
```

### 4. Start the Application

#### Terminal 1: Start Backend
```bash
cd apps/python-renderer
uvicorn main:app --reload
```
Backend runs on `http://localhost:8000`

#### Terminal 2: Start Frontend
```bash
cd apps/frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

### 5. Open in Browser
Navigate to `http://localhost:3000` and start creating!

---

## 📖 How to Use

### Creating Your First Video

1. **Create a Project**
   - Click "New Project" on the dashboard
   - Give it a name and optional topic

2. **Write or Generate a Script**
   - Go to the Script Editor
   - Either write your script manually or click "Generate with GPT"
   - Use `[SCENE X: Title]` format to define scenes
   - Scenes automatically extract as you type

3. **Select a Voice**
   - Choose from 11+ AI voices, your cloned voice, or record a new one
   - Select language (English, Spanish, or Japanese)
   - Choose emotion style (Neutral, Calm, Hype, Narrator, or Sinister)
   - Click "Generate Voice from Script"

4. **Edit Scenes (Optional)**
   - Go to the Media section
   - Click any scene to edit it with AI chat
   - Refine your scenes until they're perfect

5. **Generate Video Clips**
   - Click "Generate All" to create clips for all scenes at once
   - Or generate individual clips with custom prompts
   - Watch progress in real-time
   - Edit or regenerate any clip that doesn't meet your standards

6. **Assemble Final Video**
   - Go to the Render section
   - Click "Assemble Video"
   - Watch the assembly progress
   - Preview and download your final video!

### Advanced Features

#### Voice Cloning
1. Go to Settings
2. Click "Start Recording" in the Voice System section
3. Record at least 30 seconds of clear audio
4. Click "Train AI Voice Model"
5. Your voice will be available in the voice picker

#### Scene Editing with AI
1. In the Media section, click any scene
2. Type your request in the chat (e.g., "Make this more dramatic")
3. AI updates the scene based on your request
4. Continue chatting to refine further

#### Individual Clip Management
- **Preview**: Click any clip to open full-screen preview
- **Download**: Hover and click the download button
- **Edit**: Click the edit button to change prompt and regenerate
- **Delete**: Remove clips you don't need

---

## 🎯 Complete Feature List

### ✅ Core Features
- [x] Project management (create, view, edit, delete)
- [x] AI script generation from topics
- [x] Manual script editing
- [x] Automatic scene extraction
- [x] AI-powered scene editing via chat
- [x] Voice selection (11+ AI voices)
- [x] Voice cloning (record and train your voice)
- [x] Multilingual voice generation (English, Spanish, Japanese)
- [x] Emotional voice styles (5 variants)
- [x] Video clip generation (Pika/Runway)
- [x] Batch clip generation
- [x] Individual clip editing/regeneration
- [x] Video preview with full-screen modal
- [x] Video playback with custom controls
- [x] Video download (clips and final videos)
- [x] Video assembly with FFmpeg
- [x] Thumbnail generation
- [x] Progress tracking
- [x] Error handling with retry logic
- [x] Async job polling
- [x] Cloud persistence (Supabase)
- [x] Settings management
- [x] Responsive design

### 🔄 Technical Features
- [x] Automatic retry with exponential backoff
- [x] Error categorization and user-friendly messages
- [x] Real-time progress updates
- [x] Job status polling
- [x] URL resolution (Supabase, local, remote)
- [x] Type-safe API calls
- [x] Redux state management
- [x] Auto-save functionality
- [x] Loading states
- [x] Error boundaries

---

## 📁 Project Structure

```
OmegaFrame_Studio/
├── apps/
│   ├── frontend/                 # Next.js 14 application
│   │   ├── app/                  # Next.js app router
│   │   │   ├── dashboard/       # Project dashboard
│   │   │   ├── project/[id]/    # Project pages
│   │   │   │   ├── editor/      # Script editor
│   │   │   │   ├── media/       # Media generator
│   │   │   │   └── render/      # Video assembly
│   │   │   ├── settings/        # Settings page
│   │   │   └── api/             # Next.js API routes
│   │   ├── components/          # React components
│   │   │   ├── VideoModal.tsx   # Full-screen video preview
│   │   │   ├── VideoPreview.tsx # Video player component
│   │   │   ├── ClipCard.tsx     # Individual clip display
│   │   │   ├── VoicePicker.tsx  # Voice selection
│   │   │   ├── VoiceRecorder.tsx # Voice recording
│   │   │   └── ...              # More components
│   │   ├── redux/               # Redux store
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilities and API client
│   │   └── styles/              # Global styles
│   └── python-renderer/         # FastAPI backend
│       ├── services/            # API service integrations
│       │   ├── pika_service.py  # Pika Labs integration
│       │   ├── runway_service.py # Runway ML integration
│       │   ├── voice_service.py # ElevenLabs integration
│       │   └── assemble_service.py # FFmpeg video assembly
│       ├── utils/               # Utilities
│       └── main.py              # FastAPI application
├── supabase/                    # Database schema
└── README.md                    # This file
```

---

## 🔌 API Endpoints

### Frontend API Routes (Next.js)
- `POST /api/generate/script` - Generate script from topic
- `POST /api/generate/voice` - Generate voice narration
- `POST /api/generate/video` - Generate video clips
- `POST /api/generate/video/status` - Check video generation status
- `POST /api/generate/assemble` - Assemble final video
- `POST /api/generate/scene-edit` - AI-powered scene editing
- `POST /api/voice/clone` - Clone voice from audio
- `GET /api/voice/list` - List cloned voices

### Backend API Routes (FastAPI)
- `POST /voice/generate` - Generate voice (cloud/local)
- `POST /voice/cloud/clone` - Clone voice with ElevenLabs
- `GET /voice/cloud/list` - List cloned voices
- `POST /video` - Generate video clip
- `POST /video/status` - Check video generation status
- `POST /assemble` - Assemble final video
- `GET /renders/*` - Serve rendered videos

---

## 🛠️ Development

### Adding New Features

1. **Frontend Components**: Add to `apps/frontend/components/`
2. **API Routes**: Add to `apps/frontend/app/api/`
3. **Redux State**: Update slices in `apps/frontend/redux/`
4. **Backend Services**: Add to `apps/python-renderer/services/`

### Code Quality

Run linting:
```bash
cd apps/frontend
npm run lint
```

### Testing

The application includes:
- Type-safe API calls
- Error boundaries
- Input validation
- Loading states
- Error handling

---

## 🐛 Troubleshooting

### Common Issues

**FFmpeg not found**
- Ensure FFmpeg is installed and in your PATH
- Verify with: `ffmpeg -version`

**API errors**
- Check that all API keys are correctly set in `.env` files
- Verify API keys are valid and have sufficient credits

**CORS errors**
- Ensure Python backend CORS settings match your frontend URL
- Check `apps/python-renderer/main.py` CORS configuration

**Port conflicts**
- Change frontend port in `package.json`
- Change backend port in `main.py` or uvicorn command

**Video generation fails**
- Check API keys for Pika/Runway
- Verify internet connection
- Check backend logs for detailed error messages

**Voice generation fails**
- Verify ElevenLabs API key
- Check voice ID is valid
- Ensure script is not empty

---

## 📚 Additional Documentation

- **Supabase Setup**: See `SUPABASE_SETUP.md` for cloud persistence configuration
- **Persistence Implementation**: See `PERSISTENCE_IMPLEMENTATION.md` for details
- **Complete Implementation**: See `COMPLETE_IMPLEMENTATION.md` for full feature list

---

## 🎓 Learning Resources

### For Users
- Start with a simple topic and let AI generate the script
- Experiment with different voice styles to find your brand voice
- Use scene editing to refine your content before generating clips
- Preview clips before assembling to ensure quality

### For Developers
- The codebase is fully typed with TypeScript
- Redux state is organized by feature
- API calls use retry logic for reliability
- Components are modular and reusable

---

## 🤝 Contributing

This is a production-ready application with:
- ✅ Error handling
- ✅ Retry logic
- ✅ Progress tracking
- ✅ Cloud persistence
- ✅ Type safety
- ✅ Responsive design

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

Built with:
- **Next.js** — React framework
- **FastAPI** — Python web framework
- **OpenAI** — GPT-4 for script generation
- **ElevenLabs** — Text-to-speech and voice cloning
- **Pika Labs** — Video generation
- **Runway ML** — Video generation
- **FFmpeg** — Video processing
- **Supabase** — Cloud database and storage

---

**Ready to create amazing videos? Start your first project today!** 🚀
