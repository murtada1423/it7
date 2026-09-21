# الفرق بين `anon` و `service_role`

| المفتاح | الاسم | يُستخدم في | خطورته إذا نُشر |
|---|---|---|---|
| `anon` (public) | المفتاح العام | المتصفح (Next.js frontend) — `.env.local` | آمن نسبياً (يخضع لـ RLS) |
| `service_role` (secret) | المفتاح السري | الخادم فقط (API Routes / Edge Functions / Scripts إدارية) | **خطير جداً** — يتجاهل RLS ويعطي وصولاً كاملاً للقاعدة والتخزين |

---

## ماذا تستخدم في هذا المشروع؟

في `.env.local` للمشروع الحالي (`/lib/supabase.ts`):

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**لا تستخدم أبداً `service_role` في `.env.local` أو في أي كود يعمل في المتصفح.**

---

## لماذا؟

- `anon` يعمل مع `Row Level Security (RLS)` — أي أن المستخدم لا يرى إلا ما تسمح له السياسة برؤيته.
- `service_role` يتخطى كل سياسات الأمان (`bypass RLS`) ويستطيع قراءة وتعديل وحذف كل شيء في قاعدة البيانات والتخزين.
- إذا وضعت `service_role` في `.env.local` (الذي يُرسل للمتصفح عبر `NEXT_PUBLIC_`)، فأي شخص يفتح موقعك يمكنه سرقة المفتاح واختراق قاعدة بياناتك بالكامل.

---

## أين يُستخدم `service_role` إذاً؟

فقط في:
- `API Routes` في Next.js (`pages/api` أو `app/api`) إذا كنت تبني خادماً وسيطاً.
- `Edge Functions` في Supabase.
- سكربتات إدارية (`admin scripts`) تعمل على جهازك الخاص فقط.

في هذا المشروع الحالي (`signage system`)، لا نحتاج `service_role` نهائياً لأن كل العمليات تتم إما عبر `anon` (من المتصفح) أو مباشرة عبر لوحة التحكم الإدارية (`/admin`) التي تستخدم نفس `anon` مع سياسات `RLS` مفتوحة للكتابة.
