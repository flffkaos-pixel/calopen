import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const planEnum = pgEnum('plan', ['free', 'teams', 'organizations', 'enterprise']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed']);
export const calendarProviderEnum = pgEnum('calendar_provider', ['google', 'outlook', 'caldav']);

// Users table (extends Supabase auth.users)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
  weekStart: integer('week_start').default(1).notNull(), // 0=Sunday, 1=Monday
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  plan: planEnum('plan').default('free').notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Organization members
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 50 }).default('member').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Event types
export const eventTypes = pgTable('event_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  description: text('description'),
  duration: integer('duration').notNull(), // minutes
  price: integer('price').default(0), // cents
  currency: varchar('currency', { length: 3 }).default('usd'),
  isActive: boolean('is_active').default(true).notNull(),
  requiresConfirmation: boolean('requires_confirmation').default(false),
  locationType: varchar('location_type', { length: 50 }).default('in_person'), // in_person, video_call, phone
  locationLink: text('location_link'),
  bufferBefore: integer('buffer_before').default(0), // minutes
  bufferAfter: integer('buffer_after').default(0), // minutes
  maxBookingsPerDay: integer('max_bookings_per_day'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Availability schedule
export const availability = pgTable('availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar('start_time', { length: 5 }).notNull(), // "09:00"
  endTime: varchar('end_time', { length: 5 }).notNull(), // "17:00"
  isActive: boolean('is_active').default(true).notNull(),
});

// Date overrides (holidays, time off)
export const dateOverrides = pgTable('date_overrides', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  date: varchar('date', { length: 10 }).notNull(), // "2024-12-25"
  startTime: varchar('start_time', { length: 5 }), // null = blocked all day
  endTime: varchar('end_time', { length: 5 }),
  reason: varchar('reason', { length: 255 }),
});

// Bookings
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventTypeId: uuid('event_type_id').references(() => eventTypes.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  bookerEmail: varchar('booker_email', { length: 255 }).notNull(),
  bookerName: varchar('booker_name', { length: 255 }),
  bookerPhone: varchar('booker_phone', { length: 50 }),
  bookerNotes: text('booker_notes'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: bookingStatusEnum('status').default('pending').notNull(),
  paymentId: varchar('payment_id', { length: 255 }),
  paymentAmount: integer('payment_amount'), // cents
  meetingLink: text('meeting_link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Calendar connections
export const calendars = pgTable('calendars', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  provider: calendarProviderEnum('provider').notNull(),
  providerCalendarId: varchar('provider_calendar_id', { length: 255 }),
  accessToken: text('access_token'), // encrypted
  refreshToken: text('refresh_token'), // encrypted
  syncToken: text('sync_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Audit logs (HIPAA requirement)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  organizationId: uuid('organization_id').references(() => organizations.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
