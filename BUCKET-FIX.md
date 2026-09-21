# حل مشكلة: Storage upload failed: Bucket not found

## السبب

البكت (`Bucket`) المسمى `signage-assets` غير موجود في مشروع Supabase الخاص بك (`hznengzznxfsgbudgnzu`).

---

## الحل خطوة بخطوة

### 1. افتح لوحة تحكم Supabase

اذهب إلى:
```
https://supabase.com/dashboard/project/hznengzznxfsgbudgnzu
```
أو اضغط على رابط مشروعك من لوحة التحكم.

### 2. أنشئ البكت (`Bucket`)

1. من القائمة الجانبية، اضغط **Storage**.
2. اضغط زر **New Bucket** (أو **Create a new bucket**).
3. اكتب الاسم بدقة:
   ```
   signage-assets
   ```
   > **ملاحظة مهمة**: الاسم حساس لحالة الأحرف (`case-sensitive`). يجب أن يكون `signage-assets` بالضبط كما هو مكتوب في الكود (`/app/admin/page.tsx` و `/components/DisplayPlayer.tsx`).
4. تأكد من تحديد **Public bucket** (أو اجعله عام للقراءة `Public`).
5. اضغط **Create bucket**.

### 3. تحقق من وجود البكت

بعد الإنشاء، يجب أن ترى في قائمة `Storage`:
```
Bucket name: signage-assets
Visibility: Public
```

---

## إذا لم يُنشأ البكت من قبل

إذا كنت قد نفّذت `schema.sql` من قبل، فهذا لا يُنشئ البكت تلقائياً — `schema.sql` يُنشئ فقط الجدول (`table`) في قاعدة البيانات (`PostgreSQL`)، أما التخزين (`Storage`) فيجب إنشاؤه يدوياً من لوحة التحكم كما في الخطوات أعلاه.

---

## اختبار بعد الإصلاح

بعد إنشاء البكت:

1. أعد تحميل صفحة `/admin` في المتصفح.
2. اختر أي ملف صورة (`.png`, `.jpg`, `.webp`) أو فيديو (`.mp4`, `.webm`, `.mov`).
3. اضغط **Broadcast to Display**.
4. يجب أن يظهر الآن:
   - رسالة نجاح (`Broadcast active...`)
   - ولا يظهر خطأ `Bucket not found`.

---

## ملخص سريع

| الخطوة | الإجراء |
|---|---|
| الدخول | `https://supabase.com/dashboard/project/hznengzznxfsgbudgnzu` |
| المكان | **Storage** → **New Bucket** |
| الاسم | `signage-assets` (بالحرف الصغير تماماً) |
| الإعداد | `Public` |
| بعد الإنشاء | أعد تحميل `/admin` وجرب رفع ملف |
