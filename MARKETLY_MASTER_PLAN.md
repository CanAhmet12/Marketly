# MARKETLY — TAM GELİŞTİRME MASTER PLANI

> **Son Güncelleme:** 27 Şubat 2026  
> **Hazırlayan:** AI Geliştirme Asistanı  
> **Durum:** Aktif — Sprint 2 devam ediyor

---

## 🏁 GENEL İLERLEME

| Sprint | Başlık | Durum |
|---|---|---|
| Sprint 1 | Backend Altyapı & Gerçek Veri | ✅ TAMAMLANDI |
| Sprint 2 | Ödeme Sistemi & Pro Üyelik | ✅ UI Tamamlandı (RevenueCat bekliyor) |
| Sprint 3 | Video & İçerik Sistemi | ⏳ Bekliyor |
| Sprint 4 | Sosyal Katman | 🔄 DEVAM EDİYOR |
| Sprint 5 | Gamifikasyon & Retention | ✅ Kısmen Tamamlandı |
| Sprint 6 | AI Asistan | ✅ UI Tamamlandı |
| Sprint 7 | Dark Mode & Onboarding | ✅ Onboarding Tamamlandı |
| Sprint 8 | Broker Entegrasyonu | ⏳ Bekliyor |

---

## İÇİNDEKİLER

