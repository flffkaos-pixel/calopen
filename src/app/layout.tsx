import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://calopen.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'CalOpen - Open Source Scheduling for Regulated Businesses',
    template: '%s | CalOpen',
  },
  description:
    'HIPAA-ready, self-hosted, open source appointment scheduling. CalDAV-native online booking with PayPal payments. Free for 1 user.',
  keywords: [
    'appointment scheduling',
    'online booking',
    'open source scheduling',
    'Cal.com alternative',
    'Calendly alternative',
    'HIPAA scheduling',
    'self-hosted booking',
  ],
  authors: [{ name: 'CalOpen' }],
  creator: 'CalOpen',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'CalOpen',
    title: 'CalOpen - Open Source Scheduling for Regulated Businesses',
    description:
      'HIPAA-ready, self-hosted appointment scheduling with PayPal payments. Free to start.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalOpen - Open Source Scheduling',
    description: 'HIPAA-ready, self-hosted appointment scheduling. Free to start.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
};

const SOFTWARE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CalOpen',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Open source, HIPAA-ready appointment scheduling with online booking and PayPal payments.',
  isAccessibleForFree: true,
  license: 'https://opensource.org/licenses/MIT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSON_LD) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
