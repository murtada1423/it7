-- سكربت إصلاح RLS وسياسة الأمان
-- شغّله في SQL Editor في Supabase (https://supabase.com/dashboard/project/hznengzznxfsgbudgnzu → SQL Editor)

-- 1. تأكد من تفعيل RLS
ALTER TABLE public.active_signage_state ENABLE ROW LEVEL SECURITY;

-- 2. حذف السياسات القديمة (إذا كانت موجودة) وإعادة إنشائها بشكل صحيح
DROP POLICY IF EXISTS "Allow public read access to signage state" ON public.active_signage_state;
DROP POLICY IF EXISTS "Allow update access to signage state" ON public.active_signage_state;
DROP POLICY IF EXISTS "Allow insert access to signage state" ON public.active_signage_state;

-- 3. إعادة إنشاء السياسات الصحيحة
CREATE POLICY "Allow public read access to signage state"
ON public.active_signage_state
FOR SELECT USING (true);

CREATE POLICY "Allow update access to signage state"
ON public.active_signage_state
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow insert access to signage state"
ON public.active_signage_state
FOR INSERT WITH CHECK (true);

-- 4. تأكد من وجود الصف الافتراضي
INSERT INTO public.active_signage_state (display_slot, media_url, media_name, media_type, mime_type)
VALUES (
  'primary_portrait',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'Sample Media',
  'video',
  'video/mp4'
)
ON CONFLICT (display_slot) DO UPDATE SET
  media_url = EXCLUDED.media_url,
  media_name = EXCLUDED.media_name,
  media_type = EXCLUDED.media_type,
  mime_type = EXCLUDED.mime_type,
  updated_at = timezone('utc'::text, now());
