# كيفية ربط قاعدة بيانات Supabase

---

## الخطوة 1: إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com).
2. سجّل دخول أو أنشئ حساباً مجاناً.
3. اضغط **New Project**.
4. اختر اسماً للمشروع (مثال: `vertical-signage`).
5. اختر منطقة جغرافية قريبة منك.
6. اضغط **Create new project** وانتظر حتى ينتهي الإعداد.

---

## الخطوة 2: الحصول على مفاتيح الربط

بعد إنشاء المشروع:

1. من القائمة الجانبية، اذهب إلى **Project Settings** (أيقونة ترس).
2. اضغط على **API**.
3. ستجد قسمين مهمين:

```
Project URL:
https://xxxxxxxxxxxx.supabase.co

Project API keys:
anon  | public
```

4. انسخ `Project URL` و `anon` (المفتاح العام).

---

## الخطوة 3: إدخال المفاتيح في المشروع

افتح الملف `.env.local` في مجلد المشروع وعدّله:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **ملاحظة**: استبدل `xxxxxxxxxxxx` بمعرف مشروعك الفعلي، واستبدل المفتاح بـ `anon key` الذي نسخته.

---

## الخطوة 4: إنشاء Bucket للتخزين (`signage-assets`)

1. من لوحة تحكم Supabase، اذهب إلى **Storage** (من القائمة الجانبية).
2. اضغط **New Bucket**.
3. اسم البكت: `signage-assets`.
4. تأكد من تحديد **Public bucket** (ليكون متاحاً للقراءة العامة).
5. اضغط **Create bucket**.

---

## الخطوة 5: تشغيل قاعدة البيانات (`schema.sql`)

1. من لوحة التحكم، اذهب إلى **SQL Editor**.
2. اضغط **New query**.
3. افتح الملف `schema.sql` من مجلد المشروع وانسخ محتواه كاملاً.
4. الصق الكود في محرر SQL واضغط **Run**.

هذا سينشئ:
- جدول `public.active_signage_state`
- سياسات الأمان (`RLS`)
- قناة التزامن الفوري (`supabase_realtime`)
- الصف الافتراضي (`Sample Media`)

---

## الخطوة 6: التحقق من أن الربط يعمل

بعد تشغيل المشروع (`npm run dev`):

### أ. فحص الاتصال في `/display`
افتح المتصفح على `http://localhost:3000/display`.

إذا كان الربط صحيحاً:
- ستظهر الشاشة السوداء الكاملة.
- بعد لحظة سيظهر الفيديو الافتراضي (`ForBiggerBlazes.mp4`).
- في `Console` (`F12`) لن تظهر أخطاء مثل `Missing Supabase environment variables`.

### ب. فحص الاتصال في `/admin`
افتح `http://localhost:3000/admin`.

- يجب أن تظهر اللوحة بدون أخطاء.
- عند رفع ملف والضغط على **Broadcast to Display** → يجب أن يظهر رسالة نجاح ويحدث التغيير في `/display` فوراً.

---

## ملخص القيم المطلوبة

| القيمة | مكانها في Supabase | تُستخدم في |
|---|---|---|
| `Project URL` | Settings → API → Project URL | `.env.local` → `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` key | Settings → API → Project API keys | `.env.local` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `signage-assets` | Storage → Buckets | تخزين الفيديوهات والصور |
| `schema.sql` | SQL Editor | إنشاء جدول البيانات وسياسات الأمان |

---

## إذا ظهرت أخطاء

| الخطأ | الحل |
|---|---|
| `Missing Supabase environment variables` | تأكد من وجود `.env.local` وأن القيم صحيحة، ثم أعد تشغيل `npm run dev`. |
| `Storage upload failed` | تأكد من وجود `bucket` باسم `signage-assets` وأنه `Public`. |
| `Realtime not connecting` | تأكد من تنفيذ `ALTER PUBLICATION supabase_realtime ADD TABLE ...` في `schema.sql`. |
