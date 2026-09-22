'use client';

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useState } from 'react';
import { toast } from 'sonner';

interface PayPalCheckoutProps {
  planId: string;
  userId: string;
  onSuccess?: () => void;
}

export function PayPalCheckout({ planId, userId, onSuccess }: PayPalCheckoutProps) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [loading, setLoading] = useState(false);

  if (isPending) {
    return <div className="text-center py-4">Loading PayPal...</div>;
  }

  return (
    <PayPalButtons
      style={{
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'subscribe',
      }}
      createSubscription={async (data, actions) => {
        return actions.subscription.create({
          plan_id: planId,
          custom_id: userId,
        });
      }}
      onApprove={async (data, actions) => {
        setLoading(true);
        try {
          // Confirm subscription on server
          const response = await fetch('/api/paypal/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscriptionId: data.subscriptionID,
              userId,
            }),
          });

          if (!response.ok) throw new Error('Failed to confirm subscription');

          toast.success('Subscription activated!');
          onSuccess?.();
        } catch (error) {
          toast.error('Failed to activate subscription');
        } finally {
          setLoading(false);
        }
      }}
      onError={(err) => {
        console.error('PayPal error:', err);
        toast.error('Payment failed. Please try again.');
      }}
      onCancel={() => {
        toast.info('Payment cancelled');
      }}
    />
  );
}

interface PayPalOneTimeProps {
  amount: number;
  itemId: string;
  itemName: string;
  userId: string;
  onSuccess?: () => void;
}

export function PayPalOneTime({ amount, itemId, itemName, userId, onSuccess }: PayPalOneTimeProps) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [loading, setLoading] = useState(false);

  if (isPending) {
    return <div className="text-center py-4">Loading PayPal...</div>;
  }

  return (
    <PayPalButtons
      style={{
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay',
      }}
      createOrder={async (data, actions) => {
        return actions.order!.create({
          intent: 'CAPTURE',
          purchase_units: [
            {
              description: itemName,
              amount: {
                currency_code: 'USD',
                value: amount.toFixed(2),
              },
              custom_id: userId,
            },
          ],
        });
      }}
      onApprove={async (data, actions) => {
        setLoading(true);
        try {
          const details = await actions.order!.capture();
          
          // Confirm payment on server
          const response = await fetch('/api/paypal/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderID,
              userId,
              itemId,
            }),
          });

          if (!response.ok) throw new Error('Failed to confirm payment');

          toast.success(`Payment completed! Thank you, ${details.payer?.name?.given_name}`);
          onSuccess?.();
        } catch (error) {
          toast.error('Payment confirmation failed');
        } finally {
          setLoading(false);
        }
      }}
      onError={(err) => {
        console.error('PayPal error:', err);
        toast.error('Payment failed. Please try again.');
      }}
    />
  );
}
