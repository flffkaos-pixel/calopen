'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { paypalScriptOptions } from '@/lib/paypal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={paypalScriptOptions}>
      {children}
    </PayPalScriptProvider>
  );
}
