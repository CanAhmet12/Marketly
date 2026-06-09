-- Yakın arkadaşlar WEB (S6) — close_friends zaten ADD_TABLES.sql / FINAL_SQL.sql içinde.
-- Supabase SQL Editor'da yalnızca eksikse çalıştır.

CREATE TABLE IF NOT EXISTS close_friends (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_close_friends_user ON close_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_close_friends_friend ON close_friends(friend_id);

ALTER TABLE close_friends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User close friends gorebilir" ON close_friends;
CREATE POLICY "User close friends gorebilir"
  ON close_friends FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User close friend ekleyebilir/silebilir" ON close_friends;
CREATE POLICY "User close friend ekleyebilir/silebilir"
  ON close_friends FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
