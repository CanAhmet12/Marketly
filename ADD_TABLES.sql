-- ============================================================
-- Marketly — Yeni tablolar (Supabase SQL Editor'da çalıştır)
-- Her çalıştırmada güvenli: DROP IF EXISTS + CREATE IF NOT EXISTS
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- ÖNCE MEVCUT TABLOLARA EKSİK SÜTUNLARI EKLE (ALTER TABLE)
-- Bu blok tablolar zaten varsa bile güvenle çalışır.
-- ═══════════════════════════════════════════════════════════════

-- price_alerts: eksik sütunlar (eski şemada yoksa ekle)
ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS is_active    BOOLEAN     DEFAULT true;
ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS triggered_at TIMESTAMPTZ;
ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS symbol       TEXT;
ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS target_price FLOAT;
ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS condition    TEXT DEFAULT 'above';

-- Eski "triggered" boolean'ı is_active'e senkronize et
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='price_alerts' AND column_name='triggered') THEN
    UPDATE price_alerts SET is_active = NOT triggered WHERE is_active IS NULL;
  END IF;
  -- is_active hâlâ null olanları true yap
  UPDATE price_alerts SET is_active = true WHERE is_active IS NULL;
END $$;
-- Eski "direction" sütununu condition olarak kopyala (varsa)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='price_alerts' AND column_name='direction') THEN
    UPDATE price_alerts SET condition = direction WHERE condition IS NULL OR condition = 'above';
  END IF;
END $$;

