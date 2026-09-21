# تصحيح: خطأ المسار (أنت في مجلد النظام وليس المشروع)

الأمر `node create-bucket.js` فشل لأن الطرفية (`PowerShell`) كانت في:
```
C:\WINDOWS\system32
```
بدلاً من مجلد المشروع:
```
C:\Users\Murtada Razaq\Desktop\mur\it7
```

---

## الحل (انسخ والصق مباشرة)

```powershell
# 1. اذهب لمجلد المشروع أولاً
cd "C:\Users\Murtada Razaq\Desktop\mur\it7"

# 2. ضع المفتاح مؤقتاً
$env:SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. شغّل السكربت من نفس المجلد
node create-bucket.js
```

---

## إذا لم يعمل `node`

تأكد من أنك في المجلد الصحيح بكتابة:
```powershell
pwd
```
يجب أن يظهر:
```
C:\Users\Murtada Razaq\Desktop\mur\it7
```
