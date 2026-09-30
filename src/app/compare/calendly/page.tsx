import type { Metadata } from 'next';
import ComparePage from '../CompareTable';

export const metadata: Metadata = {
  title: 'CalOpen vs Calendly: Honest Comparison (2026)',
  description:
    'CalOpen vs Calendly compared: price, open source, self-hosting, PayPal payments. Free open source Calendly alternative.',
  alternates: { canonical: 'https://calopen.vercel.app/compare/calendly' },
};

const ROWS = [
  { feature: 'Free plan', featureKo: '무료 요금제', calopen: '1 user, unlimited events', other: '1 event type only' },
  { feature: 'Open source', featureKo: '오픈소스', calopen: true, other: false },
  { feature: 'Self-hosting', featureKo: '셀프호스팅', calopen: true, other: false },
  { feature: 'Your data stays yours', featureKo: '데이터 소유권', calopen: true, other: false },
  { feature: 'PayPal payments', featureKo: 'PayPal 결제', calopen: true, other: 'Stripe only' },
  { feature: 'Google Calendar sync', featureKo: '구글 캘린더 연동', calopen: true, other: true },
  { feature: 'Guest self-cancel links', featureKo: '게스트 자가 취소', calopen: true, other: true },
  { feature: 'Workflows & routing', featureKo: '워크플로우·라우팅', calopen: false, other: true },
  { feature: 'Mobile apps', featureKo: '모바일 앱', calopen: false, other: true },
  { feature: 'Brand trust', featureKo: '브랜드 신뢰도', calopen: false, other: true },
];

export default function CompareCalendly() {
  return (
    <ComparePage
      competitor="Calendly"
      competitorKo="Calendly"
      competitorPrice="from $10/mo"
      rows={ROWS}
      verdict="Choose Calendly for enterprise features. Choose CalOpen to own your data for free."
      verdictKo="대기업 기능은 Calendly, 내 데이터 소유 + 무료는 CalOpen."
    />
  );
}
