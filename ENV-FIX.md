# تصحيح مفتاح .env.local

المشكلة: `.env.local` يحتوي حالياً على مفتاح `service_role` (السري) بدلاً من `anon` (العام).

الحل:
1. افتح `https://supabase.com/dashboard/project/hznengzznxfsgbudgnzu`
2. اذهب إلى `Project Settings` → `API`
3. انسخ مفتاح `anon` (المفتاح العام — `public`)
4. عدّل `.env.local` ليصبح:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hznengzznxfsgbudgnzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-here>
```

> لا تستخدم `service_role` في `.env.local` أبداً — هو للمشاريع الإدارية فقط ويُسبب مشاكل في الوقت الحقيقي (`realtime`) للشاشات العامة.
