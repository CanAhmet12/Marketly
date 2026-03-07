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
SUPABASE_SERVICE_KEY=eyJ...
FINNHUB_API_KEY=xxxx

# Supabase Secrets (Dashboard)
OPENAI_API_KEY=sk-...
```
