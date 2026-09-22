# PayPal Integration Guide

This guide covers setting up PayPal for payments in CalOpen.

## Overview

CalOpen supports two PayPal payment types:

1. **Subscriptions** - Recurring monthly plans (Teams, Organizations)
2. **One-Time Payments** - Single booking payments

## Table of Contents

- [Prerequisites](#prerequisites)
- [PayPal Developer Account](#paypal-developer-account)
- [Create REST API App](#create-rest-api-app)
- [Sandbox Testing](#sandbox-testing)
- [Subscription Plans](#subscription-plans)
- [One-Time Payments](#one-time-payments)
- [Webhook Configuration](#webhook-configuration)
- [Production Setup](#production-setup)
- [Testing Checklist](#testing-checklist)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- PayPal Business account ([sign up](https://www.paypal.com/business))
- Access to PayPal Developer Dashboard

---

## PayPal Developer Account

### Create Account

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Click "Log In to Dashboard"
3. Use your PayPal Business account credentials
4. Complete developer registration if prompted

### Dashboard Overview

The Developer Dashboard provides:
- **My Apps & Credentials** - API credentials
- **Sandbox** - Test environment
- **Live** - Production environment

---

## Create REST API App

### Step 1: Create App

1. Log in to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)
2. Click **Apps & Credentials**
3. Click **Create App**
4. Enter app details:
   - **App Name:** `CalOpen`
   - **Sandbox:** Select this for testing
5. Click **Create App**

### Step 2: Get Credentials

After creation, you'll see:

| Credential | Description | Use |
|------------|-------------|-----|
| **Client ID** | Public identifier | Client-side |
| **Secret** | Private key | Server-side only |

Copy these values for your `.env` file:

```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AXxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=EXxxxxxxxxxxxxxxxxxxx
```

### Step 3: Enable Payment Features

1. In your app settings, go to **App Settings**
2. Enable:
   - **Accept Payments**
   - **Subscriptions**
   - **Advanced Checkout**

---

## Sandbox Testing

### Sandbox Accounts

PayPal provides test accounts:

1. Go to **Sandbox → Accounts**
2. Use the default test accounts or create new ones:
   - **Business Account** - Merchant (your app)
   - **Personal Account** - Buyer (test customers)

### Get Sandbox Credentials

1. Click on your sandbox business account
2. Go to **API Credentials**
3. Copy the **Client ID** and **Secret**

### Test Environment URL

```bash
# Sandbox API endpoint
https://api-m.sandbox.paypal.com

# Sandbox login
https://sandbox.paypal.com
```

---

## Subscription Plans

### Create Plans

1. Log in to [sandbox.paypal.com](https://sandbox.paypal.com)
2. Go to **Pay & Get Paid → Subscriptions**
3. Click **Create Plan**

#### Teams Plan

| Field | Value |
|-------|-------|
| Plan Name | CalOpen Teams |
| Description | Teams scheduling plan |
| Price | $12.00 |
| Billing Cycle | Monthly |
| Trial Period | 14 days (optional) |

#### Organizations Plan

| Field | Value |
|-------|-------|
| Plan Name | CalOpen Organizations |
| Description | Organizations scheduling plan |
| Price | $28.00 |
| Billing Cycle | Monthly |
| Trial Period | 14 days (optional) |

### Get Plan IDs

After creating plans, copy the Plan IDs:

```bash
PAYPAL_TEAMS_PLAN_ID=P-XXXXXXXXXXXXXXXXXXXXXXXX
PAYPAL_ORGS_PLAN_ID=P-XXXXXXXXXXXXXXXXXXXXXXXX
```

### Plan Configuration in Code

Plans are defined in `src/lib/paypal.ts`:

```typescript
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
};
```

---

## One-Time Payments

### Configure for Bookings

For paid bookings, CalOpen uses PayPal's Order API:

```typescript
// Client-side: Create order
const order = await actions.order.create({
  purchase_units: [
    {
      description: '30 Minute Meeting',
      amount: {
        value: '50.00', // Amount in dollars
      },
      custom_id: userId,
    },
  ],
});

// Server-side: Confirm payment
POST /api/paypal/confirm-payment
{
  "orderId": "XXXXXXXXX",
  "userId": "user-uuid",
  "itemId": "booking-uuid"
}
```

---

## Webhook Configuration

### Why Webhooks?

Webhooks ensure your app stays in sync with PayPal events, even if the user closes their browser.

### Configure Webhooks

1. Go to **Apps & Credentials → Your App**
2. Scroll to **Webhooks**
3. Click **Add Webhook**

#### Sandbox Webhooks

| Event | URL |
|-------|-----|
| `BILLING.SUBSCRIPTION.CREATED` | `https://your-domain.com/api/webhooks/paypal` |
| `BILLING.SUBSCRIPTION.UPDATED` | `https://your-domain.com/api/webhooks/paypal` |
| `BILLING.SUBSCRIPTION.CANCELLED` | `https://your-domain.com/api/webhooks/paypal` |
| `PAYMENT.CAPTURE.COMPLETED` | `https://your-domain.com/api/webhooks/paypal` |

### Webhook Verification

In production, verify webhook signatures:

```typescript
import { verifyWebhookSignature } from '@paypal/paypal-server-sdk';

export async function POST(request: Request) {
  const body = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  const verification = await verifyWebhookSignature(
    {
      body,
      headers,
    },
    process.env.PAYPAL_WEBHOOK_ID!,
    process.env.PAYPAL_CLIENT_SECRET!
  );

  if (verification.verificationStatus !== 'SUCCESS') {
    return new Response('Invalid signature', { status: 400 });
  }

  // Process webhook event
  const event = JSON.parse(body);
  // ...
}
```

---

## Production Setup

### Step 1: Switch to Live Mode

1. In Developer Dashboard, toggle to **Live**
2. Create a new app or copy sandbox credentials
3. Update environment variables:

```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-secret
```

### Step 2: Create Live Plans

1. Log in to [paypal.com](https://www.paypal.com)
2. Create subscription plans (same process as sandbox)
3. Update plan IDs:

```bash
PAYPAL_TEAMS_PLAN_ID=P-XXXXXXXXXXXXXXXXXXXXXXXX
PAYPAL_ORGS_PLAN_ID=P-XXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 3: Configure Live Webhooks

1. Add webhooks with production URL
2. Copy Webhook ID for verification
3. Add to environment:

```bash
PAYPAL_WEBHOOK_ID=your-webhook-id
```

### Step 4: Test in Production

1. Complete a real transaction
2. Verify in PayPal dashboard
3. Check application logs

---

## Testing Checklist

### Sandbox Testing

- [ ] Created sandbox app
- [ ] Got Client ID and Secret
- [ ] Created Teams subscription plan
- [ ] Created Organizations subscription plan
- [ ] Configured webhooks
- [ ] Test subscription creation
- [ ] Test subscription cancellation
- [ ] Test one-time payment
- [ ] Verify emails are sent
- [ ] Test error handling

### Production Readiness

- [ ] Switched to Live mode
- [ ] Updated all environment variables
- [ ] Created live subscription plans
- [ ] Configured production webhooks
- [ ] Tested with real payment method
- [ ] Verified webhook signatures
- [ ] Set up monitoring/alerts

---

## Troubleshooting

### Common Issues

#### "Client ID not found"

```bash
# Cause: Wrong environment or incorrect Client ID
# Solution: Ensure you're using the correct environment
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AXxxx...  # Not sandbox in production
```

#### "Subscription plan not found"

```bash
# Cause: Plan ID is from sandbox, not production
# Solution: Create plans in the correct environment
```

#### "Webhook not received"

```bash
# Cause: URL misconfigured or SSL issue
# Solution:
# 1. Check webhook URL is accessible
# 2. Verify SSL certificate
# 3. Check PayPal webhook logs in dashboard
```

#### "Payment capture failed"

```bash
# Cause: Insufficient funds or card declined
# Solution: Check test account balance in sandbox
```

### Debug Mode

Enable PayPal debug logging:

```bash
# Add to .env
PAYPAL_DEBUG=true
```

Check logs:

```bash
docker compose logs app | grep -i paypal
```

### Sandbox Test Cards

| Card Number | Result |
|-------------|--------|
| 4032039007654576 | Success |
| 4000000000000002 | Declined |
| 4000000000009995 | Insufficient funds |

---

## API Reference

### PayPal Client Configuration

```typescript
import { PayPalScriptOptions } from '@paypal/react-paypal-js';

export const paypalScriptOptions: PayPalScriptOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: 'USD',
  intent: 'subscription',
  vault: true,
};
```

### Subscription Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   PayPal    │────▶│   Server    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
      │  1. Create         │                    │
      │  Subscription      │                    │
      │───────────────────▶│                    │
      │                    │                    │
      │  2. Approval       │                    │
      │  URL               │                    │
      │◀───────────────────│                    │
      │                    │                    │
      │  3. User           │                    │
      │  Approves          │                    │
      │───────────────────▶│                    │
      │                    │                    │
      │  4. Subscription   │                    │
      │  ID                │                    │
      │◀───────────────────│                    │
      │                    │                    │
      │  5. Confirm        │                    │
      │  Subscription      │                    │
      │───────────────────────────────────────▶│
      │                    │                    │
      │  6. Success        │                    │
      │◀───────────────────────────────────────│
```

### One-Time Payment Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   PayPal    │────▶│   Server    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
      │  1. Create         │                    │
      │  Order             │                    │
      │───────────────────▶│                    │
      │                    │                    │
      │  2. Order ID       │                    │
      │◀───────────────────│                    │
      │                    │                    │
      │  3. User           │                    │
      │  Pays              │                    │
      │───────────────────▶│                    │
      │                    │                    │
      │  4. Capture        │                    │
      │◀───────────────────│                    │
      │                    │                    │
      │  5. Confirm        │                    │
      │  Payment           │                    │
      │───────────────────────────────────────▶│
      │                    │                    │
      │  6. Success        │                    │
      │◀───────────────────────────────────────│
```

---

## Resources

- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal Subscriptions Guide](https://developer.paypal.com/docs/subscriptions/)
- [PayPal Webhooks](https://developer.paypal.com/api/rest/webhooks/)
- [Sandbox Testing Guide](https://developer.paypal.com/tools/sandbox/)

---

## Next Steps

- [Set up Supabase](supabase-setup.md)
- [Configure email notifications](../README.md#environment-variables)
- [Deploy to production](self-hosting.md)
