-- ══════════════════════════════════════════════════════════════════════════════
-- MARKETLY SEED DATA
-- Supabase SQL Editor'da çalıştırın.
-- ÖNCE ADD_TABLES.sql çalıştırılmış olmalı!
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── 1. SEED USERS (auth.users + profiles) ───────────────────────────────────
DO $$
DECLARE
  u1 UUID := '11111111-1111-1111-1111-111111111111';
  u2 UUID := '22222222-2222-2222-2222-222222222222';
  u3 UUID := '33333333-3333-3333-3333-333333333333';
  u4 UUID := '44444444-4444-4444-4444-444444444444';
  u5 UUID := '55555555-5555-5555-5555-555555555555';
  u6 UUID := '66666666-6666-6666-6666-666666666666';
  u7 UUID := '77777777-7777-7777-7777-777777777777';
BEGIN

INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000000', u1, 'authenticated', 'authenticated',
   'cryptoguru@marketly.app', crypt('Marketly123!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Crypto Guru"}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', u2, 'authenticated', 'authenticated',
   'borsamaster@marketly.app', crypt('Marketly123!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Borsa Master"}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', u3, 'authenticated', 'authenticated',
   'fxwizard@marketly.app', crypt('Marketly123!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"FX Wizard"}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', u4, 'authenticated', 'authenticated',
   'techtrader@marketly.app', crypt('Marketly123!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Tech Trader"}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', u5, 'authenticated', 'authenticated',
   'defihunter@marketly.app', crypt('Marketly123!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"DeFi Hunter"}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', u6, 'authenticated', 'authenticated',
   'emtiapro@marketly.app', crypt('Marketly123!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Emtia Pro"}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', u7, 'authenticated', 'authenticated',
   'demo@marketly.app', crypt('Demo1234!', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Demo Kullanici"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (
  id, username, full_name, bio, avatar_url,
  tier, verified, follower_count, following_count,
  signal_accuracy, streak_days, last_login
) VALUES
  (u1, 'cryptoguru',  'Crypto Guru',    'Bitcoin & Ethereum odaklı teknik analist. 8 yıl kripto deneyimi.',
   'https://i.pravatar.cc/200?u=cg1', 'elite', true,  124000, 420, 82.4, 12, NOW()),
  (u2, 'borsamaster', 'Borsa Master',   'BIST 30 uzmanı. Temel ve teknik analiz bir arada. Günlük raporlar.',
   'https://i.pravatar.cc/200?u=bm2', 'pro',   true,   89000, 310, 74.1, 7,  NOW()),
  (u3, 'fxwizard',    'FX Wizard',      'Forex trader. EUR/USD, GBP/TRY, XAU/USD üzerine uzmanlaşmış.',
   'https://i.pravatar.cc/200?u=fw3', 'pro',   true,   67000, 280, 79.3, 5,  NOW()),
  (u4, 'techtrader',  'Tech Trader',    'Nasdaq & S&P500 hisseleri. NVDA, AAPL, TSLA analizi.',
   'https://i.pravatar.cc/200?u=tt4', 'pro',   false,  45000, 190, 72.6, 3,  NOW()),
  (u5, 'defihunter',  'DeFi Hunter',    'Solana ekosistemi ve DeFi protokolleri. Yeni projeleri erken yakala.',
   'https://i.pravatar.cc/200?u=dh5', 'pro',   true,   38000, 150, 71.2, 9,  NOW()),
  (u6, 'emtiapro',    'Emtia Pro',      'Altın, gümüş ve petrol piyasası analizi. Makroekonomik yaklaşım.',
   'https://i.pravatar.cc/200?u=ep6', 'pro',   false,  29000, 120, 68.5, 2,  NOW()),
  (u7, 'demouser',    'Demo Kullanici', 'Marketlyi kesfediyorum',
   'https://i.pravatar.cc/200?u=du7', 'free',  false,      0,   0,  0.0, 1,  NOW())
ON CONFLICT (id) DO UPDATE SET
  username        = EXCLUDED.username,
  full_name       = EXCLUDED.full_name,
  bio             = EXCLUDED.bio,
  avatar_url      = EXCLUDED.avatar_url,
  tier            = EXCLUDED.tier,
  verified        = EXCLUDED.verified,
  follower_count  = EXCLUDED.follower_count,
  signal_accuracy = EXCLUDED.signal_accuracy;

END $$;


-- ─── 2. FOLLOWS ──────────────────────────────────────────────────────────────
INSERT INTO follows (follower_id, following_id) VALUES
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111'),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222'),
  ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222'),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;


-- ─── 3. ASSETS + ASSET_PRICES (sinyallerden ÖNCE gelmeli!) ──────────────────
INSERT INTO assets (id, symbol, name, category, logo_letter, logo_color) VALUES
  ('BTC',     'BTC',      'Bitcoin',           'crypto',      'B',   '#F7931A'),
  ('ETH',     'ETH',      'Ethereum',          'crypto',      'E',   '#627EEA'),
  ('BNB',     'BNB',      'BNB',               'crypto',      'B',   '#F3BA2F'),
  ('SOL',     'SOL',      'Solana',            'crypto',      'S',   '#9945FF'),
  ('XRP',     'XRP',      'XRP',               'crypto',      'X',   '#00AAE4'),
  ('AAPL',    'AAPL',     'Apple Inc.',        'stocks',      'A',   '#555555'),
  ('NVDA',    'NVDA',     'NVIDIA Corp.',      'stocks',      'N',   '#76B900'),
  ('TSLA',    'TSLA',     'Tesla Inc.',        'stocks',      'T',   '#CC0000'),
  ('MSFT',    'MSFT',     'Microsoft',         'stocks',      'M',   '#00A4EF'),
  ('AMZN',    'AMZN',     'Amazon',            'stocks',      'A',   '#FF9900'),
  ('THYAO',   'THYAO',    'Turk Hava Yollari', 'stocks',      'TK',  '#E81F2A'),
  ('EREGL',   'EREGL',    'Eregli Demir',      'stocks',      'E',   '#5C7A99'),
  ('GARAN',   'GARAN',    'Garanti Bankasi',   'stocks',      'G',   '#00A651'),
  ('ASELS',   'ASELS',    'Aselsan',           'stocks',      'A',   '#003DA5'),
  ('KCHOL',   'KCHOL',    'Koc Holding',       'stocks',      'K',   '#E40521'),
  ('BIST100', 'BIST100',  'BIST 100',          'stocks',      'B',   '#E81F2A'),
  ('NASDAQ',  'NASDAQ',   'Nasdaq Composite',  'stocks',      'N',   '#007AFF'),
  ('SPX',     'S&P500',   'S&P 500',           'stocks',      'S',   '#4CAF50'),
  ('XAU',     'XAU/USD',  'Altin',             'commodities', 'Au',  '#FFD700'),
  ('XAG',     'XAG/USD',  'Gumus',             'commodities', 'Ag',  '#C0C0C0'),
  ('WTI',     'WTI',      'Ham Petrol',        'commodities', 'P',   '#333333'),
  ('USDTRY',  'USD/TRY',  'Dolar/TL',          'forex',       '$',   '#007AFF'),
  ('EURTRY',  'EUR/TRY',  'Euro/TL',           'forex',       'E',   '#003399'),
  ('EURUSD',  'EUR/USD',  'Euro/Dolar',        'forex',       'E',   '#1A73E8')
ON CONFLICT (id) DO UPDATE SET
  symbol      = EXCLUDED.symbol,
  name        = EXCLUDED.name,
  logo_letter = EXCLUDED.logo_letter,
  logo_color  = EXCLUDED.logo_color;

INSERT INTO asset_prices (asset_id, price, change_percent, volume, market_cap, spark, updated_at) VALUES
  ('BTC',    67420,  2.40, '$28.5B', '$1.3T',  ARRAY[60,62,61,65,67,66,68,67,69,70]::float[], NOW()),
  ('ETH',    3240,   1.80, '$14.2B', '$389B',  ARRAY[30,31,32,31,33,32,34,33,35,36]::float[], NOW()),
  ('BNB',    415,   -0.90, '$1.8B',  '$62B',   ARRAY[42,41,43,42,41,40,41,42,41,40]::float[], NOW()),
  ('SOL',    178,    4.20, '$5.1B',  '$82B',   ARRAY[16,17,17,18,17,18,19,18,19,20]::float[], NOW()),
  ('XRP',    0.63,  -1.20, '$2.4B',  '$34B',   ARRAY[6,6,6,7,6,6,6,7,6,6]::float[],          NOW()),
  ('AAPL',   189.5,  0.80, '$4.2B',  '$2.9T',  ARRAY[18,19,19,19,19,19,19,19,20,20]::float[], NOW()),
  ('NVDA',   875,    3.10, '$18.5B', '$2.1T',  ARRAY[82,83,85,84,86,86,87,87,88,89]::float[], NOW()),
  ('TSLA',   242,   -2.10, '$8.9B',  '$770B',  ARRAY[25,24,24,25,25,24,24,24,24,23]::float[], NOW()),
  ('MSFT',   415,    1.20, '$6.1B',  '$3.1T',  ARRAY[40,40,41,41,41,41,41,41,42,42]::float[], NOW()),
  ('AMZN',   185,    0.90, '$5.8B',  '$1.9T',  ARRAY[18,18,19,19,19,19,19,19,19,19]::float[], NOW()),
  ('XAU',    2345,   0.40, '$142B',  '-',      ARRAY[233,234,234,234,234,235,235,235,235,236]::float[], NOW()),
  ('XAG',    27.85, -0.61, '$12B',   '-',      ARRAY[28,28,28,27,27,27,27,27,27,27]::float[], NOW()),
  ('WTI',    78.4,  -0.60, '$28B',   '-',      ARRAY[79,78,79,78,79,78,79,78,79,78]::float[], NOW()),
  ('USDTRY', 32.14,  0.20, '-',      '-',      ARRAY[32,32,32,32,32,32,32,32,32,32]::float[], NOW()),
  ('EURTRY', 34.82,  0.30, '-',      '-',      ARRAY[35,35,35,35,35,35,35,35,35,35]::float[], NOW()),
  ('EURUSD', 1.0845,-0.22, '$45B',   '-',      ARRAY[11,11,11,11,11,11,11,11,11,11]::float[], NOW())
ON CONFLICT (asset_id) DO UPDATE SET
  price          = EXCLUDED.price,
  change_percent = EXCLUDED.change_percent,
  volume         = EXCLUDED.volume,
  market_cap     = EXCLUDED.market_cap,
  spark          = EXCLUDED.spark,
  updated_at     = NOW();


-- ─── 4. POSTS ────────────────────────────────────────────────────────────────
INSERT INTO posts (
  user_id, creator_id, type, title, description, content,
  asset_tag, asset_tags, thumbnail_url,
  likes_count, comments_count, views_count, shares_count,
  is_premium, created_at
) VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'video', 'Bitcoin & Ethereum canli analiz! Kritik seviyeler',
   'BTC 70K yolunda mi? Kritik destek ve direnc seviyelerini analiz ediyoruz.',
   'Bitcoin bugün kritik bir seviyeye yaklasiyor. RSI asiri alim bolgesinde mi?',
   'BTC', ARRAY['BTC','ETH'],
   'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
   2490, 376, 47600, 248, false, NOW() - INTERVAL '2 hours'),

  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'video', 'BIST100 kritik direnc kirildi! Ne bekliyoruz?',
   'BIST100 onemli bir seviyeyi kirdi. Hangi hisseler one cikacak?',
   'BIST100 teknik analiz. Destek seviyeleri ve olasi hedefler.',
   'BIST100', ARRAY['BIST100','THYAO'],
   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
   5100, 234, 51000, 189, false, NOW() - INTERVAL '5 hours'),

  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'video', 'Altin 3000 dolara cikar mi? XAU/USD teknik analiz',
   'Fed faiz karari sonrasi altin fiyatlari icin kritik analiz.',
   'XAU/USD kritik seviyeler. Yukselis devam edecek mi?',
   'XAU', ARRAY['XAU','XAG'],
   'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600',
   1890, 89, 11200, 67, false, NOW() - INTERVAL '8 hours'),

  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
   'video', 'NVDA 1000 dolari gorur mu? Yapay zeka ruzgari devam ediyor',
   'NVIDIA hissesi icin detayli teknik ve temel analiz.',
   'Yapay zeka talebi NVDAyi nereye tasir? Beklentiler ve riskler.',
   'NVDA', ARRAY['NVDA','AAPL'],
   'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600',
   12300, 890, 123000, 640, false, NOW() - INTERVAL '3 hours'),

  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
   'video', 'Solana ekosistemi patlamada! SOL icin hedef fiyatlar',
   'SOL tabanli DeFi projeleri. 2025 hedef analiz.',
   'Solanada yuksek islem hacmi ve yeni projeler. Fiyat nereye gider?',
   'SOL', ARRAY['SOL'],
   'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600',
   4200, 312, 42000, 198, false, NOW() - INTERVAL '6 hours'),

  ('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666',
   'video', 'Ham Petrol analizi: WTI nereye gidiyor?',
   'OPEC kararlari ve jeopolitik riskler baglaminda petrol analizi.',
   'WTI ham petrolde kritik destek seviyeleri ve olasi hareket.',
   'WTI', ARRAY['WTI','XAU'],
   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
   980, 67, 9800, 45, false, NOW() - INTERVAL '12 hours'),

  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'short', 'Bitcoin 70Ka kosuyor mu?',
   'BTC teknik analizde kilit destek kirildi! Hedef fiyatlar.',
   'BTC destek kirilmasi ve olasi hedefler hakkinda kisa analiz.',
   'BTC', ARRAY['BTC','ETH'],
   'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=1400&fit=crop',
   48200, 1840, 428000, 3200, false, NOW() - INTERVAL '1 hour'),

  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'short', 'BIST100de bu hisseler ucuyor!',
   'Gunun en cok yukselen 3 hissesi ve teknik analizi.',
   'THYAO ve GARANda guclu yukselis. Devam eder mi?',
   'THYAO', ARRAY['BIST100','THYAO'],
   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=1400&fit=crop',
   32100, 920, 218000, 1800, false, NOW() - INTERVAL '4 hours'),

  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'short', 'Altin 3000 dolara cikar mi?',
   'Fed faiz karari sonrasi altin fiyatlari icin kritik analiz.',
   'XAU/USD teknik gorunum ve olasi senaryolar.',
   'XAU', ARRAY['XAU'],
   'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=1400&fit=crop',
   19800, 640, 142000, 980, false, NOW() - INTERVAL '7 hours'),

  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
   'short', 'Ethereum 4000 dolar yolunda mi?',
   'ETH staking getirileri ve DeFi ekosistemi guncel durum.',
   'Ethereumda yukselis trendi devam ediyor mu?',
   'ETH', ARRAY['ETH'],
   'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=1400&fit=crop',
   38900, 1560, 384000, 2800, false, NOW() - INTERVAL '9 hours'),

  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
   'short', 'Nasdaq 20000 direnc kirdi!',
   'Nasdaq tarihi zirveyi asti. Teknoloji hisseleri icin ne anlama geliyor?',
   'NVDA ve AAPLye bakis. Yeni ATH geliyor mu?',
   'NASDAQ', ARRAY['NASDAQ','NVDA'],
   'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=1400&fit=crop',
   27500, 1120, 305000, 2100, false, NOW() - INTERVAL '11 hours'),

  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
   'short', 'Solana ekosistemi patlamada!',
   'SOL tabanli yeni DeFi projeleri ve meme coinler.',
   '2025 icin SOL hedef fiyat analizi.',
   'SOL', ARRAY['SOL'],
   'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=1400&fit=crop',
   52100, 2340, 512000, 4100, false, NOW() - INTERVAL '14 hours'),

  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'text', NULL, NULL,
   'Bitcoin bugun 65000 dolar desteğini test ediyor. RSI haftalik grafikte 52 seviyesinde. Hedefim 72000. #BTC #Kripto',
   'BTC', ARRAY['BTC'], NULL,
   847, 134, 0, 89, false, NOW() - INTERVAL '30 minutes'),

  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'text', NULL, NULL,
   'THYAO bugun 3.2 yukseldi. Teknik olarak 265 TL hedefi gecerli. Takipte kalin! #THYAO #BIST',
   'THYAO', ARRAY['THYAO'], NULL,
   523, 87, 0, 45, false, NOW() - INTERVAL '1 hour'),

  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'text', NULL, NULL,
   'Altin bu hafta merkez bankasi alimlariyla destekleniyor. 2500 dolar hedefi yakin! #Altin #XAU',
   'XAU', ARRAY['XAU'], NULL,
   412, 56, 0, 38, false, NOW() - INTERVAL '2 hours'),

  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
   'text', NULL, NULL,
   'NVDA Q4 sonuclari beklentilerin uzerinde geldi. AI chip talebi yuzde 200 artti. 1000 dolar hedefi guclu! #NVDA',
   'NVDA', ARRAY['NVDA'], NULL,
   1240, 198, 0, 156, false, NOW() - INTERVAL '3 hours'),

  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
   'text', NULL, NULL,
   'Solanada TVL son 30 gunde yuzde 45 artti. DeFi aktivitesi tarihi zirveye yakin. SOL icin bullish! #Solana',
   'SOL', ARRAY['SOL'], NULL,
   678, 102, 0, 67, false, NOW() - INTERVAL '4 hours');


