-- CalOpen Database Migration
-- Run this SQL to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE plan AS ENUM ('free', 'teams', 'organizations', 'enterprise');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE calendar_provider AS ENUM ('google', 'outlook', 'caldav');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
  week_start INTEGER DEFAULT 1 NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  plan plan DEFAULT 'free' NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Organization members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(50) DEFAULT 'member' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(organization_id, user_id)
);

-- Event types
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'usd',
  is_active BOOLEAN DEFAULT true NOT NULL,
  requires_confirmation BOOLEAN DEFAULT false,
  location_type VARCHAR(50) DEFAULT 'in_person',
  location_link TEXT,
  buffer_before INTEGER DEFAULT 0,
  buffer_after INTEGER DEFAULT 0,
  max_bookings_per_day INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, slug)
);

-- Availability schedule
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Date overrides (holidays, time off)
CREATE TABLE date_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date VARCHAR(10) NOT NULL,
  start_time VARCHAR(5),
  end_time VARCHAR(5),
  reason VARCHAR(255)
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  booker_email VARCHAR(255) NOT NULL,
  booker_name VARCHAR(255),
  booker_phone VARCHAR(50),
  booker_notes TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status booking_status DEFAULT 'pending' NOT NULL,
  payment_id VARCHAR(255),
  payment_amount INTEGER,
  meeting_link TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Calendar connections
CREATE TABLE calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider calendar_provider NOT NULL,
  provider_calendar_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  sync_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Audit logs (HIPAA requirement)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_event_types_user_id ON event_types(user_id);
CREATE INDEX idx_availability_user_id ON availability(user_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_event_type_id ON bookings(event_type_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_calendars_user_id ON calendars(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own data
CREATE POLICY users_self_policy ON users
  FOR ALL USING (id = auth.uid());

-- Event types - users can manage their own
CREATE POLICY event_types_self_policy ON event_types
  FOR ALL USING (user_id = auth.uid());

-- Availability - users can manage their own
CREATE POLICY availability_self_policy ON availability
  FOR ALL USING (user_id = auth.uid());

-- Date overrides - users can manage their own
CREATE POLICY date_overrides_self_policy ON date_overrides
  FOR ALL USING (user_id = auth.uid());

-- Bookings - users can read bookings for their event types
CREATE POLICY bookings_read_policy ON bookings
  FOR SELECT USING (
    user_id = auth.uid() OR
    event_type_id IN (SELECT id FROM event_types WHERE user_id = auth.uid())
  );

-- Bookings - anyone can create (public booking)
CREATE POLICY bookings_insert_policy ON bookings
  FOR INSERT WITH CHECK (true);

-- Calendars - users can manage their own
CREATE POLICY calendars_self_policy ON calendars
  FOR ALL USING (user_id = auth.uid());

-- Organizations - members can read
CREATE POLICY organizations_member_policy ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

-- Organization members - members can read
CREATE POLICY organization_members_self_policy ON organization_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

-- Audit logs - org members can read
CREATE POLICY audit_logs_member_policy ON audit_logs
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()) OR
    user_id = auth.uid()
  );
