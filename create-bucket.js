#!/usr/bin/env node
/**
 * سكربت تلقائي لإنشاء Bucket باسم signage-assets في Supabase
 *
 * طريقة التشغيل:
 *  1. احصل على service_role (المفتاح السري) من Supabase → Settings → API
 *  2. ضع المفتاح في متغير البيئة مؤقتاً أو في ملف .env
 *  3. شغّل: node create-bucket.js
 */

const fs = require('fs');
const path = require('path');

// قراءة .env.local يدوياً بدون dotenv
function loadEnv() {
  try {
    const content = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
    content.split('\n').forEach(line => {
      const [key, ...valParts] = line.split('=');
      if (key && valParts.length > 0) {
        const value = valParts.join('=').trim();
        if (key.trim() === 'NEXT_PUBLIC_SUPABASE_URL') {
          process.env.NEXT_PUBLIC_SUPABASE_URL = value;
        }
      }
    });
  } catch (e) {
    // تجاهل إذا لم يوجد الملف
  }
}
loadEnv();

const { createClient } = require('@supabase/supabase-js');

// استخدم المفتاح العام من .env.local
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// يجب إدخال service_role يدوياً أو عبر متغير بيئة مؤقت
const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!url || !serviceKey) {
  console.error('❌ خطأ: تأكد من وجود NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_KEY');
  console.error('');
  console.error('مثال التشغيل:');
  console.error('  SUPABASE_SERVICE_KEY=eyJhbG... node create-bucket.js');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createBucket() {
  console.log('🔄 جاري إنشاء البكت signage-assets...');

  const { data, error } = await supabase.storage.createBucket('signage-assets', {
    public: true,
    allowedMimeTypes: [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
    fileSizeLimit: 1024 * 1024 * 50, // 50MB
  });

  if (error) {
    if (error.message && error.message.toLowerCase().includes('already exists')) {
      console.log('✅ البكت signage-assets موجود بالفعل.');
    } else {
      console.error('❌ خطأ أثناء إنشاء البكت:', error.message || error);
    }
    return;
  }

  console.log('✅ تم إنشاء البكت بنجاح:', data?.name || 'signage-assets');
}

createBucket();
