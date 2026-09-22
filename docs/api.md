# CalOpen API Documentation

## Overview

CalOpen provides a REST API for managing scheduling, bookings, and payments. All endpoints return JSON responses.

**Base URL:** `http://localhost:3000/api` (development) or `https://your-domain.com/api` (production)

## Authentication

Most API endpoints require authentication via Supabase Auth. Include the session token in requests:

```
Authorization: Bearer <supabase-access-token>
```

Public endpoints (like booking creation) do not require authentication.

---

## Endpoints

### Health Check

```
GET /api/health
```

Returns the application status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-09-22T12:00:00.000Z",
  "version": "0.1.0"
}
```

---

### Availability

#### Get Availability

```
GET /api/availability?userId={userId}&date={date}
```

Fetch a user's availability schedule.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User ID to fetch availability for |
| `date` | string | No | Specific date in `YYYY-MM-DD` format |

**Response:**

```json
{
  "schedule": [
    {
      "id": "uuid",
      "userId": "uuid",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isActive": true
    }
  ],
  "overrides": [
    {
      "id": "uuid",
      "userId": "uuid",
      "date": "2026-12-25",
      "startTime": null,
      "endTime": null,
      "reason": "Christmas Day"
    }
  ]
}
```

**Example:**

```bash
curl "http://localhost:3000/api/availability?userId=abc123&date=2026-09-22"
```

#### Update Availability

```
PUT /api/availability
```

Replace a user's entire availability schedule.

**Request Body:**

```json
{
  "userId": "uuid",
  "schedule": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "enabled": true
    },
    {
      "dayOfWeek": 2,
      "startTime": "09:00",
      "endTime": "17:00",
      "enabled": true
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "availability": [
    {
      "id": "uuid",
      "userId": "uuid",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isActive": true
    }
  ]
}
```

**Example:**

```bash
curl -X PUT http://localhost:3000/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "abc123",
    "schedule": [
      {"dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "enabled": true},
      {"dayOfWeek": 3, "startTime": "10:00", "endTime": "16:00", "enabled": true}
    ]
  }'
