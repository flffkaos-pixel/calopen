'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { paypalScriptOptions } from '@/lib/paypal';
import { LanguageProvider } from '@/lib/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PayPalScriptProvider options={paypalScriptOptions}>
        {children}
      </PayPalScriptProvider>
    </LanguageProvider>
  );
}
