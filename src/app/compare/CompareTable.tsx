'use client';

import Link from 'next/link';
import { Calendar, Check, X } from 'lucide-react';
import { useLang, LangToggle } from '@/lib/i18n';

interface Row {
  feature: string;
  featureKo: string;
  calopen: string | boolean;
  other: string | boolean;
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true)
    return (
      <span className="inline-flex justify-center w-full">
        <Check className="h-5 w-5 text-green-600" />
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex justify-center w-full">
        <X className="h-5 w-5 text-gray-300" />
      </span>
    );
  return <span className="text-sm">{value}</span>;
}

export default function ComparePage({
  competitor,
  competitorKo,
  competitorPrice,
  rows,
  verdict,
  verdictKo,
}: {
  competitor: string;
  competitorKo: string;
  competitorPrice: string;
  rows: Row[];
  verdict: string;
  verdictKo: string;
}) {
  const { lang } = useLang();
  const ko = lang === 'ko';

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Calendar className="h-7 w-7 text-blue-600" />
            <span className="text-lg font-bold">CalOpen</span>
          </Link>
          <LangToggle />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">
          CalOpen vs {ko ? competitorKo : competitor}
        </h1>
        <p className="text-center text-gray-600 mb-10">
          {ko
            ? `솔직 비교: 가격, 오픈소스, 셀프호스팅, 결제.`
            : `Honest comparison: price, open source, self-hosting, payments.`}
        </p>

        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold w-1/3"></th>
                <th className="p-4 font-semibold text-blue-600">CalOpen (Free)</th>
                <th className="p-4 font-semibold">
                  {ko ? competitorKo : competitor} ({competitorPrice})
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.feature} className="border-b last:border-0">
                  <td className="p-4 font-medium">{ko ? r.featureKo : r.feature}</td>
                  <td className="p-4">
                    <Cell value={r.calopen} />
                  </td>
                  <td className="p-4">
                    <Cell value={r.other} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
          <p className="font-medium mb-4">{ko ? verdictKo : verdict}</p>
          <Link
            href="/auth/signup"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            {ko ? '무료로 시작하기' : 'Start free'}
          </Link>
        </div>
      </main>
    </div>
  );
}