-- posts: video/sinyal için ek sütunlar
ALTER TABLE posts ADD COLUMN IF NOT EXISTS type           TEXT DEFAULT 'post';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title          TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS description    TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS thumbnail_url  TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url      TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS duration       INT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS asset_tags     TEXT[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count    INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count    INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares_count   INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_premium     BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS creator_id     UUID REFERENCES auth.users(id);

-- Mevcut user_id'den creator_id'yi doldur (boşsa)
UPDATE posts SET creator_id = user_id WHERE creator_id IS NULL;

-- portfolio_holdings: eksik sütunlar
ALTER TABLE portfolio_holdings ADD COLUMN IF NOT EXISTS symbol TEXT;
ALTER TABLE portfolio_holdings ADD COLUMN IF NOT EXISTS name   TEXT;
ALTER TABLE portfolio_holdings ADD COLUMN IF NOT EXISTS notes  TEXT;

-- profiles: eksik sütunlar
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token      TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login      TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_days     INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signal_accuracy FLOAT DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════

-- ── portfolio_holdings ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id     TEXT    NOT NULL,
  quantity     NUMERIC NOT NULL CHECK (quantity > 0),
  avg_cost     NUMERIC NOT NULL CHECK (avg_cost > 0),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User kendi holdings'ini yönetebilir" ON portfolio_holdings;
CREATE POLICY "User kendi holdings'ini yönetebilir"
  ON portfolio_holdings FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── price_alerts (tablo yoksa oluştur, varsa ALTER TABLE ile güncellendi) ────
CREATE TABLE IF NOT EXISTS price_alerts (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id     TEXT    NOT NULL,
  symbol       TEXT,
  condition    TEXT    DEFAULT 'above',
  direction    TEXT    DEFAULT 'above',
  target_price NUMERIC,
  target       NUMERIC,
  is_active    BOOLEAN DEFAULT true,
  triggered    BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User kendi alarmlarını yönetebilir" ON price_alerts;
CREATE POLICY "User kendi alarmlarını yönetebilir"
  ON price_alerts FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── follows ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  follower_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kullanıcılar takip edebilir" ON follows;
CREATE POLICY "Kullanıcılar takip edebilir"
  ON follows FOR ALL
  USING  (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- ── posts ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  asset_tag  TEXT,
  image_url  TEXT,
  likes      INT  DEFAULT 0,
  comments   INT  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes post'ları okuyabilir"     ON posts;
DROP POLICY IF EXISTS "User kendi post'larını yönetebilir" ON posts;
DROP POLICY IF EXISTS "User kendi post'larını silebilir"   ON posts;

CREATE POLICY "Herkes post'ları okuyabilir"
  ON posts FOR SELECT USING (true);
CREATE POLICY "User kendi post'larını yönetebilir"
  ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User kendi post'larını silebilir"
  ON posts FOR DELETE USING (auth.uid() = user_id);

-- ── notifications ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT    NOT NULL DEFAULT 'system',
  title      TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  read       BOOLEAN DEFAULT false,
  meta       JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User kendi bildirimlerini yönetebilir" ON notifications;
CREATE POLICY "User kendi bildirimlerini yönetebilir"
  ON notifications FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── marketcoin_wallet ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketcoin_wallet (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE marketcoin_wallet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User kendi cüzdanını yönetebilir" ON marketcoin_wallet;
CREATE POLICY "User kendi cüzdanını yönetebilir"
  ON marketcoin_wallet FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── marketcoin_transactions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS marketcoin_transactions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount     INT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'earn',
  reason     TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE marketcoin_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User kendi MC işlemlerini görebilir" ON marketcoin_transactions;
CREATE POLICY "User kendi MC işlemlerini görebilir"
  ON marketcoin_transactions FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── badges ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  description      TEXT,
  icon             TEXT,
  condition_type   TEXT,
  condition_value  INT,
  color            TEXT DEFAULT '#007AFF'
);

-- ── user_badges ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id   TEXT REFERENCES badges(id),
  earned_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes rozetleri görebilir" ON user_badges;
CREATE POLICY "Herkes rozetleri görebilir"
  ON user_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sadece sistem rozet ekleyebilir" ON user_badges;
CREATE POLICY "Sadece sistem rozet ekleyebilir"
  ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── post_likes ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_likes (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User kendi beğenilerini yönetebilir" ON post_likes;
CREATE POLICY "User kendi beğenilerini yönetebilir"
  ON post_likes FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── video_comments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id    TEXT NOT NULL,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) <= 500),
  likes       INT DEFAULT 0,
  is_pinned   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes yorumları görebilir" ON video_comments;
CREATE POLICY "Herkes yorumları görebilir"
  ON video_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Giriş yapan yorum ekleyebilir" ON video_comments;
CREATE POLICY "Giriş yapan yorum ekleyebilir"
  ON video_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "User kendi yorumunu silebilir" ON video_comments;
CREATE POLICY "User kendi yorumunu silebilir"
  ON video_comments FOR DELETE USING (auth.uid() = user_id);

-- ── push_tokens ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_tokens (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  platform   TEXT DEFAULT 'android',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User kendi token'ını yönetebilir" ON push_tokens;
CREATE POLICY "User kendi token'ını yönetebilir"
  ON push_tokens FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── profiles → push_token kolonu ─────────────────────────────
-- Zaten profiles tablosu varsa push_token kolonu ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- ── follows tablosu ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  follower_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes takip ilişkisini görebilir" ON follows;
CREATE POLICY "Herkes takip ilişkisini görebilir"
  ON follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Giriş yapan takip edebilir" ON follows;
CREATE POLICY "Giriş yapan takip edebilir"
  ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Takipçi takibi kaldırabilir" ON follows;
CREATE POLICY "Takipçi takibi kaldırabilir"
  ON follows FOR DELETE USING (auth.uid() = follower_id);

-- ── marketcoin_wallet ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketcoin_wallet (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance    INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE marketcoin_wallet ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User kendi cüzdanını yönetebilir" ON marketcoin_wallet;
CREATE POLICY "User kendi cüzdanını yönetebilir"
  ON marketcoin_wallet FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── marketcoin_transactions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS marketcoin_transactions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount     INT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'earn',
  reason     TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE marketcoin_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User kendi MC işlemlerini görebilir" ON marketcoin_transactions;
CREATE POLICY "User kendi MC işlemlerini görebilir"
  ON marketcoin_transactions FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'system',
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT false,
  meta       JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User kendi bildirimlerini gorebilir" ON notifications;
CREATE POLICY "User kendi bildirimlerini gorebilir"
  ON notifications FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- SUPABASE UYUMLULUK DUZELTMELERI
-- Bu blogu Supabase SQL Editor'da calistir
-- ═══════════════════════════════════════════════════════════════

-- ── profiles tablosuna FK ekle (posts icin) ───────────────────
-- posts.user_id -> profiles.id iliskisi icin trigger/view
-- NOT: posts tablosu auth.users'a referans veriyor, bu gecerli.
-- Ama profile bilgisi cekebilmek icin profiles tablosu gerekli.

-- ── signals tablosu ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS signals (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id      TEXT        NOT NULL,
  direction     TEXT        NOT NULL DEFAULT 'BUY',
  confidence    INT         NOT NULL DEFAULT 3 CHECK (confidence BETWEEN 1 AND 5),
  entry_price   FLOAT,
  target_price  FLOAT,
  stop_loss     FLOAT,
  timeframe     TEXT        DEFAULT '1G',
  rationale     TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  copies_count  INT         NOT NULL DEFAULT 0,
  likes_count   INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at     TIMESTAMPTZ,
  result        TEXT
);

ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes sinyalleri okuyabilir" ON signals;
CREATE POLICY "Herkes sinyalleri okuyabilir"
  ON signals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Giris yapan sinyal olusturabilir" ON signals;
CREATE POLICY "Giris yapan sinyal olusturabilir"
  ON signals FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Sinyal sahibi guncelleyebilir" ON signals;
CREATE POLICY "Sinyal sahibi guncelleyebilir"
  ON signals FOR UPDATE USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Sinyal sahibi silebilir" ON signals;
CREATE POLICY "Sinyal sahibi silebilir"
  ON signals FOR DELETE USING (auth.uid() = creator_id);

CREATE INDEX IF NOT EXISTS idx_signals_creator ON signals(creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_asset   ON signals(asset_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_active  ON signals(is_active, created_at DESC);

-- ── assets tablosu (sinyal asset_id FK icin) ─────────────────
CREATE TABLE IF NOT EXISTS assets (
  id          TEXT PRIMARY KEY,
  symbol      TEXT NOT NULL,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'crypto',
  logo_url    TEXT,
  logo_letter TEXT,
  logo_color  TEXT DEFAULT '#9AA0AF'
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Assets herkese acik" ON assets;
CREATE POLICY "Assets herkese acik" ON assets FOR SELECT USING (true);

-- Temel asset verileri ekle (yoksa)
INSERT INTO assets (id, symbol, name, category, logo_letter, logo_color)
VALUES
  ('BTC',    'BTC',     'Bitcoin',      'crypto',      'B', '#F7931A'),
  ('ETH',    'ETH',     'Ethereum',     'crypto',      'E', '#627EEA'),
  ('BNB',    'BNB',     'BNB',          'crypto',      'B', '#F3BA2F'),
  ('SOL',    'SOL',     'Solana',       'crypto',      'S', '#9945FF'),
  ('XRP',    'XRP',     'XRP',          'crypto',      'X', '#00AAE4'),
  ('AAPL',   'AAPL',    'Apple Inc.',   'stocks',      'A', '#555555'),
  ('NVDA',   'NVDA',    'NVIDIA Corp.', 'stocks',      'N', '#76B900'),
  ('TSLA',   'TSLA',    'Tesla Inc.',   'stocks',      'T', '#CC0000'),
  ('MSFT',   'MSFT',    'Microsoft',    'stocks',      'M', '#00A4EF'),
  ('XAU',    'XAU/USD', 'Altin',        'commodities', 'A', '#FFD700'),
  ('WTI',    'WTI',     'Ham Petrol',   'commodities', 'P', '#333333'),
  ('USDTRY', 'USD/TRY', 'Dolar/TL',     'forex',       '$', '#007AFF'),
  ('EURTRY', 'EUR/TRY', 'Euro/TL',      'forex',       'E', '#003399')
ON CONFLICT (id) DO NOTHING;

-- ── posts tablosuna video destegi ────────────────────────────
ALTER TABLE posts ADD COLUMN IF NOT EXISTS type         TEXT DEFAULT 'post';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title        TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url    TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS duration     INT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS asset_tags   TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count  INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count  INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares_count INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_premium   BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS creator_id   UUID REFERENCES auth.users(id);

-- creator_id'yi user_id ile senkronize et (mevcutlar icin)
UPDATE posts SET creator_id = user_id WHERE creator_id IS NULL;

-- ── marketcoin_wallet tablosu ──────────────────────────────────
CREATE TABLE IF NOT EXISTS marketcoin_wallet (
  user_id    UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance    BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE marketcoin_wallet ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User kendi MC cuzdanini gorebilir" ON marketcoin_wallet;
CREATE POLICY "User kendi MC cuzdanini gorebilir"
  ON marketcoin_wallet FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── marketcoin_transactions tablosu ──────────────────────────────
CREATE TABLE IF NOT EXISTS marketcoin_transactions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount     INT  NOT NULL,
  type       TEXT NOT NULL DEFAULT 'earn',
  reason     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE marketcoin_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User kendi MC islemlerini gorebilir" ON marketcoin_transactions;
CREATE POLICY "User kendi MC islemlerini gorebilir"
  ON marketcoin_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mc_txn_user ON marketcoin_transactions(user_id, created_at DESC);

-- price_alerts tablosu zaten var (schema.sql'den), sadece index ekle
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_active ON price_alerts(user_id, is_active) WHERE is_active = true;

-- ── portfolio_holdings tablosu ──────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id    TEXT NOT NULL,
  symbol      TEXT NOT NULL,
  name        TEXT,
  quantity    FLOAT NOT NULL DEFAULT 0,
  avg_cost    FLOAT NOT NULL DEFAULT 0,
  buy_date    TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User kendi portfoyunu yonetebilir" ON portfolio_holdings;
CREATE POLICY "User kendi portfoyunu yonetebilir"
  ON portfolio_holdings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio_holdings(user_id);

-- ── watchlists tablosu ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlists (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, asset_id)
);
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User kendi izleme listesini yonetebilir" ON watchlists;
CREATE POLICY "User kendi izleme listesini yonetebilir"
  ON watchlists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── post_likes tablosu ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_likes (
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id  UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Herkes begeni gorebilir" ON post_likes;
CREATE POLICY "Herkes begeni gorebilir" ON post_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "User begeni ekleyebilir" ON post_likes;
CREATE POLICY "User begeni ekleyebilir"
  ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User kendi begenisini silebilir" ON post_likes;
CREATE POLICY "User kendi begenisini silebilir"
  ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- ── video_comments tablosu ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id    UUID NOT NULL,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  likes       INT DEFAULT 0,
  is_pinned   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Herkes yorumlari gorebilir" ON video_comments;
CREATE POLICY "Herkes yorumlari gorebilir" ON video_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "User yorum ekleyebilir" ON video_comments;
CREATE POLICY "User yorum ekleyebilir"
  ON video_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User kendi yorumunu silebilir" ON video_comments;
CREATE POLICY "User kendi yorumunu silebilir"
  ON video_comments FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_video ON video_comments(video_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- SUPABASE SÜTUN DUZELTMELERI  (27 Şubat 2026)
-- ═══════════════════════════════════════════════════════════════

-- portfolio_holdings: symbol/name kolonları ekle (yoksa)
ALTER TABLE portfolio_holdings ADD COLUMN IF NOT EXISTS symbol    TEXT;
ALTER TABLE portfolio_holdings ADD COLUMN IF NOT EXISTS name      TEXT;
ALTER TABLE portfolio_holdings ADD COLUMN IF NOT EXISTS notes     TEXT;
-- purchased_at yoksa created_at zaten var; hiçbir şey değişmez

-- asset_prices tablosu (market verisini önbelleğe almak için)
CREATE TABLE IF NOT EXISTS asset_prices (
  asset_id       TEXT PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
  price          FLOAT NOT NULL DEFAULT 0,
  change_percent FLOAT NOT NULL DEFAULT 0,
  volume         TEXT,
  market_cap     TEXT,
  spark          FLOAT[],
  updated_at     TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE asset_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Asset prices herkese acik" ON asset_prices;
CREATE POLICY "Asset prices herkese acik" ON asset_prices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Asset prices guncellenebilir" ON asset_prices;
CREATE POLICY "Asset prices guncellenebilir" ON asset_prices FOR ALL USING (true);

-- profiles tablosuna eksik kolonlar
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token    TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_days   INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signal_accuracy FLOAT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count  INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketcoin      INT DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════
-- SUPABASE STORAGE BUCKET (Dashboard'dan da yapilabilir)
-- ═══════════════════════════════════════════════════════════════
-- Supabase Dashboard -> Storage -> Create Bucket:
--   Name: avatars
--   Public: true
--   File size limit: 5MB
--   Allowed MIME types: image/jpeg,image/png,image/webp

-- Storage polisleri (SQL Editor'da cal):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar yukleme" ON storage.objects;
CREATE POLICY "Avatar yukleme"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Avatar guncelleme" ON storage.objects;
CREATE POLICY "Avatar guncelleme"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Avatar herkes gorebilir" ON storage.objects;
CREATE POLICY "Avatar herkes gorebilir"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- ── Videos bucket (Short / Video / Live yüklemeler için) ──────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos', 'videos', true, 104857600,
  ARRAY['video/mp4','video/quicktime','video/webm','video/x-msvideo']
) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Video yukleme" ON storage.objects;
CREATE POLICY "Video yukleme"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'videos' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Video guncelleme" ON storage.objects;
CREATE POLICY "Video guncelleme"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'videos' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Video herkes gorebilir" ON storage.objects;
CREATE POLICY "Video herkes gorebilir"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "Video silme" ON storage.objects;
CREATE POLICY "Video silme"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── Canlı Yayın Tabloları ─────────────────────────────────────────────────────

-- Aktif yayın oturumları
CREATE TABLE IF NOT EXISTS live_sessions (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id       UUID        REFERENCES posts(id) ON DELETE CASCADE,
  host_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_name  TEXT        NOT NULL UNIQUE,
  title         TEXT        NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  viewer_count  INT         NOT NULL DEFAULT 0,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at      TIMESTAMPTZ
);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Herkes yayinlari gorebilir" ON live_sessions;
CREATE POLICY "Herkes yayinlari gorebilir"
  ON live_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Yayinci kendi oturumunu yonetebilir" ON live_sessions;
CREATE POLICY "Yayinci kendi oturumunu yonetebilir"
  ON live_sessions FOR ALL
  USING  (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

CREATE INDEX IF NOT EXISTS idx_live_sessions_active ON live_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_live_sessions_channel ON live_sessions(channel_name);

-- Canlı yayın mesajları ve hediyeler
CREATE TABLE IF NOT EXISTS live_messages (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     UUID        REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  username    TEXT,
  content     TEXT        NOT NULL,
  is_gift     BOOLEAN     NOT NULL DEFAULT false,
  gift_icon   TEXT,
  gift_name   TEXT,
  gift_cost   INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE live_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Herkes mesajlari gorebilir" ON live_messages;
CREATE POLICY "Herkes mesajlari gorebilir"
  ON live_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Giris yapan mesaj gonderebilir" ON live_messages;
CREATE POLICY "Giris yapan mesaj gonderebilir"
  ON live_messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_live_messages_post ON live_messages(post_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- YENİ EKLEMELER  (2 Mart 2026)
-- 1) profiles.cover_url           — kapak fotoğrafı
-- 2) ai_sessions + ai_messages    — MarketAI sohbet geçmişi
-- 3) dm_conversations + dm_messages — Kullanıcılar arası DM
-- 4) covers Storage bucket        — kapak fotoğrafı yüklemeleri
-- 5) signal_likes + signal_copies — useSignals idempotent tablo
-- ═══════════════════════════════════════════════════════════════

-- ── 1. profiles: kapak fotoğrafı kolonu ──────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- ── 2a. ai_sessions — AI sohbet oturumları ───────────────────
CREATE TABLE IF NOT EXISTS ai_sessions (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL DEFAULT 'Yeni Sohbet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_sessions" ON ai_sessions;
CREATE POLICY "own_sessions"
  ON ai_sessions FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON ai_sessions(user_id, updated_at DESC);

-- ── 2b. ai_messages — AI sohbet mesajları ────────────────────
CREATE TABLE IF NOT EXISTS ai_messages (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID        NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_messages" ON ai_messages;
CREATE POLICY "own_messages"
  ON ai_messages FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_messages_session ON ai_messages(session_id, created_at ASC);

-- ── 3a. dm_conversations — DM konuşma oturumları ─────────────
CREATE TABLE IF NOT EXISTS dm_conversations (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message     TEXT,
  last_message_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unread_count_1   INT         NOT NULL DEFAULT 0,  -- user1 için okunmamış sayısı
  unread_count_2   INT         NOT NULL DEFAULT 0,  -- user2 için okunmamış sayısı
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user1_id, user2_id),
  CONSTRAINT different_users CHECK (user1_id <> user2_id)
);

ALTER TABLE dm_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "party_access_conv" ON dm_conversations;
CREATE POLICY "party_access_conv"
  ON dm_conversations FOR ALL
  USING  (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE INDEX IF NOT EXISTS idx_dm_conv_user1 ON dm_conversations(user1_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_conv_user2 ON dm_conversations(user2_id, last_message_at DESC);

-- ── 3b. dm_messages — DM mesajları ───────────────────────────
CREATE TABLE IF NOT EXISTS dm_messages (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID        NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
  sender_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT        NOT NULL,
  image_url       TEXT,
  is_read         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "party_access_msg" ON dm_messages;
CREATE POLICY "party_access_msg"
  ON dm_messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM dm_conversations
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = sender_id
    AND conversation_id IN (
      SELECT id FROM dm_conversations
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_dm_messages_conv ON dm_messages(conversation_id, created_at ASC);

-- ── 4. covers Storage bucket ──────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers', 'covers', true, 10485760,
  ARRAY['image/jpeg','image/png','image/webp']
) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Cover yukleme"      ON storage.objects;
DROP POLICY IF EXISTS "Cover guncelleme"   ON storage.objects;
DROP POLICY IF EXISTS "Cover herkes gorebilir" ON storage.objects;
DROP POLICY IF EXISTS "Cover silme"        ON storage.objects;

CREATE POLICY "Cover yukleme"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Cover guncelleme"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Cover herkes gorebilir"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Cover silme"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'covers' AND auth.uid() IS NOT NULL);

-- ── 5. signal_likes + signal_copies ──────────────────────────
CREATE TABLE IF NOT EXISTS signal_likes (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_id  UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, signal_id)
);

ALTER TABLE signal_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User sinyal begenilerini yonetebilir" ON signal_likes;
CREATE POLICY "User sinyal begenilerini yonetebilir"
  ON signal_likes FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS signal_copies (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_id  UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, signal_id)
);

ALTER TABLE signal_copies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User sinyal kopyalarini yonetebilir" ON signal_copies;
CREATE POLICY "User sinyal kopyalarini yonetebilir"
  ON signal_copies FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── notifications tablosu: eksik kolonlar ─────────────────────
-- lib/notifications.ts sender_id, related_id, image_url, is_read kullanıyor
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id  UUID REFERENCES auth.users(id);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS image_url  TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read    BOOLEAN DEFAULT false;
-- "read" kolonunu "is_read" ile senkronize et (varsa)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'read'
  ) THEN
    UPDATE notifications SET is_read = read WHERE is_read IS NULL;
  END IF;
  UPDATE notifications SET is_read = false WHERE is_read IS NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- YENİ EKLEMELER  (2 Mart 2026 — Production Fix)
-- saved_posts, profiles eksik kolonlar, comments tablosu
-- ═══════════════════════════════════════════════════════════════

-- ── saved_posts — gönderi kaydetme (PostCard bookmark) ────────
CREATE TABLE IF NOT EXISTS saved_posts (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User kendi kaydetlerini yonetebilir" ON saved_posts;
CREATE POLICY "User kendi kaydetlerini yonetebilir"
  ON saved_posts FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user ON saved_posts(user_id, created_at DESC);

-- ── comments — post yorumları (useComments hook) ──────────────
-- video_comments farklı tablodur; bu post yorumları için
CREATE TABLE IF NOT EXISTS comments (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL CHECK (char_length(content) <= 500),
  likes      INT         NOT NULL DEFAULT 0,
  is_liked   BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Herkes yorumlari gorebilir" ON comments;
CREATE POLICY "Herkes yorumlari gorebilir" ON comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Giris yapan yorum ekleyebilir" ON comments;
CREATE POLICY "Giris yapan yorum ekleyebilir"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Yorum sahibi silebilir" ON comments;
CREATE POLICY "Yorum sahibi silebilir"
  ON comments FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Yorum begeni guncellenebilir" ON comments;
CREATE POLICY "Yorum begeni guncellenebilir"
  ON comments FOR UPDATE USING (true);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at ASC);

-- ── comment_likes — yorum beğenileri ─────────────────────────
CREATE TABLE IF NOT EXISTS comment_likes (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User yorum begenilerini yonetebilir" ON comment_likes;
CREATE POLICY "User yorum begenilerini yonetebilir"
  ON comment_likes FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── profiles: eksik kolonlar ──────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url     TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier          TEXT NOT NULL DEFAULT 'free'
  CHECK (tier IN ('free', 'pro', 'elite'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified      BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT NOW();

-- ── posts: likes/comments sayaç tutarlılık triggeri ───────────
-- posts.likes ve posts.comments sayaçları manuel güncelleniyor;
-- post_likes ve comments tablolarından otomatik trigger da eklenebilir ama
-- şimdilik uygulama tarafı güncelleme yeterli.

-- ── decrement_viewers RPC (LiveWatchScreen için) ──────────────
CREATE OR REPLACE FUNCTION decrement_viewers(session_post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE live_sessions
  SET viewer_count = GREATEST(0, viewer_count - 1)
  WHERE post_id = session_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────────────────────
-- VİDEO / SHORT BEĞENİ, KAYDET VE YORUM TABLOLARI
-- (ShortsScreen + VideoDetailScreen için)
-- ────────────────────────────────────────────────────────────────────────────

-- ── video_likes — video/short beğenileri ─────────────────────
CREATE TABLE IF NOT EXISTS video_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES posts(id)      ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, video_id)
);
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Herkes video begenileri gorebilir" ON video_likes;
CREATE POLICY "Herkes video begenileri gorebilir"
  ON video_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "User kendi video begenisini yonetebilir" ON video_likes;
CREATE POLICY "User kendi video begenisini yonetebilir"
  ON video_likes FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_video_id ON video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_user_id  ON video_likes(user_id);

-- ── saved_videos — kaydedilen videolar/shortlar ──────────────
CREATE TABLE IF NOT EXISTS saved_videos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id   UUID NOT NULL REFERENCES posts(id)      ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, video_id)
);
ALTER TABLE saved_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User kendi kaydedilen videolarini yonetebilir" ON saved_videos;
CREATE POLICY "User kendi kaydedilen videolarini yonetebilir"
  ON saved_videos FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_saved_videos_user_id  ON saved_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_videos_video_id ON saved_videos(video_id);

-- ── video_comments — video/short yorumları ───────────────────
-- NOT: useVideoComments hook'u bu tablo yerine mevcut comments tablosunu
-- video_id filtresiyle kullanıyorsa bu tablo gerekli olmayabilir.
-- Aşağıdaki tablo bağımsız video yorum tablosudur.
CREATE TABLE IF NOT EXISTS video_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  likes       INT         NOT NULL DEFAULT 0,
  is_pinned   BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Herkes video yorumlarini gorebilir" ON video_comments;
CREATE POLICY "Herkes video yorumlarini gorebilir"
  ON video_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Giris yapan kullanici video yorumu ekleyebilir" ON video_comments;
CREATE POLICY "Giris yapan kullanici video yorumu ekleyebilir"
  ON video_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "User kendi video yorumunu silebilir" ON video_comments;
CREATE POLICY "User kendi video yorumunu silebilir"
  ON video_comments FOR DELETE
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "User video yorum begenisini guncelleyebilir" ON video_comments;
CREATE POLICY "User video yorum begenisini guncelleyebilir"
  ON video_comments FOR UPDATE
  USING (true)
  WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_user_id  ON video_comments(user_id);

-- ── increment_video_comment_likes RPC ─────────────────────────────
-- Atomik like artırımı — race condition'ı önler
CREATE OR REPLACE FUNCTION increment_video_comment_likes(cid UUID)
RETURNS void AS $$
BEGIN
  UPDATE video_comments
  SET likes = likes + 1
  WHERE id = cid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