-- ─── 5. SIGNALS ──────────────────────────────────────────────────────────────
INSERT INTO signals (
  creator_id, asset_id, direction, confidence,
  entry_price, target_price, stop_loss,
  timeframe, rationale,
  copies_count, likes_count,
  is_active, created_at
) VALUES
  ('11111111-1111-1111-1111-111111111111', 'BTC', 'BUY', 5,
   63800, 72000, 60500, 'Orta Vade',
   'Yukselen kanal icinde saglam destek. RSI asiri satim bolgesinden cikiyor. Hash rate ATH seviyesinde.',
   340, 1240, true, NOW() - INTERVAL '14 minutes'),

  ('22222222-2222-2222-2222-222222222222', 'THYAO', 'BUY', 4,
   248, 285, 235, 'Kisa Vade',
   'Kargo gelirlerinde guclu artis beklentisi. Hacim artisi olumlu.',
   218, 876, true, NOW() - INTERVAL '2 hours'),

  ('33333333-3333-3333-3333-333333333333', 'XAU', 'BUY', 5,
   2340, 2480, 2290, 'Uzun Vade',
   'Enflasyon beklentileri ve merkez bankasi alimlari altini destekliyor. Fed pivot yaklasıyor.',
   567, 2100, true, NOW() - INTERVAL '1 hour'),

  ('44444444-4444-4444-4444-444444444444', 'NVDA', 'BUY', 4,
   875, 1050, 820, 'Orta Vade',
   'AI chip talebi rekor kiriyor. Q4 beklentileri pozitif.',
   289, 988, true, NOW() - INTERVAL '3 hours'),

  ('55555555-5555-5555-5555-555555555555', 'SOL', 'BUY', 4,
   138, 165, 128, 'Kisa Vade',
   'DeFi hacmi rekor kiriyor. Sikisma formasyonu yukari kirildi. TVL artisi guclu.',
   289, 988, true, NOW() - INTERVAL '5 hours'),

  ('33333333-3333-3333-3333-333333333333', 'ETH', 'SELL', 3,
   3200, 2850, 3380, 'Kisa Vade',
   'Direnc bolgesinde momentum zayfliyor. MACD negatif kesisim yapti.',
   124, 432, true, NOW() - INTERVAL '4 hours'),

  ('22222222-2222-2222-2222-222222222222', 'AAPL', 'BUY', 3,
   189, 215, 180, 'Uzun Vade',
   'Apple AI stratejisi yatirimcilari heyecanlandirdi. iPhone satislari beklentilerin uzerinde.',
   156, 654, true, NOW() - INTERVAL '6 hours');


