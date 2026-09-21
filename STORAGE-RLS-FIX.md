-- إذا استمر خطأ RLS بعد إنشاء البكت والجدول، جرب تعطيل RLS مؤقتاً على جدول التخزين (Storage metadata)
-- ثم شغّل الأمر التالي في SQL Editor:

ALTER TABLE IF EXISTS storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS storage.buckets DISABLE ROW LEVEL SECURITY;

-- إذا لم تعمل هذه الأوامر (لأن الجدول غير موجود في مخططك)، فهذا يعني أن المشكلة في سياسة `anon` فقط.
-- في هذه الحالة، جرّب رفع الملف باستخدام `service_role` مؤقتاً للاختبار فقط.
