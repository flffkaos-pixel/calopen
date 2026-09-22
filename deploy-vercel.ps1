# Vercel 배포 스크립트
# 이 스크립트는 로컬에서 Vercel CLI를 설치하고 배포를 시도합니다.

Write-Host "🚀 Vercel 배포 시작..." -ForegroundColor Green

# Node.js 경로 설정
$nodePath = "C:\nodejs\node-v22.12.0-win-x64"
$env:PATH = "$nodePath;$env:PATH"

# 1. Vercel CLI 설치 시도
Write-Host "📦 Vercel CLI 설치 중..." -ForegroundColor Yellow
try {
    & npm install -g vercel@latest 2>&1
    Write-Host "✅ Vercel CLI 설치 완료" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Vercel CLI 설치 실패 - 수동 배포로 진행합니다" -ForegroundColor Yellow
    Write-Host "📚 수동 배포 가이드: VERCEL-DEPLOY.md" -ForegroundColor Cyan
    exit 0
}

# 2. Vercel 로그인 확인
Write-Host "🔐 Vercel 로그인 확인..." -ForegroundColor Yellow
try {
    $vercelUser = & vercel whoami 2>&1
    Write-Host "✅ 로그인됨: $vercelUser" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Vercel에 로그인이 필요합니다" -ForegroundColor Yellow
    Write-Host "🔗 https://vercel.com/login 에서 로그인하세요" -ForegroundColor Cyan
    Write-Host "또는 브라우저에서 직접 로그인 후 다시 실행하세요" -ForegroundColor Cyan
    exit 0
}

# 3. 프로젝트 배포
Write-Host "🚀 프로젝트 배포 중..." -ForegroundColor Yellow
try {
    & vercel --prod --yes
    Write-Host "✅ 배포 완료!" -ForegroundColor Green
    Write-Host "🔗 https://calopen.vercel.app 에서 확인하세요" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 배포 실패" -ForegroundColor Red
    Write-Host "📚 VERCEL-DEPLOY.md 를 참고하여 수동 배포하세요" -ForegroundColor Cyan
}

Write-Host "`n📋 다음 단계:" -ForegroundColor Yellow
Write-Host "1. https://vercel.com 에서 프로젝트 확인" -ForegroundColor White
Write-Host "2. 환경 변수 설정 (Supabase, PayPal)" -ForegroundColor White
Write-Host "3. 도메인 연결 (선택)" -ForegroundColor White
