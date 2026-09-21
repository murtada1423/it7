# سكربت إنشاء Bucket تلقائياً

تم إنشاء سكربتين لإنشاء البكت (`signage-assets`) تلقائياً:

---

## الخيار 1: Node.js (`create-bucket.js`)

### المتطلبات
- `npm install` (موجود بالفعل في المشروع)
- `service_role` من Supabase (`Settings → API`)

### طريقة التشغيل

```powershell
# في PowerShell (أو cmd مع set بدلاً من $env:)
$env:SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
node create-bucket.js
```

أو مباشرة في `cmd`:
```cmd
set SUPABASE_SERVICE_KEY=eyJhbG...
node create-bucket.js
```

---

## الخيار 2: PowerShell (`create-bucket.ps1`)

### طريقة التشغيل

```powershell
# ضع المفتاح أولاً
$env:NEXT_PUBLIC_SUPABASE_URL="https://hznengzznxfsgbudgnzu.supabase.co"
$env:SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ثم شغّل
.\create-bucket.ps1
```

---

## من أين تحصل على `service_role`؟

1. افتح `https://supabase.com/dashboard/project/hznengzznxfsgbudgnzu`
2. اذهب إلى `Project Settings` → `API`
3. انسخ المفتاح من قسم `service_role` (المفتاح السري `secret`)
4. **لا تشاركه أبداً** في أي مكان عام — استخدمه فقط في هذه السكربتات المؤقتة.

---

## ماذا يحدث إذا كان البكت موجوداً بالفعل؟

السكربت سيعرض رسالة:
```
✅ البكت signage-assets موجود بالفعل.
```
ولن يحدث أي خطأ.
