#!/bin/bash

echo "🚀 Setting up OmegaFrame Studio..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg is not installed. Video assembly will not work."
    echo "   Install FFmpeg: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)"
fi

echo "📦 Installing frontend dependencies..."
cd apps/frontend
npm install
cd ../..

echo "📦 Installing backend dependencies..."
cd apps/python-renderer
python3 -m pip install -r requirements.txt
cd ../..

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy .env.example files and add your API keys:"
echo "   - apps/frontend/.env.local.example -> apps/frontend/.env.local"
echo "   - apps/python-renderer/.env.example -> apps/python-renderer/.env"
echo ""
echo "2. Start the Python backend:"
echo "   cd apps/python-renderer && uvicorn main:app --reload"
echo ""
echo "3. Start the Next.js frontend:"
echo "   cd apps/frontend && npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"

