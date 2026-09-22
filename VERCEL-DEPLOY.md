# Vercel 배포 가이드

> ✅ **배포 완료**: https://calopen.vercel.app (2026-09-22 자동 설정됨)
> - Supabase 프로젝트: calopen (Seoul 리전)
> - PayPal Live 앱: calopen (+ 구독 플랜 2개)
> - 환경 변수 11개 설정됨

## 🚀 수동 배포 (5분)

### 1단계: Vercel 계정 생성
1. https://vercel.com 접속
2. **Sign Up** 클릭
3. **GitHub** 계정으로 로그인
4. 권한 요청 동의

### 2단계: 프로젝트 가져오기
1. **Dashboard**에서 **"Add New..."** 클릭
2. **"Project"** 선택
3. **"Import Git Repository"** 클릭
4. `flffkaos-pixel/calopen` 선택
5. **"Import"** 클릭

### 3단계: 환경 변수 설정
**Build & Development Settings** 섹션에서:

| 변수 이름 | 값 | 설명 |
|-----------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | (나중에 설정) | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (나중에 설정) | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | (나중에 설정) | Supabase service role key |
| `PAYPAL_CLIENT_ID` | (나중에 설정) | PayPal Client ID |
| `PAYPAL_CLIENT_SECRET` | (나중에 설정) | PayPal Secret |
| `RESEND_API_KEY` | (나중에 설정) | Resend API Key |
| `NEXT_PUBLIC_APP_URL` | `https://calopen.vercel.app` | 앱 URL |

> 💡 **팁**: 환경 변수는 나중에 설정해도 됩니다. 일단 배포 먼저 하세요.

### 4단계: 배포
1. **"Deploy"** 버튼 클릭
2. 빌드 완료 대기 (약 2-3분)
3. 배포 완료 시 `https://calopen.vercel.app` 접속 가능

---

## 🔧 프로젝트 이름 변경 (선택)

기본 이름: `calopen-vercel-app`
커스텀 이름: `calopen` 또는 다른 이름

**변경 방법:**
1. Vercel Dashboard → 프로젝트 선택
2. **Settings** → **General**
3. **Project Name** 변경
4. **Save** 클릭

---

## 🌐 커스텀 도메인 연결 (선택)

1. 도메인 구매 (Namecheap, Cloudflare, Google Domains 등)
2. Vercel Dashboard → 프로젝트 → **Settings** → **Domains**
3. 도메인 입력
4. DNS 설정 안내에 따라 레코드 추가

---

## ⚠️ 빌드 오류 해결

###常见的 빌드 오류:
1. **TypeScript 오류**: `tsconfig.json`에서 strict 모드 비활성화 고려
2. **환경 변수 오류**: `.env.local` 파일 확인
3. **의존성 오류**: `npm install` 재실행

### 로그 확인:
Vercel Dashboard → 프로젝트 → **Deployments** → 해당 배포 클릭 → **Function Logs**

---

## 📝 다음 단계

1. ✅ Vercel 배포 완료
2. ⏳ Supabase 프로젝트 생성
3. ⏳ PayPal 상품 설정
4. ⏳ 환경 변수 업데이트
5. ⏳ 도메인 연결

---

## 🆘 문제 해결

**문제**: 배포 실패
**해결**: 빌드 로그 확인 → 로컬에서 `npm run build` 실행 → 오류 수정

**문제**: 환경 변수 오류
**해결**: Vercel Dashboard → Settings → Environment Variables 확인

**문제**: API 라우트 404
**해결**: `src/app/api/` 디렉토리 구조 확인

---

## 📚 참고 링크

- [Vercel Next.js 문서](https://vercel.com/docs/next.js/overview)
- [환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)
- [커스텀 도메인](https://vercel.com/docs/concepts/projects/domains)
