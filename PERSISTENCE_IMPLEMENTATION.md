# OmegaFrame Studio — Supabase Persistence Implementation

## ✅ Implementation Complete

All persistence infrastructure has been implemented according to the blueprint.

## 📁 File Structure

### Frontend

```
apps/frontend/
├── lib/supabase/
│   ├── client.ts              # Supabase client setup
│   ├── upload.ts              # Storage upload helpers
│   ├── projects.ts            # Project CRUD operations
│   ├── scenes.ts              # Scene sync operations
│   ├── clips.ts               # Clip CRUD operations
│   ├── voices.ts              # Voice library operations
│   └── exports.ts             # Export operations
├── hooks/
│   ├── useProjectSync.ts      # Auto-save hook for projects
│   ├── useClipSync.ts         # Clip sync utilities
│   └── useVoiceSync.ts        # Voice sync utilities
└── types/
    └── db.ts                   # TypeScript database models
```

### Backend

```
apps/python-renderer/
├── services/
│   ├── supabase_storage.py    # Storage upload service
│   └── supabase_db.py         # Database operations
└── routes/
    └── clip_generation.py     # Example Supabase integration
```

### Database

```
supabase/
└── schema.sql                 # Complete database schema
```

## 🗄️ Database Schema

### Tables

1. **projects** - Project metadata and script
2. **scenes** - Parsed scenes from script
3. **clips** - Generated video clips with trim data
4. **voices** - User voice library
5. **exports** - Final rendered videos
6. **audio_files** - Project audio tracks

### Features

- ✅ UUID primary keys
- ✅ Foreign key relationships
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Auto-updating `updated_at` timestamps

## 🔧 Key Features

### 1. Auto-Save

Projects automatically save every 1.5 seconds when changes are detected:

```tsx
useProjectSync({
  projectId: 'project-id',
  autoSaveDelay: 1500,
  enabled: true
})
```

### 2. Storage Integration

Upload files to Supabase Storage:

```typescript
// Frontend
const url = await uploadFile('clips', 'path/to/file.mp4', fileBlob)

// Backend
file_url = upload_video_clip(project_id, scene_id, clip_bytes)
```

### 3. Database Operations

Full CRUD operations for all entities:

```typescript
// Projects
await createProject({ title: 'My Project' })
await updateProject(id, { script: '...' })
await loadProject(id)

// Scenes
await syncScenes(projectId, scenes)

// Clips
await saveClip(clipData)
await reorderClips(projectId, clipIds)
```

## 🚀 Usage Examples

### Frontend: Auto-Save Project

```tsx
'use client'

import { useProjectSync } from '@/hooks/useProjectSync'

export default function ProjectEditor({ projectId }: { projectId: string }) {
  const { saveNow, isInitialLoad } = useProjectSync({
    projectId,
    autoSaveDelay: 1500
  })

  // Project auto-saves on changes
  // Or manually save:
  // await saveNow()
}
```

### Backend: Generate and Save Clip

```python
from services.supabase_storage import upload_video_clip
from services.supabase_db import save_clip_record

# Generate clip
result = generate_pika_clip(project_id, prompt)
clip_bytes = download_clip(result['url'])

# Upload to Supabase
file_url = upload_video_clip(project_id, scene_id, clip_bytes, 'pika')

# Save to database
save_clip_record(
    project_id=project_id,
    scene_id=scene_id,
    provider='pika',
    file_url=file_url,
    prompt=prompt
)
```

## 📦 Storage Buckets

Required Supabase Storage buckets:

- `clips` - Video clips (`projects/{projectId}/clips/`)
- `audio` - Audio files (`projects/{projectId}/audio/`)
- `exports` - Final videos (`projects/{projectId}/final/`)
- `thumbnails` - Thumbnail images (`projects/{projectId}/thumbnails/`)

## 🔐 Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Backend (.env)

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx  # Service role key, not anon key!
```

## 🔄 Migration Path

1. **Existing Projects**: Continue to work with Redux state
2. **New Projects**: Automatically saved to Supabase
3. **On Load**: Checks Supabase first, falls back to Redux
4. **Auto-Save**: Syncs Redux changes to Supabase

## 🎯 Next Steps

1. **Set up Supabase project** (see `SUPABASE_SETUP.md`)
2. **Run database schema** in Supabase SQL Editor
3. **Create storage buckets**
4. **Add environment variables**
5. **Test auto-save** in a project page

## 📝 Notes

- **Backward Compatible**: Existing Redux state continues to work
- **Graceful Degradation**: If Supabase not configured, app works without persistence
- **RLS Policies**: Currently allow anonymous users (NULL user_id)
- **Future Auth**: Ready for email/Google login integration

## 🐛 Troubleshooting

See `SUPABASE_SETUP.md` for detailed troubleshooting guide.
