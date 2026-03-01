-- ============================================================
-- MARKETLY — Supabase Veritabanı Şeması (Sprint 1)
-- Supabase SQL Editor'a kopyala ve çalıştır
-- ============================================================

-- ─── UUID uzantısı ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. KULLANICI PROFİLLERİ ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT        UNIQUE NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  tier            TEXT        NOT NULL DEFAULT 'free',   -- free | pro | elite
  verified        BOOLEAN     NOT NULL DEFAULT FALSE,
  follower_count  INT         NOT NULL DEFAULT 0,
  following_count INT         NOT NULL DEFAULT 0,
  signal_accuracy FLOAT       DEFAULT 0,
  referral_code   TEXT        UNIQUE,
  marketcoin      INT         NOT NULL DEFAULT 0,
  streak_days     INT         NOT NULL DEFAULT 0,
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Yeni auth kullanıcısı → otomatik profil oluştur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    upper(substr(md5(random()::text), 1, 8))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── 2. VARLIK (ASSET) META DATA ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id           TEXT        PRIMARY KEY,   -- BTC, ETH, AAPL vs.
  symbol       TEXT        NOT NULL,
  name         TEXT        NOT NULL,
  category     TEXT        NOT NULL,      -- crypto | stocks | commodities | forex
  logo_url     TEXT,
  logo_letter  TEXT,
  logo_color   TEXT        DEFAULT '#9AA0AF',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. VARLIK ANLİK FİYAT ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_prices (
  asset_id       TEXT        PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
  price          FLOAT       NOT NULL DEFAULT 0,
  change_percent FLOAT       DEFAULT 0,
  volume         TEXT,
  market_cap     TEXT,
  spark          FLOAT[]     DEFAULT '{}',
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. TARİHSEL FİYAT ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_history (
  asset_id    TEXT        NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  date        DATE        NOT NULL,
  close_price FLOAT       NOT NULL,
  open_price  FLOAT,
  high_price  FLOAT,
  low_price   FLOAT,
  volume      BIGINT,
  PRIMARY KEY (asset_id, date)
);

-- ─── 5. TAKIP SİSTEMİ ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  follower_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Takip sayaçlarını otomatik güncelle
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET follower_count  = follower_count  + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    UPDATE profiles SET follower_count  = GREATEST(follower_count  - 1, 0) WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_follow_counts ON follows;
CREATE TRIGGER trg_follow_counts
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- ─── 6. SİNYALLER ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS signals (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id      TEXT        NOT NULL REFERENCES assets(id),
  direction     TEXT        NOT NULL,   -- BUY | SELL | HOLD
  confidence    INT         NOT NULL DEFAULT 3 CHECK (confidence BETWEEN 1 AND 5),
  entry_price   FLOAT,
  target_price  FLOAT,
  stop_loss     FLOAT,
  timeframe     TEXT        DEFAULT '1G',   -- 1S|4S|1G|1H|1A
  rationale     TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  copies_count  INT         NOT NULL DEFAULT 0,
  likes_count   INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at     TIMESTAMPTZ,
  result        TEXT                       -- WIN | LOSS | NEUTRAL (kapanınca)
);

-- ─── 7. İZLEME LİSTESİ (WATCHLIST) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlists (
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id   TEXT        NOT NULL REFERENCES assets(id)  ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, asset_id)
);

-- ─── 8. PORTFÖY ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id     TEXT        NOT NULL REFERENCES assets(id),
  quantity     FLOAT       NOT NULL,
  avg_cost     FLOAT       NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 9. FİYAT ALARMLARI ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_alerts (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id     TEXT        NOT NULL REFERENCES assets(id)  ON DELETE CASCADE,
  target_price FLOAT       NOT NULL,
  direction    TEXT        NOT NULL,     -- above | below
  triggered    BOOLEAN     NOT NULL DEFAULT FALSE,
  triggered_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 10. POSTLAR (Video/Short/Signal) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT        NOT NULL,  -- video | short | signal | live
  title           TEXT,
  description     TEXT,
  video_url       TEXT,
  thumbnail_url   TEXT,
  duration        INT,
  asset_tags      TEXT[]      DEFAULT '{}',
  likes_count     INT         NOT NULL DEFAULT 0,
  comments_count  INT         NOT NULL DEFAULT 0,
  views_count     INT         NOT NULL DEFAULT 0,
  shares_count    INT         NOT NULL DEFAULT 0,
  is_premium      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 11. YORUMLAR ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text        TEXT        NOT NULL,
  likes_count INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 12. BİLDİRİMLER ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL,   -- follow | like | signal_copy | price_alert | new_signal
  title      TEXT        NOT NULL,
  body       TEXT,
  data       JSONB       DEFAULT '{}',
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 13. ROW LEVEL SECURITY (RLS) ────────────────────────────────────────────
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists       ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;

-- Herkes profil okuyabilir, sadece kendin güncelleyebilirsin
CREATE POLICY "Profiller herkese açık" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Kendi profilini güncelle" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Watchlist: sadece kendin
CREATE POLICY "Watchlist sadece kendin" ON watchlists
  FOR ALL USING (auth.uid() = user_id);

-- Portfolio: sadece kendin
CREATE POLICY "Portfolio sadece kendin" ON portfolio_holdings
  FOR ALL USING (auth.uid() = user_id);

-- Fiyat alarmları: sadece kendin
CREATE POLICY "Alarmlar sadece kendin" ON price_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Bildirimler: sadece kendin
CREATE POLICY "Bildirimler sadece kendin" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Takip: okuma herkese, yazma yalnız kendin
CREATE POLICY "Follows okuma herkese" ON follows FOR SELECT USING (TRUE);
CREATE POLICY "Takip et sadece kendin" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Takibi bırak sadece kendin" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Asset ve fiyat tabloları: herkese okuma, yazma yalnız service key ile
CREATE POLICY "Assets herkese okuma" ON assets FOR SELECT USING (TRUE);
CREATE POLICY "Prices herkese okuma" ON asset_prices FOR SELECT USING (TRUE);
CREATE POLICY "History herkese okuma" ON price_history FOR SELECT USING (TRUE);

ALTER TABLE assets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_prices  ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- ─── 14. REALTIME AKTIF ET ───────────────────────────────────────────────────
-- Supabase Dashboard > Database > Replication > Tables sekmesinde
-- asset_prices tablosunu "Realtime" olarak işaretle
-- SQL ile:
ALTER PUBLICATION supabase_realtime ADD TABLE asset_prices;

-- ─── 15. İNDEKSLER ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_asset_prices_updated ON asset_prices (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_creator      ON signals (creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_asset        ON signals (asset_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_creator        ON posts (creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower     ON follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following    ON follows (following_id);
CREATE INDEX IF NOT EXISTS idx_price_history_asset  ON price_history (asset_id, date DESC);
