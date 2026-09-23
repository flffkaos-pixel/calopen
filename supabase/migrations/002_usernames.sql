-- CalOpen Migration 002: username + auto-provisioning for new signups
-- 1) username column
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;

-- 2) username generator (email prefix -> slug, with dedup suffix)
CREATE OR REPLACE FUNCTION public.generate_username(base_email TEXT)
RETURNS TEXT AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  n INTEGER := 0;
BEGIN
  base := lower(regexp_replace(split_part(base_email, '@', 1), '[^a-z0-9]+', '-', 'g'));
  base := regexp_replace(base, '(^-+|-+$)', '', 'g');
  IF base = '' THEN base := 'user'; END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = candidate) LOOP
    n := n + 1;
    candidate := base || '-' || n;
  END LOOP;
  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

-- 3) backfill existing auth users
INSERT INTO public.users (id, email, name, username)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  public.generate_username(au.email)
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  username = COALESCE(public.users.username, EXCLUDED.username);

-- 4) auto-create public profile + default availability on signup
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

  -- Default Mon-Fri 09:00-17:00 so booking pages work out of the box
  INSERT INTO public.availability (user_id, day_of_week, start_time, end_time, is_active)
  SELECT NEW.id, d, '09:00', '17:00', true
  FROM generate_series(1, 5) AS d
  WHERE NOT EXISTS (SELECT 1 FROM public.availability WHERE user_id = NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
