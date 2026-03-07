# api_structure.md — API Referansı

## Supabase Client Kurulumu

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
// Env: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON
```

## Sık Kullanılan Sorgular

```typescript
// Posts
supabase.from('posts')
  .select(`*, profiles!posts_user_id_fkey(username, full_name, avatar_url, tier, verified)`)
  .order('created_at', { ascending: false }).range(0, 19)

// Asset fiyatları
supabase.from('asset_prices')
  .select(`*, assets(id, symbol, name, category, logo_url, logo_color)`)

// Bildirimler
supabase.from('notifications').select('*')
  .eq('user_id', userId).order('created_at', { ascending: false }).limit(50)

// Takip kontrolü
supabase.from('follows').select('follower_id')
  .eq('follower_id', myId).eq('following_id', targetId).maybeSingle()
```

## RPC Fonksiyonları

```typescript
supabase.rpc('toggle_post_like',    { p_post_id: id })
supabase.rpc('toggle_signal_like',  { p_signal_id: id })
supabase.rpc('increment_viewers',   { stream_id: id })
supabase.rpc('decrement_viewers',   { stream_id: id })
```

## Realtime

```typescript
supabase.channel('ch_name')
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public',
    table: 'live_messages', filter: `stream_id=eq.${id}`
  }, callback)
  .subscribe()
```

## Storage

```typescript
supabase.storage.from('avatars').upload(path, blob, { contentType, upsert: true })
supabase.storage.from('avatars').getPublicUrl(path)
// Bucket'lar: avatars | videos | covers | stories
```

## Price API (Node.js)

```
Base URL: http://<sunucu>:3001

GET /health                          — durum kontrolü
GET /api/prices?category=crypto      — tüm fiyatlar (crypto|stocks|forex|commodities)
GET /api/prices/status               — cron job durumu
```

Response örneği:
```json
{ "success": true, "count": 42, "data": [
  { "id": "bitcoin", "symbol": "BTC", "price": 65000, "change_percent": 2.35, "spark": [...] }
]}
```

## Edge Functions

```
POST /functions/v1/ai-chat
Body: { "message": "...", "history": [...] }
Headers: Authorization: Bearer <SUPABASE_ANON_KEY>
Response: { "reply": "..." }

POST /functions/v1/check-price-alerts
(Parametresiz — Cron job tarafından her 5dk çağrılır)
```

## CoinGecko OHLC (AssetDetailScreen)

```
GET https://api.coingecko.com/api/v3/coins/{id}/ohlc?vs_currency=usd&days={days}
Response: [[timestamp, open, high, low, close], ...]
days: 1(1G) | 7(1H) | 30(1A) | 90(3A) | 365(1Y)
```

## Ortam Değişkenleri

```env
# .env (mobil)
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON=eyJ...
EXPO_PUBLIC_AGORA_APP_ID=xxxx

# backend/.env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...   # service_role key — RLS bypass (admin)
FINNHUB_API_KEY=xxxx
PORT=3001
NODE_ENV=production

# Supabase Secrets (Dashboard)
OPENAI_API_KEY=sk-...
```

---

## Backend API (Price Service)

**Base URL:** `http://<sunucu-ip>:3001` veya production'da `https://api.marketly.app`

**Teknoloji:** Node.js 18+ / Express.js / PM2

**Görev:** Kripto/hisse/döviz/emtia fiyatlarını periyodik olarak çeker, Supabase `asset_prices` tablosuna yazar.

### Endpoint'ler

```bash
GET /health
# Sunucu durum kontrolü
Response: { "status": "ok", "uptime": "3600s" }

GET /api/prices
# Tüm güncel fiyatlar
Query: ?category=crypto|stocks|forex|commodities
Response: {
  "success": true,
  "count": 42,
  "data": [
    { "id": "bitcoin", "symbol": "BTC", "price": 65000.50, "change_percent": 2.35, "spark": [...] }
  ]
}

GET /api/prices/status
# Cron job durumu
Response: { "running": true, "lastRun": "2026-03-07T10:00:00Z", "nextRun": "..." }
```

### Mobil App Entegrasyonu

```typescript
// hooks/useMarketPrices.ts
const API_URL = 'http://<sunucu-ip>:3001/api/prices';
const response = await fetch(API_URL);
const { data } = await response.json();
```

**Sunucu IP değişirse bu hook'u güncelle.**

### Cron Zamanlaması (src/jobs/priceJob.js)

- Kripto: her 2 dakika (`*/2 * * * *`)
- Hisse: her 5 dakika (`*/5 * * * *`)
- Döviz: her 10 dakika (`*/10 * * * *`)
- Emtia: her 15 dakika (`*/15 * * * *`)

### Dış API'ler (Rate Limit)

- **CoinGecko:** 50 req/min (ücretsiz) → Kripto fiyat + OHLC
- **Yahoo Finance:** Sınırsız (ücretsiz) → Hisse fiyatları
- **Finnhub:** 60 req/min (ücretsiz, API key gerekli) → Borsa verileri

**Not:** Rate limit aşarsan (429) cron interval'i uzat.

### Komutlar (DigitalOcean sunucuda)

```bash
ssh root@<sunucu-ip>
cd /root/Marketly/backend

# İlk kurulum
npm install
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Bakım
pm2 logs marketly-api      # Canlı log izle
pm2 status                 # Durum kontrol
pm2 restart marketly-api   # Yeniden başlat
```

**Detaylı dokümantasyon:** `backend/README.md`
