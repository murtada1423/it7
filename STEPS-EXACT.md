# طريقة إنشاء البكت بالضبط (خطوة بخطوة)

> **تنبيه أمني:** هذه الخطوات تُنفّذ على جهازك فقط. لا ترسل المفتاح لأي شخص.

---

## الخطوة 1: احصل على `service_role` من Supabase

1. افتح المتصفح واذهب إلى:
   ```
   https://supabase.com/dashboard/project/hznengzznxfsgbudgnzu
   ```
2. من القائمة الجانبية، اضغط **Project Settings** (أيقونة ترس).
3. اضغط **API**.
4. ابحث عن قسم `Project API keys`.
5. ستجد مفتاحين:
   - `anon` → المفتاح العام (الذي وضعناه في `.env.local`)
   - `service_role` → المفتاح السري (`secret`)
6. اضغط زر **نسخ** (`Copy`) بجوار `service_role`.

---

## الخطوة 2: افتح الطرفية (`PowerShell` أو `cmd`) في مجلد المشروع

```powershell
cd C:\Users\Murtada Razaq\Desktop\mur\it7
```

---

## الخطوة 3: ضع المفتاح مؤقتاً في متغير البيئة

في `PowerShell` (انسخ والصق مباشرة):

```powershell
$env:SUPABASE_SERVICE_KEY="ضع_المفتاح_هنا_بين_علامتي_اقتباس"
```

مثال (مع مفتاح وهمي — استبدله بمفتاحك الحقيقي):
```powershell
$env:SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bmVuZ3p6bnhmc2didWRnbnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTkxMDQ4OSwiZXhwIjoyMTA1NDg2NDg5fQ..."
```

---

## الخطوة 4: شغّل السكربت

```powershell
node create-bucket.js
```

---

## ما يجب أن تراه في الطرفية

### إذا نجح الإنشاء:
```
🔄 جاري إنشاء البكت signage-assets...
✅ تم إنشاء البكت بنجاح: signage-assets
```

### إذا كان البكت موجوداً بالفعل:
```
🔄 جاري إنشاء البكت signage-assets...
✅ البكت signage-assets موجود بالفعل.
```

---

## الخطوة 5: تأكد من وجوده في Supabase

1. ارجع إلى لوحة تحكم Supabase.
2. اضغط `Storage` من القائمة.
3. يجب أن ترى:
   - اسم البكت: `signage-assets`
   - الحالة: `Public`

---

## الخطوة 6: جرّب رفع ملف من `/admin`

1. افتح المتصفح:
   ```
   http://localhost:3000/admin
   ```
2. اختر أي صورة أو فيديو.
3. اضغط `Broadcast to Display`.
4. يجب أن يختفي خطأ `Bucket not found` ويظهر `Broadcast active`.

---

## ملخص الأوامر (انسخ والصق مباشرة)

```powershell
# 1. اذهب للمجلد
cd C:\Users\Murtada Razaq\Desktop\mur\it7

# 2. ضع المفتاح (استبدل ... بمفتاحك الحقيقي)
$env:SUPABASE_SERVICE_KEY="eyJ..."

# 3. شغّل
node create-bucket.js
```

---

## ملاحظة أمنية أخيرة

- المفتاح `service_role` يُستخدم في هذه الخطوة فقط.
- لا تُشاركه في أي رسالة أو ملف أو موقع.
- بعد الانتهاء، يمكنك إغلاق الطرفية (`PowerShell`) — المتغير يُمسح تلقائياً عند إغلاق النافذة.
