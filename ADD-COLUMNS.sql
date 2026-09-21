ALTER TABLE public.active_signage_state ADD COLUMN IF NOT EXISTS aspect_ratio TEXT DEFAULT '9:16';
ALTER TABLE public.active_signage_state ADD COLUMN IF NOT EXISTS fit_mode TEXT DEFAULT 'cover';
