# Supabase Setup Guide

This guide will help you set up Supabase persistence for OmegaFrame Studio.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key from Settings > API

## 2. Run Database Schema

1. Open Supabase SQL Editor
2. Copy and paste the contents of `supabase/schema.sql`
3. Run the SQL to create all tables, indexes, and policies

## 3. Create Storage Buckets

In Supabase Dashboard > Storage, create these buckets:

- `clips` - For video clips
- `audio` - For audio files
- `exports` - For final rendered videos
- `thumbnails` - For thumbnail images

For each bucket:
- Set to **Public** (or configure RLS policies as needed)
- Enable file size limits as appropriate

## 4. Configure Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (.env)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

**Important:** Use the **service role key** (not anon key) for backend operations.

## 5. Install Dependencies

### Frontend
```bash
cd apps/frontend
npm install @supabase/supabase-js
```

### Backend
```bash
cd apps/python-renderer
pip install supabase
```

## 6. Usage

### Frontend

Use the `useProjectSync` hook in your project pages:

```tsx
import { useProjectSync } from '@/hooks/useProjectSync'

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { saveNow } = useProjectSync({
    projectId: params.id,
    autoSaveDelay: 1500, // 1.5 seconds
    enabled: true
  })

  // Project will auto-save on changes
  // Or call saveNow() to save immediately
}
```

### Backend

Use Supabase services in your routes:

```python
from services.supabase_storage import upload_video_clip
from services.supabase_db import save_clip_record

# Upload clip
file_url = upload_video_clip(project_id, scene_id, clip_bytes)

# Save to database
save_clip_record(project_id, scene_id, "pika", file_url)
```

## 7. Features

- ✅ Auto-save projects every 1.5 seconds
- ✅ Sync scenes and clips to database
- ✅ Upload generated clips to Supabase Storage
- ✅ Save final exports with metadata
- ✅ Voice library persistence
- ✅ Row Level Security (RLS) policies

## 8. Migration from Local Storage

Existing projects in Redux will continue to work. When you open a project:

1. If it exists in Supabase, it loads from DB
2. If not, it uses Redux state
3. Changes auto-save to Supabase

## 9. Authentication (Future)

Currently using anonymous users. To add authentication:

1. Enable Supabase Auth
2. Update `getOrCreateAnonymousUserId()` in `client.ts`
3. Update RLS policies to require authentication
4. Add login UI components

## Troubleshooting

### "Supabase not configured" warnings
- Check environment variables are set
- Restart dev server after adding env vars

### Upload failures
- Verify bucket names match exactly
- Check bucket is set to Public
- Verify service role key has correct permissions

### RLS policy errors
- Check policies in SQL Editor
- For anonymous users, ensure policies allow NULL user_id
- For authenticated users, ensure policies check auth.uid()