1. [Mevcut Durum Analizi](#1-mevcut-durum-analizi)
2. [Pazar & Rakip Analizi](#2-pazar--rakip-analizi)
3. [Gelir Modeli](#3-gelir-modeli)
4. [Mimari Kararlar](#4-mimari-kararlar)
5. [Sprint Planı — 8 Sprint / 16 Hafta](#5-sprint-planı--8-sprint--16-hafta)
6. [Tasarımsal Geliştirmeler](#6-tasarımsal-geliştirmeler)
7. [Kullanıcı Edinim Stratejisi](#7-kullanıcı-edinim-stratejisi)
8. [Gelir Projeksiyonu](#8-gelir-projeksiyonu)
9. [Teknik Borç & Düzeltmeler](#9-teknik-borç--düzeltmeler)

---

## 1. MEVCUT DURUM ANALİZİ

### ✅ Tamamlananlar (Güçlü Yönler)

| Özellik | Durum | Dosya |
|---|---|---|
| 5 sekme navigasyonu | ✅ Hazır | `RootNavigator.tsx` |
| Auto-hide tab bar (scroll) | ✅ Hazır | `TabBarContext.tsx` |
| Animated header (scroll) | ✅ Hazır | HomeScreen, DiscoverScreen, MarketsScreen |
| Candlestick chart (6 zaman dilimi) | ✅ Hazır | `AssetDetailScreen.tsx` |
| Shorts tam ekran feed | ✅ Hazır | `ShortsScreen.tsx` |
| Signal kartları UI | ✅ Hazır | `SignalCard.tsx` |
| Market kategorileri (Kripto/Hisse/Emtia/Döviz) | ✅ Hazır | `MarketsScreen.tsx` |
| Profil sayfası (logged-in + guest) | ✅ Hazır | `ProfileScreen.tsx` |
| Auth akışı UI | ✅ Hazır | `LoginScreen.tsx`, `RegisterScreen.tsx` |
| Watchlist UI | ✅ Hazır | `MarketsScreen.tsx` |
| Pull-to-refresh | ✅ Hazır | `HomeScreen.tsx` |
| Push bildirim UI | ✅ Hazır | `NotificationsScreen.tsx` |
| Ayarlar ekranı | ✅ Hazır | `SettingsScreen.tsx` |
| Arama ekranı | ✅ Hazır | `SearchScreen.tsx` |

### ❌ Eksikler (Kritik Sorunlar)

| Eksik | Etki | Öncelik |
|---|---|---|
| Tüm veriler mock | Hiçbir şey gerçek değil | 🔴 KRİTİK |
| Backend yok | Para kazanılamaz, kullanıcı tutulamaz | 🔴 KRİTİK |
| Ödeme sistemi yok | Gelir sıfır | 🔴 KRİTİK |
| Gerçek video oynatma yok | Creator economy imkânsız | 🔴 KRİTİK |
| Dark mode yok | Kullanıcıların %70'i istiyor | 🟠 YÜKSEK |
| Onboarding flow yok | İlk kullanımda kayıp yüksek | 🟠 YÜKSEK |
| Gamification yok | Retention düşük | 🟠 YÜKSEK |
| AI asistan yok | Rekabet avantajı kaçıyor | 🟡 ORTA |
| Broker entegrasyonu yok | Gelir katmanı eksik | 🟡 ORTA |

---

## 2. PAZAR & RAKİP ANALİZİ

### Rakip Karşılaştırması

| Rakip | Kullanıcı | Güçlü Yön | Zayıf Yön | Bizim Fırsatımız |
|---|---|---|---|---|
| **TradingView** | 100M+ | Chart kalitesi, 322M$/yıl gelir | Video yok, sosyal zayıf, mobil kötü | Video + sosyal + chart = fusion |
| **eToro** | 3.7M funded | Copy trading, IPO 2025 ($4.2B) | İçerik üretimi yok | Creator economy katmanı |
| **StockTwits** | 10M+ | Sentiment, topluluk | Çok eski UI, video yok | Türkiye'de "fintech TikTok" boşluğu |
| **Midas (TR)** | 500K+ | 80M$ Series B (2025, Türkiye rekoru) | Sosyal içerik hiç yok | Community layer = rakipsiz |
| **Robinhood Gold** | 23M+ | Üyelik modeli, Gold tier | ABD odaklı, sosyal değil | Lokal premium tier |

### Kritik Pazar Bulgusu

> **Türkiye'de finans + sosyal medya = KİMSE YOK.**  
> Midas 80 milyon dolar aldı ama bir gram içerik üretimi yok.  
> Bu boşluk Marketly'nin var olma sebebi ve en büyük rekabet avantajı.

### Büyüme Verileri (Referans)

- TradingView: %60 büyümesi creator-driven (Pine Script marketplace)
- eToro + StockTwits ortaklığı (Ocak 2025): sosyal + trading birleşimi trendini doğruluyor
- Türkiye fintech pazarı: 2025'te en büyük büyüme gösteren pazar (Midas Series B = kanıt)
- Abonelik uygulamalarında top %5 = bottom %25'ten 400x daha fazla kazanıyor

---

## 3. GELİR MODELİ

### Katman 1 — Abonelik (Temel & Öngörülebilir Gelir)

```
MARKETLY FREE
─────────────
• Temel fiyat takibi
• Günde 3 sinyal görüntüleme
• 2 fiyat alarmı
• Standart chart (line)
• Reklam gösterilir

MARKETLY PRO — ₺149/ay veya ₺999/yıl (2 ay bedava)
────────────────────────────────────────────────────
• Sınırsız sinyal takibi
• Sınırsız fiyat alarmı
• Candlestick + teknik çizim araçları
• Portföy PDF raporu (haftalık)
• MarketAI asistan (sınırsız)
• Creator ücretli paketlerine erişim
• Reklamsız deneyim
• "PRO" profil rozeti

MARKETLY ELİTE — ₺399/ay (kurumsal yakın)
───────────────────────────────────────────
• Pro'nun her şeyi +
• API erişimi (portföy otomasyonu)
• Öncelikli müşteri desteği
• Broker entegrasyonu (direkt işlem)
• "ELİTE" rozet + öne çıkarma
```

### Katman 2 — Creator Economy (Viral Büyüme + Gelir)

```
ANALİST MARKETPLACE
────────────────────
Analist → Aylık sinyal paketi oluşturur (örn: ₺79/ay)
Kullanıcı abone olur
Platform %20 pay keser

ÖRNEK HESAP:
  500 abone × ₺79 = ₺39.500/ay (analist geliri)
  Marketly payı: ₺7.900/ay (TEK analistten!)
  
  100 analist × ortalama ₺3.000/ay Marketly payı = ₺300.000/ay
```

### Katman 3 — Broker Ortaklıkları (Pasif Komisyon)

```
Kullanıcı "Kopyala" butonuna bastığında → partner broker'a yönlendirme
Her yeni funded hesap → ₺50-200 referans komisyonu

Hedef ortaklar:
  • Midas (Türkiye, hisse/borsa)
  • Binance (kripto, referral %40 komisyon)
  • eToro (uluslararası)
```

### Katman 4 — In-App Purchases (Sanal Ekonomi)

```
MARKETCOIN (Sanal Para)
───────────────────────
Kazanma: Günlük görevler, streak, rozet
Harcama: Creator'a hediye, premium içerik, özel rozet
Satın alma: ₺19.99 = 500 MC, ₺49.99 = 1500 MC
```

---

## 4. MİMARİ KARARLAR

### Seçilen Teknoloji Stack'i

```
FRONTEND (Mevcut)         BACKEND (Eklenecek)           3RD PARTY SERVİSLER
─────────────────         ───────────────────           ───────────────────
React Native 0.76.5   →   Supabase                  →   CoinGecko API (kripto)
Expo ~52.0.0              ├─ PostgreSQL (DB)             Alpha Vantage (hisse)
TypeScript ~5.3           ├─ Supabase Auth               ExchangeRate-API (döviz)
React Navigation v7       ├─ Supabase Realtime           Metals-API (altın/petrol)
                          ├─ Supabase Storage            Cloudflare R2 (video depo)
                          └─ Edge Functions              Cloudflare Stream (CDN)
                                                         OpenAI gpt-4o-mini (AI)
                                                         RevenueCat (abonelik)
                                                         Agora SDK (canlı yayın)
                                                         Expo Push Notifications
```

### Neden Supabase?

- PostgreSQL + Auth + Realtime + Storage = tek paket
- **0₺** başlangıç (500MB DB, 1GB storage, 50K auth user free tier)
- Row-level security ile güvenli
- Realtime feed için WebSocket desteği native
- TypeScript SDK mevcut, Expo ile sorunsuz

### Tahmini Aylık Altyapı Maliyeti

| Servis | Kullanım | Maliyet |
|---|---|---|
| Supabase | Free tier (1000 kullanıcıya kadar) | 0₺ |
| CoinGecko | Free tier (30 req/dk) | 0₺ |
| Cloudflare R2 | 10GB/ay free | 0₺ |
| Cloudflare Stream | 1000 dk/ay $5 | ~₺160 |
| OpenAI | ~5000 req/ay gpt-4o-mini | ~₺160 |
| RevenueCat | Ücretsiz ($2.5K gelire kadar) | 0₺ |
| **TOPLAM** | **1000 aktif kullanıcı** | **~₺320/ay** |

---

## 5. SPRINT PLANI — 8 SPRINT / 16 HAFTA

> Her sprint 2 haftadır. Sıralama kasıtlıdır — her sprint bir öncekinin üstüne oturur.  
> Geliştirici: 1 kişi (AI destekli). Toplam süre: 4 ay.

---

### SPRINT 1 — BACKEND ALTYAPI & GERÇEK VERİ ✅ TAMAMLANDI
**Süre:** 2 Hafta | **Öncelik:** 🔴 KRİTİK

**Hedef:** Uygulamayı mock veriden kurtarmak. Bu sprint olmadan hiçbir şey gerçek değil.

#### Yapılacaklar:

**Supabase Kurulum**
- [x] `supabase` projesi oluştur (supabase.com)
- [x] `@supabase/supabase-js` paketi ekle
- [x] `lib/supabase.ts` — client başlat
- [x] `.env` — `SUPABASE_URL` + `SUPABASE_ANON_KEY`

**Veritabanı Şeması**
```sql
-- Kullanıcılar
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  tier TEXT DEFAULT 'free',         -- free | pro | elite
  verified BOOLEAN DEFAULT FALSE,
  follower_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  signal_accuracy FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Takip sistemi
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Varlık (asset) tablosu
CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,   -- crypto | stocks | commodities | forex
  logo_url TEXT,
  logo_color TEXT,
  logo_letter TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fiyat snapshot (önbellek)
CREATE TABLE asset_prices (
  asset_id TEXT REFERENCES assets(id),
  price FLOAT NOT NULL,
  change_percent FLOAT,
  volume TEXT,
  market_cap TEXT,
  spark FLOAT[],            -- 10 noktalı sparkline
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (asset_id)
);

-- Sinyaller
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id),
  asset_id TEXT REFERENCES assets(id),
  direction TEXT NOT NULL,   -- BUY | SELL | HOLD
  confidence INT NOT NULL,   -- 1-5
  entry_price FLOAT,
  target_price FLOAT,
  stop_loss FLOAT,
  timeframe TEXT,
  rationale TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  copies_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist
CREATE TABLE watchlists (
  user_id UUID REFERENCES profiles(id),
  asset_id TEXT REFERENCES assets(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, asset_id)
);

-- Portföy
CREATE TABLE portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  asset_id TEXT REFERENCES assets(id),
  quantity FLOAT NOT NULL,
  avg_cost FLOAT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fiyat alarmları
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  asset_id TEXT REFERENCES assets(id),
  target_price FLOAT NOT NULL,
  direction TEXT NOT NULL,   -- above | below
  triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Gerçek Auth Entegrasyonu**
- [x] `AuthContext.tsx` — Supabase Auth ile yeniden yaz
- [x] Email + şifre kayıt/giriş (gerçek) — handle_new_user trigger düzeltildi
- [ ] Google OAuth (Supabase üzerinden) — ileriki sprintte
- [x] Session persistence (SecureStore)
- [x] Profil otomatik oluşturma (trigger) — exception-safe yapıldı

**Gerçek Fiyat Verisi Servisi**
- [x] `hooks/useMarketPrices.ts` + `services/marketService.ts` oluşturuldu
- [x] CoinGecko API → 15 kripto coin (BTC, ETH, BNB, SOL, XRP...) — her 30s
- [x] Twelve Data API → AAPL, NVDA, TSLA, MSFT, AMZN, META, GOOGL, NFLX
- [x] Frankfurter/ECB API → USD/TRY, EUR/TRY, EUR/USD, GBP/TRY — her 5dk
- [x] Twelve Data → XAU/USD (Altın) — her 5dk
- [x] Her 30 saniyede bir Supabase `asset_prices` tablosunu güncelle
- [x] Supabase Realtime → UI anında güncellensin
- [x] Node.js backend (Express + PM2) — DigitalOcean 134.122.84.92'de 7/24

**Değiştirilecek Dosyalar:**
- [x] `screens/MarketsScreen.tsx` → gerçek fiyat hook'u eklendi
- [x] `contexts/AuthContext.tsx` → Supabase Auth
- [ ] `screens/AssetDetailScreen.tsx` → gerçek fiyat + tarihsel veri — Sprint 2'de

**Paketler:**
```bash
npx expo install @supabase/supabase-js  ✅
npx expo install expo-secure-store      ✅
npx expo install @react-native-async-storage/async-storage  ✅
```

**Ekstra (Planda Yoktu, Yapıldı):**
- [x] Auto-hide tab bar animasyonu (`TabBarContext.tsx`)
- [x] Animated header scroll animasyonu (HomeScreen, MarketsScreen, DiscoverScreen)
- [x] Shorts tam ekran modal
- [x] Pull-to-refresh + pulsing live dot
- [x] AnimatedCustomTabBar + tab press scale animasyonu

---

### SPRINT 2 — ÖDEMESİSTEMİ & PRO ÜYELİK ✅ TAMAMLANDI (UI Katmanı)
**Süre:** 2 Hafta | **Öncelik:** 🔴 KRİTİK

**Hedef:** İlk geliri başlatmak. UI zaten hazır, sadece bağlanacak.

#### Yapılacaklar:

**RevenueCat Kurulum**
- [ ] `react-native-purchases` paketi ekle
- [ ] App Store Connect → Subscription Group oluştur
  - `marketly_pro_monthly` — ₺149.99/ay
  - `marketly_pro_yearly` — ₺999.99/yıl
  - `marketly_elite_monthly` — ₺399.99/ay
- [ ] Google Play Console → Subscriptions
- [ ] RevenueCat dashboard → entitlement'lar tanımla
- [ ] `lib/purchases.ts` — RevenueCat client

**Paywall Ekranı (Yeni Ekran)**
- [x] `screens/PaywallScreen.tsx` oluşturuldu
  - Animasyonlu gradient başlık + "Marketly Pro" logosu (glow efekti)
  - 6 özelliği listeleyen kart (ikon + başlık + açıklama)
  - Aylık / Yıllık toggle, yıllıkta "2 ay bedava" badge
  - "7 Gün Ücretsiz Dene" CTA butonu
  - Legal linkler + satın alma geri yükleme
- [x] `hooks/useSubscription.ts` — `isPro`, `isElite`, `isFree`, `hasFeature()`

**Pro Gate Sistemi**
- [x] `components/ProGate.tsx` oluşturuldu — tam overlay + subtle mod
- [ ] Uygulama içinde kapılara yerleştir (sprint devam):
  - `AssetDetailScreen.tsx` → gelişmiş çizim araçları
  - `MarketsScreen.tsx` → sinyal limiti

**Supabase Abonelik Sync**
- [ ] RevenueCat webhook → Supabase Edge Function
  - Ödeme başarılı → `profiles.tier = 'pro'`
  - İptal → `profiles.tier = 'free'`
- [ ] `RevenueCat.addCustomerInfoUpdateListener` → anlık güncelleme

**Değiştirilecek Dosyalar:**
- [x] `screens/SettingsScreen.tsx` → Pro banner + tier badge + Paywall butonu eklendi
- [x] `navigation/RootNavigator.tsx` → `Paywall` screen eklendi
- [x] `screens/AssetDetailScreen.tsx` → Supabase realtime fiyat + flash animasyon

**Paketler:**
```bash
npx expo install react-native-purchases  ← henüz eklenmedi (App Store hesabı gerekli)
```

---

### SPRINT 3 — VİDEO & İÇERİK SİSTEMİ
**Süre:** 2 Hafta | **Öncelik:** 🔴 KRİTİK

**Hedef:** Creator economy'nin çalışması için gerçek video upload ve oynatma.

#### Yapılacaklar:

**Video Upload Pipeline**
- [ ] `expo-video` veya `expo-av` — video oynatma
- [ ] `ImagePicker` → Cloudflare R2 upload
  - `services/uploadService.ts` — multipart upload
  - Upload progress bar (UI'da göster)
  - Thumbnail otomatik oluşturma
- [ ] Cloudflare Stream entegrasyonu
  - Video transcoding (otomatik)
  - HLS stream URL'i Supabase'e kaydet
  - Thumbnail URL'i kaydet

**Supabase Posts Tablosu**
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,         -- video | short | signal | live
  title TEXT,
  description TEXT,
  video_url TEXT,             -- Cloudflare Stream HLS URL
  thumbnail_url TEXT,
  duration INT,               -- saniye
  asset_tags TEXT[],
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,  -- Pro gerektirir mi
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_likes (
  user_id UUID REFERENCES profiles(id),
  post_id UUID REFERENCES posts(id),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES profiles(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Video Oynatma**
- [ ] `VideoDetailScreen.tsx` → gerçek HLS oynatma
- [ ] `ShortsScreen.tsx` → gerçek video oynatma (auto-play)
- [ ] Görünür olmayan videoları pause et (performans)
- [ ] Like/Yorum → Supabase gerçek kayıt

**Create Screen Gerçekleştirme**
- [ ] `CreateScreen.tsx` → Video/Short sekmesi gerçek upload başlatır
- [ ] Sinyal oluşturma → Supabase `signals` tablosuna yazar
- [ ] Yayın bilgisi → `posts` tablosuna yazar

**Değiştirilecek Dosyalar:**
- `screens/VideoDetailScreen.tsx` — gerçek oynatma + yorum
- `screens/ShortsScreen.tsx` — gerçek video + like
- `screens/CreateScreen.tsx` — gerçek upload
- `data/mockVideos.ts` → Supabase'den çekme (mock fallback)

**Paketler:**
```bash
npx expo install expo-video
npx expo install expo-file-system
```

---

### SPRINT 4 — SOSYAL KATMAN
**Süre:** 2 Hafta | **Öncelik:** 🟠 YÜKSEK

**Hedef:** Uygulamayı gerçek sosyal medyaya dönüştürmek.

#### Yapılacaklar:

**Gerçek Takip Sistemi**
- [x] `hooks/useFollow.ts` → takip et/çıkar (Supabase) ✅ TAMAMLANDI
  - Optimistik güncelleme + rollback
  - followersCount / followingCount gerçek zamanlı
- [x] `ProfileScreen.tsx` → followersCount/followingCount gerçek veri ✅ TAMAMLANDI
- [x] Profil tabı → kendi postları gösteriliyor ✅ TAMAMLANDI
- [x] Gönderi paylaş butonu profilden ✅ TAMAMLANDI

**Sosyal Post Sistemi**
- [x] `hooks/usePosts.ts` — CRUD + beğeni sistemi (Supabase) ✅ TAMAMLANDI
- [x] `components/PostCard.tsx` — beğeni animasyonu, etiket, menü ✅ TAMAMLANDI
- [x] `components/CreatePostModal.tsx` — asset tag, karakter sayacı ✅ TAMAMLANDI
- [x] `CreateScreen.tsx` → "Gönderi" tipi eklendi ✅ TAMAMLANDI
- [x] `HomeScreen.tsx` → "Takip" sekmesine gerçek postlar + compose bar ✅ TAMAMLANDI
- [x] `AssetDetailScreen.tsx` → gerçek Supabase fiyat alarmı modal ✅ TAMAMLANDI

**Kişiselleştirilmiş Feed**
- [ ] `HomeScreen.tsx` → "Takip Ettiklerim" sekmesi gerçek veri
  - Takip edilen kullanıcıların son postları
  - Supabase `posts` JOIN `follows` sorgusu
- [ ] "Senin İçin" algoritması:
  - Kullanıcının favori kategorileri (onboarding'den)
  - Beğendiği asset tag'lerine göre ağırlıklı
  - Popülerlik skoru (views + likes + comments)

**Yorum Sistemi**
- [ ] `VideoDetailScreen.tsx` → gerçek yorum gönderme
- [ ] Supabase Realtime → yeni yorumlar anlık gelir
- [ ] Yorum beğenme

**Bildirim Sistemi**
- [x] `hooks/useNotifications.ts` — Supabase CRUD + Realtime ✅ TAMAMLANDI
- [x] `NotificationsScreen.tsx` → gerçek Supabase bildirimleri + mock fallback ✅ TAMAMLANDI
- [x] `ADD_TABLES.sql` → notifications tablosu ✅ TAMAMLANDI
- [ ] Supabase Edge Function → tetikleyici olaylar:
  - Biri seni takip etti
  - Birileri sinyalini kopyaladı
  - Videon beğenildi
  - Portföyündeki varlık %5+ hareket etti
  - Fiyat alarmin tetiklendi
- [ ] `expo-notifications` → push gönderimi
- [ ] `NotificationsScreen.tsx` → Supabase'den gerçek bildirimler

**Fiyat Alarmı Gerçekleştirme**
- [x] `hooks/usePriceAlerts.ts` — Supabase CRUD ✅ TAMAMLANDI
- [x] `screens/PriceAlertsScreen.tsx` — Alarm listesi + ekle/sil ✅ TAMAMLANDI
- [x] `ADD_TABLES.sql` — price_alerts, portfolio_holdings tabloları ✅ TAMAMLANDI
- [ ] Supabase Edge Function → her 1 dk fiyat kontrolü (sonraki sprint)
- [ ] Alarm tetiklenince push notification gönder (sonraki sprint)

**Değiştirilecek Dosyalar:**
- `screens/HomeScreen.tsx` — gerçek feed algoritması
- `screens/ProfileScreen.tsx` — gerçek takip sistemi
- `screens/VideoDetailScreen.tsx` — gerçek yorumlar
- `screens/NotificationsScreen.tsx` — gerçek bildirimler
- `contexts/AuthContext.tsx` — kullanıcı profil bilgileri genişletilir

---

### SPRINT 5 — GAMİFİKASYON & RETENTION
**Süre:** 2 Hafta | **Öncelik:** 🟠 YÜKSEK

**Hedef:** Kullanıcıyı her gün uygulamaya çeken mekanizmalar.

#### Yapılacaklar:

**Rozet Sistemi**
```sql
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  condition_type TEXT,    -- follower_count | signal_accuracy | streak | etc.
  condition_value INT
);

CREATE TABLE user_badges (
  user_id UUID REFERENCES profiles(id),
  badge_id TEXT REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);
```

Rozetler:
- 🥇 **İlk Adım** — İlk sinyali paylaş
- 📈 **Yükselen Yıldız** — 100 takipçi
- 🔥 **7 Gün Streak** — 7 gün üst üste giriş
- 💎 **Uzman Analist** — %70+ isabetlilik (50+ sinyal)
- 👥 **Trend Analist** — 1000 takipçi
- 🏆 **Haftalık Şampiyon** — Haftanın en çok kopyalanan sinyali

**Günlük Görev Sistemi**
- [x] `components/DailyTasksCard.tsx` — HomeScreen'e eklendi ✅ TAMAMLANDI
- [ ] Görevler:
  - "3 haber oku" → +50 MC
  - "1 sinyal paylaş" → +100 MC
  - "5 video izle" → +30 MC
  - "Watchlist'e 1 varlık ekle" → +20 MC
- [ ] Gece yarısı sıfırlama (UTC+3)
- [ ] Streak bonusu: 7. gün 3x, 30. gün 10x

**MarketCoin (Sanal Para)** ✅ TAMAMLANDI
- [x] `hooks/useMarketCoin.ts` — Supabase wallet + transaction history ✅
- [x] `screens/MarketCoinScreen.tsx` — Bakiye, kazanma/harcama yolları, tarih ✅
- [x] `DailyTasksCard.tsx` → gerçek MC earn() entegrasyonu ✅
- [x] `ADD_TABLES.sql` — marketcoin_wallet + marketcoin_transactions tabloları ✅
- [x] `SettingsScreen.tsx` — MarketCoin kısayolu ✅
- [ ] IAP: ₺19.99 = 500 MC, ₺49.99 = 1500 MC (gelecek sprint)

**Rozet Sistemi** ✅ UI TAMAMLANDI
- [x] `components/BadgesRow.tsx` — 10 rozet, shimmer animasyonu, compact mod ✅
- [x] `ProfileScreen.tsx` → BadgesRow entegrasyonu ✅
- [x] `ADD_TABLES.sql` — badges + user_badges tabloları ✅
- [ ] Supabase trigger ile otomatik rozet kazanma (gelecek sprint)

**Haftalık Liderboard**
- [x] `screens/LeaderboardScreen.tsx` oluşturuldu ✅ TAMAMLANDI

**Portföy Sistemi (Gerçek Supabase)**
- [x] `hooks/usePortfolio.ts` — holdings + P&L hesaplama ✅ TAMAMLANDI
- [x] `screens/PortfolioScreen.tsx` — tam portföy yönetimi ekranı ✅ TAMAMLANDI

**Portföy Paylaşım Kartı (Viral Loop)** ✅ TAMAMLANDI
- [x] `components/PortfolioShareCard.tsx` — önizleme kartı + Share API ✅
  - P&L, dağılım barı, kullanıcı adı, Marketly logo
  - Native Share API ile paylaşım
- [x] `PortfolioScreen.tsx` → "Paylaş" sekmesi ✅
- [ ] Referans sistemi: `profiles.referral_code` (gelecek sprint)

**Değiştirilecek Dosyalar:**
- `screens/HomeScreen.tsx` — DailyTasksCard eklenir
- `screens/ProfileScreen.tsx` — rozetler, MC cüzdanı, streak
- `navigation/RootNavigator.tsx` — LeaderboardScreen eklenir
- `screens/SettingsScreen.tsx` — referans kodu bölümü

---

### SPRINT 6 — YAPAY ZEKA & SİNYAL MARKETPLACE
**Süre:** 2 Hafta | **Öncelik:** 🟡 ORTA-YÜKSEK

**Hedef:** Farklılaştırıcı özellikler + creator monetizasyon başlatmak.

#### Yapılacaklar:

**MarketAI Asistan** ✅ UI TAMAMLANDI
- [x] `screens/AIAssistantScreen.tsx` oluşturuldu ✅
  - Chat arayüzü (WhatsApp benzeri bubble'lar)
  - Animated mesaj girişi + typing dots
  - 6 öneri sorusu (suggestion chips)
  - Canlı market context (anlık fiyatlar)
  - Demo fallback (Edge Function olmadan çalışır)
- [x] Rate limiting: Free = 5 sorgu/gün, Pro = sınırsız ✅
- [x] Navigation: modal olarak açılıyor ✅
- [x] `DiscoverScreen.tsx` → MarketAI banner ✅
- [x] `SettingsScreen.tsx` → MarketAI kısayolu ✅
- [ ] Supabase Edge Function `ai-chat` → OpenAI entegrasyonu (sunucu gerektirir)

**Sinyal Marketplace** ✅ UI TAMAMLANDI
- [x] `screens/SignalMarketplaceScreen.tsx` oluşturuldu ✅
  - 5 mock analist paketi (filtre, sıralama, detay modal)
  - Başarı %, abone sayısı, fiyat, son sinyaller
  - "Abone Ol" butonu → Pro/Elite gereksinimi yönlendirme
  - useTheme ile dark mode desteği
- [x] `navigation/RootNavigator.tsx` — SignalMarketplace eklendi ✅
- [x] `screens/DiscoverScreen.tsx` — Analistler sekmesi Marketplace banner ✅
- [x] `screens/SettingsScreen.tsx` — Sinyal Marketplace kısayolu ✅

**Asset Detay Yükseltmeleri** ✅ TAMAMLANDI
- [x] `AssetDetailScreen.tsx` — `RelatedVideos` yatay scroll ✅
- [x] `AssetDetailScreen.tsx` — `TopAnalystsRow` (4 analist + marketplace link) ✅

**Performans Optimizasyonları** ✅ TAMAMLANDI
- [x] `VideoCard` — `React.memo` ✅ (zaten vardı)
- [x] `SignalCard` — `React.memo` ✅ (zaten vardı)
- [x] `PostCard` — `React.memo` ✅ (zaten vardı)
- [x] `MarketsScreen` → `AssetRow` — `React.memo` ile sarıldı ✅

**Paketler:**
```bash
# OpenAI direkt çağırılmaz — Supabase Edge Function proxy kullanılır
# Güvenlik: API key'i istemcide tutma
```

---

### SPRINT 7 — DARK MODE & ONBOARDING & POLİSH
**Süre:** 2 Hafta | **Öncelik:** 🟠 YÜKSEK ✅ Kısmen Tamamlandı

**Hedef:** Kullanıcı deneyimini mükemmele taşımak, ilk izlenimi düzeltmek.

#### Yapılacaklar:

**Dark Mode** ✅ TAMAMLANDI
- [x] `constants/theme.ts` → `lightColors` + `darkColors` + `ColorPalette` tipi ✅
```typescript
export const darkColors = {
  bg: '#0D0D0D',
  bgCard: '#1A1A1A',
  bgInput: '#242424',
  text: '#F0F0F0',
  textSub: '#A0A0A0',
  textMuted: '#666666',
  border: '#2A2A2A',
  divider: '#1E1E1E',
  primary: '#00C853',        // aynı kalır
  danger: '#FF453A',
  // ...
};
```
- [x] `contexts/ThemeContext.tsx` — light/dark/system, AsyncStorage kalıcı ✅
- [x] `App.tsx` — ThemeProvider + NavigationContainer tema entegrasyonu ✅
- [x] `SettingsScreen.tsx` → Karanlık Mod toggle + Sistem Teması toggle ✅
- [x] `HomeScreen.tsx` → useTheme ile dinamik renkler ✅
- [x] `MarketsScreen.tsx` → useTheme ile dinamik renkler ✅
- [ ] Diğer ekranlar (DiscoverScreen, ProfileScreen, vb.) — kademeli geçiş

**Onboarding Flow (Yeni Ekranlar)**
- [x] `OnboardingScreen.tsx` → İlgi alanları seçimi (İçerik) ✅
- [x] `OnboardingScreen.tsx` → Seviye seçimi (Yeni Başlayan / Orta / Uzman) ✅
- [x] `AssetDetailScreen.tsx` → "AI'ya Sor" butonu ✅
- [ ] `screens/onboarding/FollowScreen.tsx` — önerilen analistleri takip et

**Mikro-Animasyonlar**
- [ ] Sayı sayaçları: Portföy değeri değişince animated counter
- [ ] Fiyat değişimi flash: Varlık fiyatı güncellenince yeşil/kırmızı flash
- [ ] Chart çizim animasyonu: Candlestick chart ilk yüklenişte animasyonlu çizilsin
- [ ] Rozet kazanma: Konfeti animasyonu (+ toast)
- [ ] Pull-to-refresh: Özel animasyonlu indicator (ticker sembolü dönsün)

**Skeleton Loaders**
- [ ] `components/SkeletonLoader.tsx` → zaten var, genişlet
- [ ] Feed yüklenirken video skeleton
- [ ] Market listesi yüklenirken asset skeleton
- [ ] Profil yüklenirken profil skeleton

**Değiştirilecek Dosyalar:**
- `constants/theme.ts` — dark palette
- `App.tsx` — ThemeProvider wrap
- Tüm ekranlar — theme hook kullanımı
- `navigation/RootNavigator.tsx` — Onboarding stack ekle

---

### SPRINT 8 — BROKER ENTEGRASYONU & CANLI YAYIN
**Süre:** 2 Hafta | **Öncelik:** 🟡 ORTA

**Hedef:** Gelir katmanlarını tamamlamak, flaghship özellikleri aktif etmek.

#### Yapılacaklar:

**Gerçek Canlı Yayın (Agora SDK)**
- [ ] `agora-react-native-rtm` veya `100ms` paketi
- [ ] `LiveScreen.tsx` → gerçek yayın başlatma
- [ ] Seyirci katılım (WebRTC)
- [ ] Soru-Cevap: Seyirciler yazıyor, host onaylıyor
- [ ] Sanal hediye gönderme (MarketCoin)
- [ ] Yayın kaydı → video olarak kaydedilir (Cloudflare)

**Binance API Entegrasyonu (Kripto)**
- [ ] `services/binanceService.ts`
- [ ] WebSocket bağlantısı → gerçek zamanlı kripto fiyatları
- [ ] Kullanıcı kendi API anahtarını girebilir (Elite tier)
- [ ] Portföy otomatik sync (API key ile)

**Broker Yönlendirme Sistemi**
- [ ] "Kopyala" butonu → `deeplink://broker/trade?asset=BTC&direction=BUY`
- [ ] Partner broker listesi yönetimi (admin panel)
- [ ] Referral tracking (UTM parameter)
- [ ] Supabase → referral conversion kaydı

**Uluslararasılaştırma (i18n)**
- [ ] `i18next` + `react-i18next` kurulum
- [ ] Türkçe (TR) — varsayılan
- [ ] İngilizce (EN) — hazır
- [ ] `SettingsScreen.tsx` → dil seçimi aktif

**Son Performans Optimizasyonları** ✅ Kısmen Tamamlandı
- [x] `React.memo` — VideoCard, SignalCard, AssetRow, PostCard ✅
- [ ] `FlatList` → `SectionList` dönüşümü (büyük listeler için)
- [ ] Image lazy loading + caching (`expo-image`)
- [ ] Bundle size analizi + tree shaking

---

## 6. TASARIMSAL GELİŞTİRMELER

### Sprint 7'de Yapılacak (Tam Liste)

#### Dark Mode Renk Paleti
```
Light                     Dark
──────────────────────    ──────────────────────
bg: #F2F3F7           →   bg: #0D0D0D
bgCard: #FFFFFF        →   bgCard: #1A1A1A
bgInput: #F4F5F8       →   bgInput: #242424
text: #0D0D0D          →   text: #F0F0F0
textSub: #5A5F6E       →   textSub: #A0A0A0
border: #E8EAF0        →   border: #2A2A2A
```

#### Asset Detay Sayfası Yükseltmeleri ✅ TAMAMLANDI
- [x] Topluluk sentiment bar (Bull/Bear oylama, animasyon) ✅
- [x] "Bu varlıkla ilgili videolar" yatay scroll (`RelatedVideos`) ✅
- [x] "Bu varlığı takip eden analistler" satırı (`TopAnalystsRow`) ✅
- [ ] Fib retracement seviyeleri (Pro) — gelecek sprint
- [ ] Analyst konsensüs fiyat hedefi — gelecek sprint

#### Creator Profili Yükseltmeleri
- Sinyal performans dashboard (isabetlilik %, toplam kazanç)
- "Abone Ol" butonu (ücretli sinyal paketleri için)
- Son 30 günlük sinyal geçmişi grafik

#### Ödeme Başarı Animasyonu
- Pro'ya geçişte konfeti
- Rozet kazanınca özel modal
- "Streak devam ediyor!" bildirimi

---

## 7. KULLANICI EDİNİM STRATEJİSİ

### Organik (0₺ Bütçe)

**Viral Loop #1 — Portföy Paylaşımı**
```
Kullanıcı "Bu ay %23 kazandım 📈" kartını Instagram'da paylaşır
→ Kart üzerinde referans kodu
→ Arkadaş indirir → kod sahibine +200 MC
→ Maliyet: 0₺ | Potansiyel: Sınırsız
```

**Viral Loop #2 — Sinyal Kartı Paylaşımı**
```
Her sinyal → "Bu sinyali Marketly'de takip et" butonlu kart
→ Twitter/X + Instagram uygun boyut
→ Analist kendi kanalında paylaşır → kitlesi gelir
```

**Creator-Led Growth**
```
İlk 50 doğrulanmış analist → 6 ay ücretsiz Pro
Onlar kendi 1.000-50.000 kitlelerini getirir
Maliyet: 50 × ₺149 × 6 = ₺44.700 (değer maliyeti)
Potansiyel getiri: 10.000 yeni kullanıcı
```

### Ücretli Edinim (Türkiye Avantajı)

**Devlet Teşviği (Karar No. 5447)**
```
Onaylı uygulama = reklam maliyetinin %60-70'i devlet destekli
15 milyon TL/yıl'a kadar kapsam
Platformlar: Meta Ads, Google UAC, TikTok Ads, AppLovin
```

**Hedef Kitle Segmentleri**
```
Segment 1: Finans içerik tüketicisi
  → Yaş: 22-40 | İlgi: Kripto, borsa haberler
  → Platform: Instagram, YouTube, Twitter
  → Mesaj: "Seyretmek yetmez, kazan"

Segment 2: Aktif yatırımcı
  → Yaş: 28-50 | Birikim: 10K+ TL
  → Platform: LinkedIn, Twitter
  → Mesaj: "Portföyünü toplulukla geliştir"

Segment 3: Genç yatırımcı başlangıç
  → Yaş: 18-28 | Platform: TikTok, Instagram
  → Mesaj: "Yatırımı oyun gibi öğren"
```

---

## 8. GELİR PROJEKSİYONU

### Senaryo A — Muhafazakâr

| Ay | Aktif Kullanıcı | Pro (%5) | Creator Market | Toplam |
|---|---|---|---|---|
| Ay 3 | 500 | 25 × ₺149 = ₺3.725 | ₺500 | **₺4.225/ay** |
| Ay 6 | 2.000 | 100 × ₺149 = ₺14.900 | ₺3.000 | **₺17.900/ay** |
| Ay 9 | 8.000 | 400 × ₺149 = ₺59.600 | ₺15.000 | **₺74.600/ay** |
| Ay 12 | 20.000 | 1.000 × ₺149 = ₺149.000 | ₺40.000 | **₺189.000/ay** |

### Senaryo B — Optimistik (Creator-Led Growth aktif)

| Ay | Aktif Kullanıcı | Pro (%8) | Creator Market | Broker Komisyon | Toplam |
|---|---|---|---|---|---|
| Ay 6 | 5.000 | 400 × ₺149 = ₺59.600 | ₺8.000 | ₺5.000 | **₺72.600/ay** |
| Ay 12 | 50.000 | 4.000 × ₺149 = ₺596.000 | ₺80.000 | ₺30.000 | **₺706.000/ay** |

---

## 9. TEKNİK BORÇ & DÜZELTİLECEKLER

Bu liste mevcut kodda düzeltilmesi gereken teknik sorunları içerir.

### Yüksek Öncelik (Sprint 1-2'de fix)

| Sorun | Dosya | Çözüm |
|---|---|---|
| `any` type kullanımı | RootNavigator.tsx | Proper navigation types |
| Mock data doğrudan import | Tüm ekranlar | Supabase hook'larına geç |
| Hardcoded string'ler | Tüm ekranlar | i18n entegrasyonu (Sprint 8) |
| `useAuth` içinde gerçek auth yok | AuthContext.tsx | Supabase Auth |
| HTTPS değil HTTP mock URL'ler | mockVideos.ts | Gerçek Cloudflare URL'leri |

### Orta Öncelik (Sprint 3-5'te fix)

| Sorun | Dosya | Çözüm |
|---|---|---|
| FlatList'te keyExtractor tutarsız | ShortsScreen.tsx | Stabil ID |
| ScrollView içinde FlatList | DiscoverScreen.tsx | SectionList |
| Büyük bileşen dosyaları | MarketsScreen.tsx (800+ satır) | Küçük bileşenlere böl |
| useEffect bağımlılık eksikleri | Birçok ekran | ESLint exhaustive-deps |
| Image caching yok | Tüm ekranlar | expo-image |

### Düşük Öncelik (Sprint 7-8'de fix)

| Sorun | Dosya | Çözüm |
|---|---|---|
| Accessibility (a11y) eksik | Tüm | accessibilityLabel ekle |
| Localization yok | Tüm | i18next Sprint 8'de |
| Error boundary yok | App.tsx | ErrorBoundary wrapper |
| Loading state'ler tutarsız | Birçok ekran | Merkezi loading system |

---

## BAŞLANGIÇ KARARI

> **Sprint 1'den başlanacak: Backend Altyapı & Gerçek Veri**

Gerekçe:
1. Sprint 2 (Para sistemi), Sprint 3 (Video), Sprint 4 (Sosyal) — hepsi backend olmadan çalışmaz
2. Supabase kurulumu ve auth entegrasyonu en fazla 3-4 gün sürer
3. Gerçek fiyat verisi uygulamayı hemen "canlı" gösterir — motivasyon artırır
4. Bu sprint tamamlanırsa app store'a "beta" sürümü çıkarılabilir

**Sprint 1 Başlangıç için Gerekli:**
- Supabase hesabı (supabase.com — ücretsiz)
- CoinGecko API key (coingecko.com — ücretsiz)
- Alpha Vantage API key (alphavantage.co — ücretsiz)
- `.env` dosyası yapılandırması

---

*Bu plan yaşayan bir belgedir. Her sprint sonunda güncellenecektir.*
