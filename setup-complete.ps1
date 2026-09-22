# CalOpen 설정 가이드 (자동화 스크립트)

Write-Host "🚀 CalOpen 설정 시작..." -ForegroundColor Green
Write-Host ""

# 1단계: Supabase 설정
Write-Host "📦 1단계: Supabase 설정" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host "1. https://supabase.com 접속"
Write-Host "2. GitHub로 로그인"
Write-Host '3. "New project" 클릭'
Write-Host '4. 설정:'
Write-Host "   - Project name: calopen"
Write-Host "   - Database password: (기억해두세요)"
Write-Host '5. "Create new project" 클릭'
Write-Host ""
Write-Host "완료되면 Supabase 대시보드에서:" -ForegroundColor Yellow
Write-Host '   - Settings → API 탭'
Write-Host "   - Project URL 복사"
Write-Host "   - anon public 키 복사"
Write-Host "   - service_role 키 복사"
Write-Host ""

# 사용자 입력 대기
Read-Host "Supabase 설정 완료 후 Enter를 누르세요"

# 2단계: SQL 마이그레이션 실행
Write-Host ""
Write-Host "📦 2단계: 데이터베이스 테이블 생성" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host '1. Supabase 대시보드 → "SQL Editor" 탭'
Write-Host "2. 아래 SQL 복사하여 붙여넣기:"
Write-Host ""

$sqlContent = Get-Content -Path "supabase\migrations\001_initial.sql" -Raw
Write-Host $sqlContent -ForegroundColor DarkGray
Write-Host ""
Write-Host '3. "Run" 클릭' -ForegroundColor Green
Write-Host ""

# 사용자 입력 대기
Read-Host "SQL 실행 완료 후 Enter를 누르세요"

# 3단계: PayPal 설정
Write-Host ""
Write-Host "💰 3단계: PayPal 설정" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host "1. https://developer.paypal.com 접속"
Write-Host "2. PayPal 계정으로 로그인"
Write-Host '3. "Dashboard" → "Apps & Credentials"'
Write-Host '4. "Create App" 클릭'
Write-Host "   - App name: calopen"
Write-Host '   - Sandbox를 "Live"로 변경'
Write-Host ""
Write-Host "완료되면:" -ForegroundColor Yellow
Write-Host "   - Client ID 복사"
Write-Host "   - Secret 복사 (eye 아이콘 클릭)"
Write-Host ""

# 사용자 입력 대기
Read-Host "PayPal 설정 완료 후 Enter를 누르세요"

# 4단계: 환경 변수 설정 안내
Write-Host ""
Write-Host "🔧 4단계: Vercel 환경 변수 설정" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host "https://vercel.com → 프로젝트 → Settings → Environment Variables"
Write-Host ""
Write-Host "다음 변수 추가:" -ForegroundColor Green
Write-Host "NEXT_PUBLIC_SUPABASE_URL = (Supabase URL)"
Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY = (Supabase anon 키)"
Write-Host "SUPABASE_SERVICE_ROLE_KEY = (Supabase service_role 키)"
Write-Host "PAYPAL_CLIENT_ID = (PayPal Client ID)"
Write-Host "PAYPAL_CLIENT_SECRET = (PayPal Secret)"
Write-Host "NEXT_PUBLIC_APP_URL = https://calopen.vercel.app"
Write-Host ""
Write-Host '"Save" 클릭 후 "Redeploy" 클릭' -ForegroundColor Green

Write-Host ""
Write-Host "✅ 설정 완료!" -ForegroundColor Green
Write-Host "🔗 https://calopen.vercel.app 에서 테스트하세요" -ForegroundColor Cyan
