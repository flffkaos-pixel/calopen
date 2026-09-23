'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'ko' | 'en';

const dictionaries = {
  en: {
    'nav.login': 'Log in',
    'nav.signup': 'Get Started Free',
    'nav.start': 'Start Free',
    'nav.github': 'View on GitHub',
    'hero.title1': 'Open Source Scheduling',
    'hero.title2': 'for Regulated Businesses',
    'hero.sub': 'HIPAA-ready, self-hosted, CalDAV-native. The scheduling platform that respects your data.',
    'features.title': 'Why CalOpen?',
    'features.hipaa': 'HIPAA Ready',
    'features.hipaa.d': 'Audit logs, encryption at rest, access controls. Built for healthcare from day one.',
    'features.self': 'Self-Hosted',
    'features.self.d': 'One Docker command. Your data stays on your servers. No vendor lock-in.',
    'features.caldav': 'CalDAV Native',
    'features.caldav.d': 'Works with Nextcloud, Fastmail, iCloud. True calendar portability.',
    'features.pay': 'PayPal Payments',
    'features.pay.d': 'Collect payments for appointments. Support for subscriptions and one-time payments.',
    'features.tz': 'Timezone Smart',
    'features.tz.d': 'Automatic timezone detection. Perfect for remote teams and global clients.',
    'features.embed': 'Embeddable',
    'features.embed.d': 'Add booking to your site with a single script tag. Customizable widgets.',
    'pricing.title': 'Simple Pricing',
    'pricing.free': 'Free',
    'pricing.teams': 'Teams',
    'pricing.orgs': 'Organizations',
    'pricing.forever': 'forever',
    'pricing.perUser': '/user/month',
    'pricing.cta.start': 'Get Started',
    'pricing.cta.trial': 'Start Trial',
    'pricing.cta.contact': 'Contact Sales',
    'auth.login.title': 'Welcome back',
    'auth.login.sub': 'Log in to your account',
    'auth.signup.title': 'Create your account',
    'auth.signup.sub': 'Start scheduling in minutes',
    'auth.name': 'Name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.create': 'Create account',
    'auth.signin': 'Sign in',
    'auth.haveAccount': 'Already have an account? Sign in',
    'auth.noAccount': "Don't have an account? Sign up",
    'book.selectEvent': 'Select Event Type',
    'book.dateTime': 'Select a date and time for your appointment',
    'book.availableTimes': 'Available times for',
    'book.noTimes': 'No available times on this day.',
    'book.loadingTimes': 'Loading times…',
    'book.details': 'Enter your details',
    'book.name': 'Name',
    'book.email': 'Email',
    'book.notes': 'Notes (optional)',
    'book.confirm': 'Confirm Booking',
    'book.booking': 'Booking…',
    'book.confirmed': 'Booking Confirmed!',
    'book.unavailable': 'Unavailable',
    'book.loading': 'Loading…',
    'dash.dashboard': 'Dashboard',
    'dash.events': 'Event Types',
    'dash.availability': 'Availability',
    'dash.bookings': 'Bookings',
    'dash.settings': 'Settings',
    'dash.signout': 'Sign out',
    'common.minutes': 'minutes',
    'common.free': 'Free',
    'sub.title': 'Subscription',
    'sub.current': 'Current plan',
    'sub.freeName': 'Free Plan',
    'sub.freeDesc': '1 user, unlimited event types',
    'sub.teamsName': 'Teams — $12/mo',
    'sub.upgrade': 'Upgrade to Teams',
    'sub.upgradeDesc': 'Team scheduling, remove branding, custom domain.',
    'sub.loading': 'Loading…',
  },
  ko: {
    'nav.login': '로그인',
    'nav.signup': '무료로 시작하기',
    'nav.start': '무료 시작',
    'nav.github': 'GitHub에서 보기',
    'hero.title1': '오픈소스 예약 스케줄링',
    'hero.title2': '규제 산업을 위한 플랫폼',
    'hero.sub': 'HIPAA-ready, 셀프호스팅, CalDAV 네이티브. 당신의 데이터를 존중하는 예약 플랫폼.',
    'features.title': '왜 CalOpen인가?',
    'features.hipaa': 'HIPAA Ready',
    'features.hipaa.d': '감사 로그, 저장 데이터 암호화, 접근 제어. 의료 현장을 위해 처음부터 설계.',
    'features.self': '셀프호스팅',
    'features.self.d': 'Docker 명령어 하나로 설치. 데이터는 당신의 서버에. 종속 없음.',
    'features.caldav': 'CalDAV 네이티브',
    'features.caldav.d': 'Nextcloud, Fastmail, iCloud와 연동. 진짜 캘린더 이식성.',
    'features.pay': 'PayPal 결제',
    'features.pay.d': '예약료 결제 수금. 구독과 일회성 결제 지원.',
    'features.tz': '시간대 자동 인식',
    'features.tz.d': '자동 시간대 감지. 원격 팀과 글로벌 고객에게 완벽.',
    'features.embed': '임베드 가능',
    'features.embed.d': '스크립트 태그 하나로 사이트에 예약 위젯 추가. 커스터마이징 가능.',
    'pricing.title': '심플한 요금제',
    'pricing.free': 'Free',
    'pricing.teams': 'Teams',
    'pricing.orgs': 'Organizations',
    'pricing.forever': '영원히 무료',
    'pricing.perUser': '/인/월',
    'pricing.cta.start': '시작하기',
    'pricing.cta.trial': '체험 시작',
    'pricing.cta.contact': '영업팀 문의',
    'auth.login.title': '다시 오신 걸 환영해요',
    'auth.login.sub': '계정에 로그인하세요',
    'auth.signup.title': '계정 만들기',
    'auth.signup.sub': '몇 분이면 예약 시작',
    'auth.name': '이름',
    'auth.email': '이메일',
    'auth.password': '비밀번호',
    'auth.create': '계정 만들기',
    'auth.signin': '로그인',
    'auth.haveAccount': '이미 계정이 있나요? 로그인',
    'auth.noAccount': '계정이 없나요? 가입하기',
    'book.selectEvent': '이벤트 선택',
    'book.dateTime': '예약 날짜와 시간을 선택하세요',
    'book.availableTimes': '예약 가능 시간',
    'book.noTimes': '이 날은 예약 가능한 시간이 없어요.',
    'book.loadingTimes': '시간 불러오는 중…',
    'book.details': '정보 입력',
    'book.name': '이름',
    'book.email': '이메일',
    'book.notes': '메모 (선택)',
    'book.confirm': '예약 확정',
    'book.booking': '예약 중…',
    'book.confirmed': '예약 확정!',
    'book.unavailable': '예약 불가',
    'book.loading': '불러오는 중…',
    'dash.dashboard': '대시보드',
    'dash.events': '이벤트 종류',
    'dash.availability': '가능 시간',
    'dash.bookings': '예약 목록',
    'dash.settings': '설정',
    'dash.signout': '로그아웃',
    'common.minutes': '분',
    'common.free': '무료',
    'sub.title': '구독',
    'sub.current': '현재 요금제',
    'sub.freeName': 'Free 플랜',
    'sub.freeDesc': '1인, 이벤트 무제한',
    'sub.teamsName': 'Teams — 월 $12',
    'sub.upgrade': 'Teams로 업그레이드',
    'sub.upgradeDesc': '팀 스케줄링, 브랜딩 제거, 커스텀 도메인.',
    'sub.loading': '불러오는 중…',
  },
} as const;

export type DictKey = keyof (typeof dictionaries)['en'];

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: 'ko',
  setLang: () => {},
  t: (k) => k,
});

function detectInitial(): Lang {
  if (typeof window === 'undefined') return 'ko';
  const saved = window.localStorage.getItem('calopen-lang');
  if (saved === 'en' || saved === 'ko') return saved;
  const nav = window.navigator.language.toLowerCase();
  return nav.startsWith('ko') ? 'ko' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');

  useEffect(() => {
    setLangState(detectInitial());
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem('calopen-lang', l);
      document.documentElement.lang = l === 'ko' ? 'ko' : 'en';
    } catch {}
  };

  useEffect(() => {
    try {
      document.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
    } catch {}
  }, [lang]);

  const t = (key: DictKey): string => {
    return dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  };

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
      className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
      aria-label="Switch language"
    >
      {lang === 'ko' ? 'EN' : '한'}
    </button>
  );
}
