# 환경 변수 검증 스크립트
# .env.local 파일이 올바르게 설정되어 있는지 확인

Write-Host "🔍 환경 변수 검증..." -ForegroundColor Yellow
Write-Host ""

$envFile = ".env.local"
$requiredVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PAYPAL_CLIENT_ID",
    "PAYPAL_CLIENT_SECRET",
    "NEXT_PUBLIC_APP_URL"
)

$missingVars = @()
$emptyVars = @()

if (Test-Path $envFile) {
    Write-Host "✅ .env.local 파일 발견" -ForegroundColor Green
    Write-Host ""
    
    foreach ($var in $requiredVars) {
        $line = Get-Content $envFile | Where-Object { $_ -match "^$var=" }
        if ($line) {
            $value = $line -replace "^$var=", ""
            if ($value -eq "" -or $value -eq "your-value-here" -or $value -match "placeholder") {
                $emptyVars += $var
                Write-Host "⚠️  $var - 값이 비어있거나 플레이스홀더입니다" -ForegroundColor Yellow
            } else {
                Write-Host "✅ $var - 설정됨" -ForegroundColor Green
            }
        } else {
            $missingVars += $var
            Write-Host "❌ $var - 누락" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ .env.local 파일이 없습니다" -ForegroundColor Red
    Write-Host ""
    Write-Host "다음 내용으로 .env.local 파일을 생성하세요:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "# Supabase" -ForegroundColor Cyan
    Write-Host "NEXT_PUBLIC_SUPABASE_URL=your-supabase-url"
    Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key"
    Write-Host "SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key"
    Write-Host ""
    Write-Host "# PayPal" -ForegroundColor Cyan
    Write-Host "PAYPAL_CLIENT_ID=your-paypal-client-id"
    Write-Host "PAYPAL_CLIENT_SECRET=your-paypal-client-secret"
    Write-Host ""
    Write-Host "# App" -ForegroundColor Cyan
    Write-Host "NEXT_PUBLIC_APP_URL=https://calopen.vercel.app"
    Write-Host ""
    $missingVars = $requiredVars
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan

if ($missingVars.Count -eq 0 -and $emptyVars.Count -eq 0) {
    Write-Host "✅ 모든 환경 변수가 올바르게 설정되어 있습니다!" -ForegroundColor Green
    Write-Host ""
    Write-Host "테스트 방법:" -ForegroundColor Yellow
    Write-Host "1. npm run dev 로 로컬 서버 실행"
    Write-Host "2. http://localhost:3000 접속"
    Write-Host "3. 회원가입/로그인 테스트"
} else {
    Write-Host "⚠️  설정이 필요합니다:" -ForegroundColor Yellow
    if ($missingVars.Count -gt 0) {
        Write-Host "   누락된 변수: $($missingVars -join ', ')" -ForegroundColor Red
    }
    if ($emptyVars.Count -gt 0) {
        Write-Host "   빈 변수: $($emptyVars -join ', ')" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "위의 .env.local 파일을 생성하거나 수정하세요." -ForegroundColor Cyan
}
