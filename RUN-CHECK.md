# خطوات التشغيل والفحص

---

## 1. المتطلبات

تأكد من وجود Node.js (الإصدار 18 أو أعلى):

```bash
node -v
npm -v
```

---

## 2. تثبيت المكتبات

```bash
npm install
```

---

## 3. إعداد البيئة (`.env.local`)

افتح الملف `.env.local` واكتب بيانات Supabase الخاصة بك:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-here>
```

> إذا لم يكن لديك مشروع Supabase بعد، أنشئه مجاناً من [supabase.com](https://supabase.com) ثم انسخ `URL` و`anon key` من إعدادات المشروع → API.

---

## 4. إعداد Supabase (قبل التشغيل)

### أ. إنشاء Bucket للتخزين
1. افتح لوحة تحكم Supabase.
2. اذهب إلى **Storage** → **New Bucket**.
3. اسم البكت: `signage-assets`.
4. اجعله **Public** (للقراءة العامة).

### ب. تشغيل قاعدة البيانات
1. اذهب إلى **SQL Editor**.
2. افتح الملف `schema.sql` من المشروع.
3. اضغط **Run** لتنفيذ كل الأوامر.

---

## 5. تشغيل الموقع محلياً

```bash
npm run dev
```

سيبدأ الخادم عادة على المنفذ `3000`. ستظهر رسالة في الطرفية:

```
- Local:        http://localhost:3000
```

---

## 6. فحص الصفحات

### صفحة العرض (`/display`)
افتح المتصفح على:

```
http://localhost:3000/display
```

ما يجب أن تراه:
- شاشة سوداء كاملة.
- نص "Loading Display Payload..." أولاً، ثم المحتوى الافتراضي (فيديو `ForBiggerBlazes.mp4`).
- لا يوجد أي حواف بيضاء أو سوداء — الفيديو/الصورة تغطي الشاشة بالكامل (`object-cover`).
- في الأسفل يوجد نص صغير (اسم الملف الحالي).

### لوحة التحكم (`/admin`)
افتح:

```
http://localhost:3000/admin
```

ما يجب أن تراه:
- صفحة داكنة مع عنوان **SIGNAGE CONTROL**.
- زر رفع الملفات في اليسار.
- إطار معاينة رأسي (9:16) في اليمين.
- حالة النظام في الأسفل (**Storage: Public**, **Realtime: Active**).

---

## 7. اختبار التزامن الفوري (Realtime Test)

### أ. رفع ملف من `/admin`
1. اختر أي ملف فيديو (`.mp4`) أو صورة (`.png`) من جهازك.
2. اضغط **Broadcast to Display**.
3. انتظر حتى يظهر **Broadcast active** ورسالة النجاح.

### ب. فحص التحديث على `/display`
1. اترك صفحة `/display` مفتوحة في تبويب آخر (أو على هاتف آخر).
2. بعد رفع الملف من `/admin` → يجب أن يتغير المحتوى على `/display` في أقل من ثانيتين بدون أي `refresh`.
3. إذا كان الملف فيديو → يجب أن يبدأ التشغيل تلقائياً.

---

## 8. فحص الأخطاء (إذا لم يعمل)

### إذا لم يظهر شيء في `/display`:
- افتح **DevTools** (`F12`) → تبويب **Console**.
- ابحث عن أخطاء مثل:
  - `Missing Supabase environment variables`
  - `Fetch error`
- تحقق من أن `.env.local` يحتوي على القيم الصحيحة وأن الخادم أُعيد تشغيله بعد التعديل.

### إذا لم يعمل التزامن الفوري:
- في `Console` ابحث عن رسائل مثل:
  - `Realtime channel subscribed`
  - أو أي خطأ في الاتصال بـ `wss://`.
- تأكد من أن `supabase_realtime` مضاف في `schema.sql` وأن البكت `signage-assets` موجود ومُعد كـ Public.

---

## 9. اختبار على الهاتف (اختياري)

للتأكد من أن التصميم رأسي (9:16) يعمل بشكل صحيح:

1. افتح `/display` على هاتفك عبر نفس الشبكة (`http://<IP-جهازك>:3000/display`).
2. يجب أن تملأ الشاشة بالكامل بدون أي خطوط سوداء أو بيضاء.

---

## ملخص سريع للأوامر

```bash
# تثبيت
npm install

# إعداد البيئة
# (عدّل .env.local)

# إعداد Supabase
# (أنشئ bucket signage-assets + نفّذ schema.sql)

# تشغيل
npm run dev

# فتح الصفحات
# http://localhost:3000/display
# http://localhost:3000/admin
```
