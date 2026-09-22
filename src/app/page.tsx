import Link from 'next/link';
import { Calendar, Shield, Clock, Zap, Code, Globe } from 'lucide-react';

export default function LandingPage() {
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
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Open Source Scheduling<br />
            <span className="text-blue-600">for Regulated Businesses</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            HIPAA-ready, self-hosted, CalDAV-native. The scheduling platform that respects your data.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              Start Free
            </Link>
            <a
              href="https://github.com/calopen/calopen"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why CalOpen?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="HIPAA Ready"
              description="Audit logs, encryption at rest, access controls. Built for healthcare from day one."
            />
            <FeatureCard
              icon={<Code className="h-8 w-8" />}
              title="Self-Hosted"
              description="One Docker command. Your data stays on your servers. No vendor lock-in."
            />
            <FeatureCard
              icon={<Globe className="h-8 w-8" />}
              title="CalDAV Native"
              description="Works with Nextcloud, Fastmail, iCloud. True calendar portability."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Stripe Payments"
              description="Collect payments for appointments. Support for subscriptions and one-time payments."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="Timezone Smart"
              description="Automatic timezone detection. Perfect for remote teams and global clients."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Embeddable"
              description="Add booking to your site with a single script tag. Customizable widgets."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              name="Free"
              price="$0"
              period="forever"
              features={['1 user', 'Unlimited event types', 'Google Calendar sync', 'Email notifications', 'Stripe payments']}
              cta="Get Started"
              ctaLink="/auth/signup"
            />
            <PricingCard
              name="Teams"
              price="$12"
              period="/user/month"
              features={['Everything in Free', 'Team scheduling', 'Remove branding', 'Custom domain', 'Priority support']}
              cta="Start Trial"
              ctaLink="/auth/signup?plan=teams"
              highlighted
            />
            <PricingCard
              name="Organizations"
              price="$28"
              period="/user/month"
              features={['Everything in Teams', 'SAML SSO', 'Audit logs', 'SOC 2/HIPAA', 'Dedicated database']}
              cta="Contact Sales"
              ctaLink="/contact"
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
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
