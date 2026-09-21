# لا يعمل في SQL Editor — التخزين (Storage) منفصل عن قاعدة البيانات
#
# أسرع طريقة لإنشاء البكت: أمر واحد في PowerShell (يحتاج service_role مؤقتاً)

# انسخ والصق هذا الأمر مباشرة في PowerShell (استبدل مفتاحك الحقيقي):
#
# $env:SUPABASE_SERVICE_KEY="eyJ..."; Invoke-RestMethod -Uri "https://hznengzznxfsgbudgnzu.supabase.co/storage/v1/bucket/signage-assets" -Method Post -Headers @{"Authorization"="Bearer $env:SUPABASE_SERVICE_KEY";"Content-Type"="application/json";"apikey"="$env:SUPABASE_SERVICE_KEY"} -Body '{"name":"signage-assets","public":true}'
