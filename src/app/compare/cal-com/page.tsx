import type { Metadata } from 'next';
import ComparePage from '../CompareTable';

export const metadata: Metadata = {
  title: 'CalOpen vs Cal.com: Open Source Alternative (2026)',
  description:
    'Cal.com went closed-source in April 2026. CalOpen is the MIT-licensed open source scheduling alternative with self-hosting and PayPal.',
  alternates: { canonical: 'https://calopen.vercel.app/compare/cal-com' },
};

const ROWS = [
  { feature: 'Open source license', featureKo: '오픈소스 라이선스', calopen: 'MIT', other: 'Closed (since Apr 2026)' },
  { feature: 'Self-hosting', featureKo: '셀프호스팅', calopen: 'Docker, 1 command', other: 'Enterprise only' },
  { feature: 'Free plan', featureKo: '무료 요금제', calopen: '1 user, unlimited events', other: 'Limited' },
  { feature: 'PayPal payments', featureKo: 'PayPal 결제', calopen: true, other: 'Stripe focus' },
  { feature: 'Google Calendar sync', featureKo: '구글 캘린더 연동', calopen: true, other: true },
  { feature: 'Korean / English UI', featureKo: '한글/영어 UI', calopen: true, other: false },
  { feature: 'Teams & SSO', featureKo: '팀·SSO', calopen: false, other: true },
  { feature: 'Mobile apps', featureKo: '모바일 앱', calopen: false, other: true },
  { feature: 'Marketplace integrations', featureKo: '마켓플레이스 연동', calopen: false, other: true },
];

export default function CompareCalcom() {
  return (
    <ComparePage
      competitor="Cal.com"
      competitorKo="Cal.com"
      competitorPrice="freemium"
      rows={ROWS}
      verdict="Cal.com closed its source in April 2026. CalOpen keeps the open-source scheduling promise: MIT, self-hosted, free."
      verdictKo="Cal.com은 2026년 4월 클로즈드로 전환. CalOpen이 오픈소스 약속을 잇습니다: MIT, 셀프호스팅, 무료."
    />
  );
}
