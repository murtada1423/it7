# سكربت PowerShell لإنشاء Bucket signage-assets تلقائياً
#
# طريقة التشغيل:
#  1. احصل على service_role من Supabase → Settings → API
#  2. ضع القيمة في متغير البيئة (مؤقتاً لهذه الجلسة فقط):
#     $env:SUPABASE_SERVICE_KEY = "eyJhbG..."
#  3. شغّل: .\create-bucket.ps1
#
# أو مباشرة مع المفتاح:
#  $env:SUPABASE_SERVICE_KEY="eyJ..."; .\create-bucket.ps1

$url = $env:NEXT_PUBLIC_SUPABASE_URL
$serviceKey = $env:SUPABASE_SERVICE_KEY

if (-not $url -or -not $serviceKey) {
    Write-Host "❌ خطأ: تأكد من وجود متغيرات البيئة:" -ForegroundColor Red
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_KEY"
    Write-Host ""
    Write-Host "مثال التشغيل:"
    Write-Host '  $env:NEXT_PUBLIC_SUPABASE_URL="https://...supabase.co"'
    Write-Host '  $env:SUPABASE_SERVICE_KEY="eyJhbG..."'
    Write-Host '  .\create-bucket.ps1'
    exit 1
}

Write-Host "🔄 جاري إنشاء البكت signage-assets في المشروع: $url" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $serviceKey"
    "Content-Type"  = "application/json"
    "apikey"        = $serviceKey
}

# ملاحظة: بعض نسخ Supabase تستخدم endpoint مختلف، هذا هو القياسي
$body = @{
    name  = "signage-assets"
    public = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$url/storage/v1/bucket/signage-assets" `
        -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "✅ تم إنشاء البكت بنجاح!" -ForegroundColor Green
} catch {
    # إذا كان الخطأ "Bucket already exists" أو ما شابه
    $errMsg = $_.Exception.Message
    if ($errMsg -match "already exists" -or $errMsg -match "Bucket" -or $errMsg -match "409") {
        Write-Host "✅ البكت signage-assets موجود بالفعل (لا حاجة لإنشائه مرة أخرى)." -ForegroundColor Green
    } else {
        Write-Host "❌ خطأ أثناء إنشاء البكت:" -ForegroundColor Red
        Write-Host $errMsg
    }
}
