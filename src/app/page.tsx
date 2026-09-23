'use client';

import Link from 'next/link';
import { Calendar, Shield, Clock, Zap, Code, Globe } from 'lucide-react';
import { useLang, LangToggle, type DictKey } from '@/lib/i18n';

export default function LandingPage() {
  const { t } = useLang();

  const features: { icon: React.ReactNode; title: DictKey; desc: DictKey }[] = [
    { icon: <Shield className="h-8 w-8" />, title: 'features.hipaa', desc: 'features.hipaa.d' },
    { icon: <Code className="h-8 w-8" />, title: 'features.self', desc: 'features.self.d' },
    { icon: <Globe className="h-8 w-8" />, title: 'features.caldav', desc: 'features.caldav.d' },
    { icon: <Zap className="h-8 w-8" />, title: 'features.pay', desc: 'features.pay.d' },
    { icon: <Clock className="h-8 w-8" />, title: 'features.tz', desc: 'features.tz.d' },
    { icon: <Calendar className="h-8 w-8" />, title: 'features.embed', desc: 'features.embed.d' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">CalOpen</span>
            </div>
            <div className="flex items-center gap-4">
              <LangToggle />
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                {t('nav.login')}
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {t('nav.signup')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t('hero.title1')}<br />
            <span className="text-blue-600">{t('hero.title2')}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('hero.sub')}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              {t('nav.start')}
            </Link>
            <a
              href="https://github.com/flffkaos-pixel/calopen"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50"
            >
              {t('nav.github')}
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('features.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="text-blue-600 mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{t(f.title)}</h3>
                <p className="text-gray-600">{t(f.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('pricing.title')}</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <PricingCard
              name={t('pricing.free')}
              price="$0"
              period={t('pricing.forever')}
              features={['1 user', 'Unlimited event types', 'Google Calendar sync', 'Email notifications', 'PayPal payments']}
              cta={t('pricing.cta.start')}
              ctaLink="/auth/signup"
            />
            <PricingCard
              name={t('pricing.teams')}
              price="$12"
              period={t('pricing.perUser')}
              features={['Everything in Free', 'Team scheduling', 'Remove branding', 'Custom domain', 'Priority support']}
              cta={t('pricing.cta.trial')}
              ctaLink="/auth/signup?plan=teams"
              highlighted
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© 2026 CalOpen. Open source under MIT License.</p>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  ctaLink,
  highlighted,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-xl border-2 ${
        highlighted ? 'border-blue-600 shadow-lg' : 'border-gray-200'
      }`}
    >
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-600">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ctaLink}
        className={`block text-center py-3 rounded-lg font-semibold ${
          highlighted
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