-- ─── 6. PORTFOLIO HOLDINGS ───────────────────────────────────────────────────
INSERT INTO portfolio_holdings (user_id, asset_id, symbol, name, quantity, avg_cost, created_at) VALUES
  ('77777777-7777-7777-7777-777777777777', 'BTC',  'BTC',  'Bitcoin',  0.18, 62000, NOW() - INTERVAL '30 days'),
  ('77777777-7777-7777-7777-777777777777', 'ETH',  'ETH',  'Ethereum', 2.50, 3100,  NOW() - INTERVAL '25 days'),
  ('77777777-7777-7777-7777-777777777777', 'SOL',  'SOL',  'Solana',   15.0, 155,   NOW() - INTERVAL '20 days'),
  ('77777777-7777-7777-7777-777777777777', 'AAPL', 'AAPL', 'Apple',     5.0, 183,   NOW() - INTERVAL '15 days'),
  ('11111111-1111-1111-1111-111111111111', 'BTC',  'BTC',  'Bitcoin',  1.50, 48000, NOW() - INTERVAL '90 days'),
  ('11111111-1111-1111-1111-111111111111', 'ETH',  'ETH',  'Ethereum',20.0,  2800,  NOW() - INTERVAL '85 days'),
  ('11111111-1111-1111-1111-111111111111', 'SOL',  'SOL',  'Solana', 100.0,  95,    NOW() - INTERVAL '60 days'),
  ('22222222-2222-2222-2222-222222222222', 'NVDA', 'NVDA', 'NVIDIA',   10.0, 680,   NOW() - INTERVAL '45 days'),
  ('22222222-2222-2222-2222-222222222222', 'AAPL', 'AAPL', 'Apple',    20.0, 175,   NOW() - INTERVAL '40 days'),
  ('33333333-3333-3333-3333-333333333333', 'XAU',  'XAU',  'Altin',     2.0, 2100,  NOW() - INTERVAL '60 days')
