-- Abonelikler WEB (S6) — analyst_subscriptions zaten ADD_TABLES.sql / FINAL_SQL.sql içinde.
-- Supabase SQL Editor'da yalnızca eksikse çalıştır.

CREATE TABLE IF NOT EXISTS analyst_subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analyst_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analyst_name  TEXT,
  tier          TEXT DEFAULT 'free',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, analyst_id)
);

ALTER TABLE analyst_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kullanıcı kendi aboneliklerini yönetir" ON analyst_subscriptions;
CREATE POLICY "Kullanıcı kendi aboneliklerini yönetir"
  ON analyst_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION increment_subscriber_count(profile_id UUID)
RETURNS VOID AS $$
  UPDATE profiles SET subscriber_count = COALESCE(subscriber_count, 0) + 1 WHERE id = profile_id;
$$ LANGUAGE sql SECURITY DEFINER;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscriber_count  INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_price NUMERIC DEFAULT 0;
