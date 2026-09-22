# CalOpen 로컬 실행 스크립트
# PowerShell에서 실행: .\setup.ps1

Write-Host "🔧 CalOpen 설정 시작..." -ForegroundColor Cyan

# 1. Node.js 확인
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "   https://nodejs.org 에서 LTS 버전을 설치하세요." -ForegroundColor Yellow
    Write-Host "   설치 후 이 스크립트를 다시 실행하세요." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js $(node -v) 감지" -ForegroundColor Green

# 2. npm 확인
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm이 설치되어 있지 않습니다." -ForegroundColor Red
    exit 1
}

Write-Host "✅ npm $(npm -v) 감지" -ForegroundColor Green

# 3. 의존성 설치
Write-Host "📦 의존성 설치 중..." -ForegroundColor Cyan
npm install

# 4. 환경변수 설정
if (-not (Test-Path .env)) {
    Write-Host "📋 .env.example을 .env로 복사 중..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host "⚠️  .env 파일을 편집하여 API 키를 설정하세요!" -ForegroundColor Yellow
}

# 5. 테스트 실행
Write-Host "🧪 테스트 실행 중..." -ForegroundColor Cyan
npm test

Write-Host ""
Write-Host "✅ 설정 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "  1. .env 파일에 API 키 설정" -ForegroundColor White
Write-Host "  2. npm run dev 로 개발 서버 시작" -ForegroundColor White
Write-Host "  3. http://localhost:3000 접속" -ForegroundColor White
