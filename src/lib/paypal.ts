import { ReactPayPalScriptOptions } from '@paypal/react-paypal-js';

export const paypalScriptOptions: ReactPayPalScriptOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: 'USD',
  intent: 'subscription',
  vault: true,
};

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['1 user', 'Unlimited event types', 'Google Calendar sync', 'Email notifications'],
  },
  teams: {
    name: 'Teams',
    price: 12, // $12/user/month
    paypalPlanId: process.env.PAYPAL_TEAMS_PLAN_ID,
    features: ['Everything in Free', 'Team scheduling', 'Remove branding', 'Custom domain'],
  },
  organizations: {
    name: 'Organizations',
    price: 28, // $28/user/month
    paypalPlanId: process.env.PAYPAL_ORGS_PLAN_ID,
    features: ['Everything in Teams', 'SAML SSO', 'Audit logs', 'SOC 2/HIPAA compliance'],
  },
} as const;

export type Plan = keyof typeof PLANS;
