#!/bin/bash
# CalOpen 로컬 실행 스크립트
# bash에서 실행: chmod +x setup.sh && ./setup.sh

echo "🔧 CalOpen 설정 시작..."

# 1. Node.js 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "   https://nodejs.org 에서 LTS 버전을 설치하세요."
    exit 1
fi

echo "✅ Node.js $(node -v) 감지"

# 2. npm 확인
if ! command -v npm &> /dev/null; then
    echo "❌ npm이 설치되어 있지 않습니다."
    exit 1
fi

echo "✅ npm $(npm -v) 감지"

# 3. 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 4. 환경변수 설정
if [ ! -f .env ]; then
    echo "📋 .env.example을 .env로 복사 중..."
    cp .env.example .env
    echo "⚠️  .env 파일을 편집하여 API 키를 설정하세요!"
fi

# 5. 테스트 실행
echo "🧪 테스트 실행 중..."
npm test

echo ""
echo "✅ 설정 완료!"
echo ""
echo "다음 단계:"
echo "  1. .env 파일에 API 키 설정"
echo "  2. npm run dev 로 개발 서버 시작"
echo "  3. http://localhost:3000 접속"
