# CalOpen 배포 가이드

## 1단계: Supabase 프로젝트 생성

### 1. Supabase 계정 생성
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub로 회원가입

### 2. 새 프로젝트 생성
1. "New Project" 클릭
2. 프로젝트 이름: `calopen`
3. 데이터베이스 비밀번호 설정 (기억해두세요)
4. Region: 가장 가까운 리전 선택
5. "Create new project" 클릭

### 3. 환경변수 복사
프로젝트 대시보드 → Settings → API:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

### 4. 데이터베이스 마이그레이션
1. 대시보드 → SQL Editor 클릭
2. `supabase/migrations/001_initial.sql` 내용 복사
3. SQL Editor에 붙여넣기
4. "Run" 클릭

---

## 2단계: PayPal 상품 설정

### 1. PayPal Business 계정
1. https://www.paypal.com/business 접속
2. Business 계정 생성 또는 로그인

### 2. REST API 앱 생성
1. https://developer.paypal.com/dashboard 접속
2. "Apps & Credentials" 클릭
3. "Create App" 클릭
4. 앱 이름: `calopen`
5. Sandbox/Live 토큰 복사

### 3. 구독 상품 생성 (Sandbox)
1. PayPal Dashboard → Payments → Subscriptions
2. "Create Plan" 클릭:
   - **Teams Plan**: $12/월
   - **Organizations Plan**: $28/월
3. Plan ID 복사

### 4. 환경변수 설정
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_TEAMS_PLAN_ID=your_teams_plan_id
PAYPAL_ORGS_PLAN_ID=your_orgs_plan_id
```

---

## 3단계: Resend 이메일 설정

1. https://resend.com 접속
2. GitHub로 회원가입
3. "Create API Key" 클릭
4. API 키 복사 → `RESEND_API_KEY`
5. 도메인 추가 (선택사항)

---

## 4단계: Railway 배포

### 1. Railway 계정
1. https://railway.app 접속
2. GitHub로 회원가입

### 2. 새 프로젝트
1. "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. `calopen` 저장소 선택

### 3. 환경변수 설정
Railway 대시보드 → Variables 탭:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_TEAMS_PLAN_ID=...
PAYPAL_ORGS_PLAN_ID=...
RESEND_API_KEY=...
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
```

### 4. 커스텀 도메인 (선택)
1. Railway → Settings → Custom Domain
2. 도메인 입력
3. DNS 레코드 추가

---

## 5단계: 로컬 개발

```bash
# 프로젝트 클론
git clone https://github.com/yourusername/calopen.git
cd calopen

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일 편집

# 개발 서버 시작
npm run dev
```

---

## 문제 해결

### 데이터베이스 연결 오류
```bash
# 로컬 PostgreSQL 실행 (Docker)
docker run -d --name calopen-db -p 5432:5432 -e POSTGRES_DB=calopen -e POSTGRES_PASSWORD=postgres postgres:16-alpine
```

### PayPal 샌드박스 테스트
1. https://sandbox.paypal.com 접속
2. 테스트 계정으로 로그인
3. 테스트 결제 진행

---

## 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 마이그레이션 실행 완료
- [ ] PayPal Business 계정 설정 완료
- [ ] PayPal 상품/플랜 생성 완료
- [ ] Resend API 키 발급 완료
- [ ] Railway 환경변수 설정 완료
- [ ] 배포 완료
- [ ] 커스텀 도메인 연결 (선택)