```

---

### Bookings

#### List Bookings

```
GET /api/bookings?userId={userId}&status={status}
```

Fetch all bookings for a user.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User ID to fetch bookings for |
| `status` | string | No | Filter by status: `pending`, `confirmed`, `cancelled`, `completed` |

**Response:**

```json
{
  "bookings": [
    {
      "id": "uuid",
      "eventTypeId": "uuid",
      "userId": "uuid",
      "bookerEmail": "client@example.com",
      "bookerName": "John Doe",
      "bookerNotes": "Looking forward to the meeting",
      "startTime": "2026-09-23T14:00:00.000Z",
      "endTime": "2026-09-23T14:30:00.000Z",
      "status": "confirmed",
      "paymentId": "paypal-order-123",
      "paymentAmount": 5000,
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "createdAt": "2026-09-22T10:00:00.000Z"
    }
  ]
}
```

#### Create Booking

```
POST /api/bookings
```

Create a new booking. This is a public endpoint (no authentication required).

**Request Body:**

```json
{
  "eventTypeId": "uuid",
  "bookerEmail": "client@example.com",
  "bookerName": "John Doe",
  "bookerNotes": "Looking forward to the meeting",
  "startTime": "2026-09-23T14:00:00.000Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventTypeId` | string | Yes | ID of the event type being booked |
| `bookerEmail` | string | Yes | Booker's email address |
| `bookerName` | string | Yes | Booker's full name |
| `bookerNotes` | string | No | Additional notes from the booker |
| `startTime` | string | Yes | ISO 8601 timestamp for the booking start |

**Response:**

```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "eventTypeId": "uuid",
    "userId": "uuid",
    "bookerEmail": "client@example.com",
    "bookerName": "John Doe",
    "startTime": "2026-09-23T14:00:00.000Z",
    "endTime": "2026-09-23T14:30:00.000Z",
    "status": "confirmed",
    "createdAt": "2026-09-22T12:00:00.000Z"
  }
}
```

**Error Responses:**

```json
// Missing required fields
{
  "error": "Missing required fields"
}
// Status: 400

// Event type not found
{
  "error": "Event type not found"
}
// Status: 404

// Time slot conflict
{
  "error": "Time slot is no longer available"
}
// Status: 409
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "eventTypeId": "evt_123",
    "bookerEmail": "client@example.com",
    "bookerName": "John Doe",
    "startTime": "2026-09-23T14:00:00.000Z"
  }'
```

---

### PayPal Integration

#### Confirm Subscription

```
POST /api/paypal/confirm
```

Confirm a PayPal subscription after client-side approval.

**Request Body:**

```json
{
  "subscriptionId": "I-XXXXXXXXX",
  "userId": "uuid"
}
```

**Response:**

```json
{
  "success": true,
  "subscriptionId": "I-XXXXXXXXX"
}
```

#### Confirm One-Time Payment

```
POST /api/paypal/confirm-payment
```

Confirm a PayPal one-time payment after capture.

**Request Body:**

```json
{
  "orderId": "XXXXXXXXX",
  "userId": "uuid",
  "itemId": "booking-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "orderId": "XXXXXXXXX"
}
```

---

### Stripe Webhooks

```
POST /api/webhooks/stripe
```

Handle Stripe webhook events. Requires Stripe signature verification.

**Handled Events:**

| Event | Description |
|-------|-------------|
| `checkout.session.completed` | Subscription checkout completed |
| `customer.subscription.updated` | Subscription modified |
| `customer.subscription.deleted` | Subscription cancelled |
| `invoice.payment_failed` | Payment failed |

---

## Data Models

### User

```typescript
{
  id: string;           // UUID, primary key
  email: string;        // Unique email address
  name: string;         // Display name
  avatarUrl: string;    // Profile image URL
  timezone: string;     // IANA timezone (default: "UTC")
  weekStart: number;    // 0=Sunday, 1=Monday (default: 1)
  createdAt: Date;
  updatedAt: Date;
}
```

### Organization

```typescript
{
  id: string;           // UUID, primary key
  name: string;         // Organization name
  slug: string;         // URL-friendly identifier
  plan: 'free' | 'teams' | 'organizations' | 'enterprise';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### EventType

```typescript
{
  id: string;           // UUID, primary key
  userId: string;       // Owner's user ID
  organizationId: string; // Optional organization
  title: string;        // Event name
  slug: string;         // URL-friendly identifier
  description: string;  // Event description
  duration: number;     // Duration in minutes
  price: number;        // Price in cents (0 = free)
  currency: string;     // ISO 4217 currency code
  isActive: boolean;    // Whether event is bookable
  requiresConfirmation: boolean; // Manual approval required
  locationType: string; // "in_person" | "video_call" | "phone"
  locationLink: string; // Meeting URL or address
  bufferBefore: number; // Buffer time before (minutes)
  bufferAfter: number;  // Buffer time after (minutes)
  maxBookingsPerDay: number; // Daily booking limit
  createdAt: Date;
  updatedAt: Date;
}
```

### Booking

```typescript
{
  id: string;           // UUID, primary key
  eventTypeId: string;  // Event type ID
  userId: string;       // Host's user ID
  bookerEmail: string;  // Booker's email
  bookerName: string;   // Booker's name
  bookerPhone: string;  // Booker's phone
  bookerNotes: string;  // Additional notes
  startTime: Date;      // Booking start time
  endTime: Date;        // Booking end time
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentId: string;    // PayPal/Stripe payment ID
  paymentAmount: number; // Amount in cents
  meetingLink: string;  // Video call URL
  createdAt: Date;
  updatedAt: Date;
}
```

### Availability

```typescript
{
  id: string;           // UUID, primary key
  userId: string;       // User ID
  dayOfWeek: number;    // 0-6 (Sunday-Saturday)
  startTime: string;    // "HH:MM" format
  endTime: string;      // "HH:MM" format
  isActive: boolean;    // Whether this slot is active
}
```

### DateOverride

```typescript
{
  id: string;           // UUID, primary key
  userId: string;       // User ID
  date: string;         // "YYYY-MM-DD" format
  startTime: string;    // "HH:MM" or null (all day block)
  endTime: string;      // "HH:MM" or null
  reason: string;       // Override reason
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource conflict (e.g., time slot taken) |
| 500 | Internal Server Error |

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 1000 requests per minute per user

---

## Webhooks

### PayPal Webhooks

For production, configure PayPal webhooks for:

- `BILLING.SUBSCRIPTION.CREATED`
- `BILLING.SUBSCRIPTION.UPDATED`
- `BILLING.SUBSCRIPTION.CANCELLED`
- `PAYMENT.CAPTURE.COMPLETED`

### Stripe Webhooks

Configure Stripe webhooks for:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Fetch availability
const response = await fetch('/api/availability?userId=user-123');
const { schedule, overrides } = await response.json();

// Create a booking
const booking = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventTypeId: 'evt-123',
    bookerEmail: 'client@example.com',
    bookerName: 'John Doe',
    startTime: '2026-09-23T14:00:00.000Z',
  }),
});
```

### cURL

```bash
# Get availability
curl "http://localhost:3000/api/availability?userId=user-123"

# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "eventTypeId": "evt-123",
    "bookerEmail": "client@example.com",
    "bookerName": "John Doe",
    "startTime": "2026-09-23T14:00:00.000Z"
  }'
```

---

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for version history.