ON CONFLICT DO NOTHING;


-- ─── 7. PRICE ALERTS ─────────────────────────────────────────────────────────
-- "target" (eski kolon, NOT NULL) ve "target_price" (yeni kolon) ikisi birden dolu olmali.
INSERT INTO price_alerts (user_id, symbol, asset_id, target, target_price, condition, is_active, created_at) VALUES
  ('77777777-7777-7777-7777-777777777777', 'BTC',  'BTC',  70000, 70000, 'above', true, NOW() - INTERVAL '2 days'),
  ('77777777-7777-7777-7777-777777777777', 'ETH',  'ETH',  3500,  3500,  'above', true, NOW() - INTERVAL '1 day'),
  ('77777777-7777-7777-7777-777777777777', 'SOL',  'SOL',  200,   200,   'above', true, NOW() - INTERVAL '3 days'),
  ('11111111-1111-1111-1111-111111111111', 'BTC',  'BTC',  60000, 60000, 'below', true, NOW() - INTERVAL '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'NVDA', 'NVDA', 900,   900,   'above', true, NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;


-- ─── 8. MARKET COIN BALANCES (profiles.marketcoin) ──────────────────────────
UPDATE profiles SET marketcoin = 850  WHERE id = '77777777-7777-7777-7777-777777777777';
UPDATE profiles SET marketcoin = 5240 WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE profiles SET marketcoin = 3120 WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE profiles SET marketcoin = 2890 WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE profiles SET marketcoin = 1560 WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE profiles SET marketcoin = 980  WHERE id = '55555555-5555-5555-5555-555555555555';
UPDATE profiles SET marketcoin = 440  WHERE id = '66666666-6666-6666-6666-666666666666';


-- ─── 9. NOTIFICATIONS ────────────────────────────────────────────────────────
INSERT INTO notifications (user_id, type, title, body, read, created_at) VALUES
  ('77777777-7777-7777-7777-777777777777', 'follow',
   'Crypto Guru sizi takip ediyor',
   'cryptoguru sizin profilinizi takip etmeye basladi.',
   false, NOW() - INTERVAL '5 minutes'),
  ('77777777-7777-7777-7777-777777777777', 'like',
   'Borsa Master gonderinizi begendi',
   'Gonderiniz beğenildi.',
   false, NOW() - INTERVAL '20 minutes'),
  ('77777777-7777-7777-7777-777777777777', 'system',
   'Marketlye Hos Geldiniz!',
   'Baslamak icin profilinizi tamamlayin ve ilk gonderinizi paylasin.',
   true, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;


-- ─── SONUC ───────────────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE 'Seed data basariyla yuklendi!';
  RAISE NOTICE 'Demo hesap: demo@marketly.app / Demo1234!';
  RAISE NOTICE 'Diger hesaplar: cryptoguru@marketly.app / Marketly123!';
END $$;
