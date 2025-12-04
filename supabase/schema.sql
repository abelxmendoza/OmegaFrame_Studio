-- OmegaFrame Studio Database Schema
-- Run this in Supabase SQL Editor

-- Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  description text,
  script text,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Scenes
create table if not exists scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  number int,
  title text,
  description text,
  prompt text,
  created_at timestamptz default now()
);

-- Clips
create table if not exists clips (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  scene_id uuid references scenes(id) on delete set null,
  provider text,
  status text default 'draft',
  file_url text,
  thumbnail_url text,
  duration numeric,
  order_index int,
  created_at timestamptz default now()
);

-- Voices
create table if not exists voices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  provider text,
  voice_name text,
  voice_id text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Exports (final rendered videos)
create table if not exists exports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  file_url text,
  thumbnail_url text,
  resolution text,
  duration numeric,
  created_at timestamptz default now()
);

-- Generation Jobs (for real-time progress tracking)
create table if not exists generation_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  type text,                     -- script | voice | clip | render
  status text default 'queued',  -- queued | running | success | error
  progress int default 0,
  message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Templates (for user-created and custom templates)
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text not null,
  category text,                 -- tech | finance | news | story | advice | commentary | documentary | shorts
  script_structure text,
  scene_structure jsonb,         -- Array of scene objects
  default_voice text,
  default_length text,           -- short | medium | long
  description text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_projects_user_id on projects (user_id);
create index if not exists idx_scenes_project_id on scenes (project_id);
create index if not exists idx_clips_project_id on clips (project_id);
create index if not exists idx_clips_scene_id on clips (scene_id);
create index if not exists idx_clips_order_index on clips (project_id, order_index);
create index if not exists idx_generation_jobs_project_id on generation_jobs (project_id);
create index if not exists idx_generation_jobs_status on generation_jobs (status);
create index if not exists idx_templates_user_id on templates (user_id);
create index if not exists idx_templates_category on templates (category);
create index if not exists idx_templates_public on templates (is_public);
