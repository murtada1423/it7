# تصحيح: نقطة نهاية API خاطئة

الأمر السابق استخدم مساراً خاطئاً (`/bucket/signage-assets`). المسار الصحيح لإنشاء البكت هو:

```
POST /storage/v1/buckets
```

(وليس `/bucket/signage-assets`)

---

## الأمر المصحح مباشرة في PowerShell

```powershell
$env:SUPABASE_SERVICE_KEY="eyJhbG..."; Invoke-RestMethod -Uri "https://api.supabase.com/v1/storage/buckets" -Method Post -Headers @{"Authorization"="Bearer $env:SUPABASE_SERVICE_KEY";"Content-Type"="application/json";"apikey"="$env:SUPABASE_SERVICE_KEY"} -Body '{"name":"signage-assets","public":true,"file_size_limit":52428800,"allowed_mime_types":["video/mp4","video/webm","video/quicktime","image/jpeg","image/png","image/webp"]}'
```

> ملاحظة: `api.supabase.com` هو الطرف القياسي لـ Management API. إذا لم يعمل، جرّب استبداله بـ `https://hznengzznxfsgbudgnzu.supabase.co` مع نفس المسار (`/storage/v1/buckets`).

---

## أو ببساطة: استخدم `node create-bucket.js`

هذا السكربت يستخدم `supabase-js` مع النقطة الصحيحة تلقائياً ولا يحتاج لتعديل المسار:

```powershell
$env:SUPABASE_SERVICE_KEY="eyJhbG..."; node create-bucket.js
```
