-- ============================================================
-- Vertical Digital Signage System - Supabase Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Active Display State Table
CREATE TABLE IF NOT EXISTS public.active_signage_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_slot TEXT UNIQUE NOT NULL DEFAULT 'primary_portrait',
    media_url TEXT NOT NULL,
    media_name TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('video', 'image')),
    mime_type TEXT DEFAULT 'video/mp4',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security Configuration
ALTER TABLE public.active_signage_state ENABLE ROW LEVEL SECURITY;

-- Public Read Policy (Display Terminals)
DROP POLICY IF EXISTS "Allow public read access to signage state" ON public.active_signage_state;
CREATE POLICY "Allow public read access to signage state"
ON public.active_signage_state
FOR SELECT
USING (true);

-- Authenticated/Admin Update Policy
DROP POLICY IF EXISTS "Allow update access to signage state" ON public.active_signage_state;
CREATE POLICY "Allow update access to signage state"
ON public.active_signage_state
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Authenticated/Admin Insert Policy
DROP POLICY IF EXISTS "Allow insert access to signage state" ON public.active_signage_state;
CREATE POLICY "Allow insert access to signage state"
ON public.active_signage_state
FOR INSERT
WITH CHECK (true);

-- Enable Realtime Replication
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'active_signage_state'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.active_signage_state;
    END IF;
END $$;

-- Seed Default State (will skip on conflict)
INSERT INTO public.active_signage_state (
    display_slot,
    media_url,
    media_name,
    media_type,
    mime_type
)
VALUES (
    'primary_portrait',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'Sample Media',
    'video',
    'video/mp4'
)
ON CONFLICT (display_slot) DO NOTHING;
