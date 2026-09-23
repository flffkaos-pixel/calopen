-- CalOpen Migration 003: default event type for new signups
-- Extends the signup trigger so every new host gets a working booking page.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    public.generate_username(NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Default Mon-Fri 09:00-17:00
  INSERT INTO public.availability (user_id, day_of_week, start_time, end_time, is_active)
  SELECT NEW.id, d, '09:00', '17:00', true
  FROM generate_series(1, 5) AS d
  WHERE NOT EXISTS (SELECT 1 FROM public.availability WHERE user_id = NEW.id);

  -- Default 30-min event so /book/<username> works immediately
  INSERT INTO public.event_types (user_id, title, slug, description, duration, price, currency, is_active)
  SELECT NEW.id, '30 Minute Meeting', '30min', 'A quick 30-minute meeting', 30, 0, 'usd', true
  WHERE NOT EXISTS (SELECT 1 FROM public.event_types WHERE user_id = NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill default event for existing users that have none
INSERT INTO public.event_types (user_id, title, slug, description, duration, price, currency, is_active)
SELECT u.id, '30 Minute Meeting', '30min', 'A quick 30-minute meeting', 30, 0, 'usd', true
FROM public.users u
WHERE NOT EXISTS (SELECT 1 FROM public.event_types e WHERE e.user_id = u.id);
