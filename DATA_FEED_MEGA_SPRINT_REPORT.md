# DATA FEED MEGA SPRINT REPORT

**Tarih:** 5 Haziran 2026  
**Kapsam:** WEB data feed audit + implementasyon + doğrulama  
**Karar:** `PARTIAL_BLOCKED`

---

## Executive Summary

WEB tarafında “UI var, veri yok” kalan alanlar için canlı Supabase fetch katmanı eklendi. Market news, economic calendar, home today/trending chips ve subscriptions catalog artık mock false modda gerçek tablo/RPC sorgularına bağlı; veri yoksa empty state veya gizleme davranışı uygulanıyor (mock fallback yok).

**Tamamlanan:** Repository/fetch/hook wiring, home chips, price feed doğrulaması, job_runs + market_news unique index SQL, economic calendar Edge Function skeleton.

**BLOCKED:** `market_news` ingest (upsert `onConflict: url` — unique index production'da henüz yok), economic calendar external API (secret yok), paid subscription checkout (ödeme sağlayıcı yok), `NEWS_API_KEY` / `TRADING_ECONOMICS_KEY` opsiyonel secret'lar.

---

## Preflight Audit

| Alan | Tablo | RLS SELECT | Edge Function | WEB (önce) | WEB (sonra) |
|------|-------|------------|---------------|------------|-------------|
| Market News | `market_news` ✅ | ✅ public | `fetch-market-news` ✅ deployed | Stub empty | `fetch-market-news.ts` + hooks |
| Economic Calendar | `economic_events` ✅ | ✅ public | ❌ → skeleton eklendi | Stub empty | `fetch-economic-calendar.ts` + hooks |
| Price Feed | `asset_prices` + `assets` ✅ | ✅ public | ❌ (VPS Node API) | ✅ live | ✅ doğrulandı |
| Subscriptions | `profiles.subscription_price` ✅ | ✅ public | — | Sparse stub | `fetch-membership-catalog.ts` |
| Home chips | RPC + tables | — | — | Mock only | `fetch-home-editorial-chips.ts` |
| Observability | — | — | — | Yok | `job_runs` SQL önerildi |

**Production row counts (anon, sprint sonu):**
- `market_news`: 0 (Edge Function fetched 10, inserted 0 — unique index eksik)
- `economic_events`: 0
- `asset_prices`: güncel (`updated_at` ≈ 2026-06-05T20:18Z)
- `profiles` with `subscription_price > 0`: 0

---

## Market News Feed

### Schema (mevcut — `FINAL_SQL.sql`)

```
id, title, description, url, image_url, source, published_at,
category, related_symbols[], sentiment, created_at
```

### WEB implementasyon

| Dosya | Değişiklik |
|-------|------------|
| `web/features/markets/fetch-market-news.ts` | Supabase query + `MarketNewsIntelligenceItem` mapper |
| `web/features/markets/hooks/use-market-newsroom.ts` | Live bundle hook |
| `web/features/markets/hooks/use-market-news-detail.ts` | Live detail by id |
| `web/features/markets/market-newsroom-page-client.tsx` | Stub kaldırıldı → empty state |
| `web/features/markets/market-news-detail-client.tsx` | Live fetch path |

### Davranış

- **Mock true:** `mock-markets-repository` + Unsplash (MC-003 korundu)
- **Mock false:** `market_news` tablosu; `image_url` varsa kullan, yoksa neutral SVG placeholder
- **Veri yok:** “Haber akışı boş” empty state

### Edge Function

- `fetch-market-news` deployed; RSS fallback 10 haber çekti (`fetched: 10, inserted: 0`)
- **Root cause:** `upsert(..., { onConflict: 'url' })` için `UNIQUE(url)` index production'da yok
- **Fix:** `DATA_FEED_SPRINT.sql` → `idx_market_news_url_unique`
- **Secrets:** `NEWS_API_KEY`, `ALPHA_VANTAGE_KEY` opsiyonel (yoksa RSS fallback)

---

## Economic Calendar Feed

### Schema (mevcut)

```
id, title, description, event_type, impact (low/medium/high),
scheduled_at, related_symbol, actual_value, forecast_value, previous_value
```

**Not:** Sprint spec'teki `country`, `currency`, `source_url` kolonları yok — mapper `related_symbol` + title heuristics ile `country` türetiyor.

### WEB implementasyon

| Dosya | Değişiklik |
|-------|------------|
| `web/features/markets/fetch-economic-calendar.ts` | Query + impact 1/2/3 mapper |
| `web/features/markets/hooks/use-economic-calendar-intelligence.ts` | Live bundle |
| `web/features/markets/hooks/use-economic-calendar-event-detail.ts` | Live detail |
| `economic-calendar-intelligence-page-client.tsx` | Live rows + DB actual/forecast/previous |
| `economic-calendar-event-detail-client.tsx` | Stub kaldırıldı |

### Edge Function

- **Yeni:** `supabase/functions/fetch-economic-calendar/index.ts`
- **BLOCKED:** `TRADING_ECONOMICS_KEY` veya `FINNHUB_API_KEY` yok — dummy data yazılmadı
- Tablo + WEB repository hazır; ingest secret bekliyor

---

## Price Feed Readiness

| Kontrol | Sonuç |
|---------|-------|
| `asset_prices` güncel mi? | ✅ `updated_at` dakikalar içinde |
| Güncelleyici | Node.js Price API — VPS `164.90.189.231:3001` |
| Supabase Edge cron | ❌ price update yok |
| `fetchMarketAssets` bağlantısı | ✅ JOIN `assets` |
| `price_alerts` | ✅ `fetch-price-alerts.ts` live |
| `watchlist` | ✅ live |
| Stale uyarı UI | Öneri: `updated_at > 5dk` → meta badge (bu sprintte uygulanmadı) |

**Smoke test:** anon REST → LINK, LTC, XLM fiyatları döndü.

**Backlog:** Price updater'ı Supabase Edge/cron'a taşıma (VPS bağımlılığı dokümante).

---

## Subscriptions Repository

| Kontrol | Sonuç |
|---------|-------|
| Stripe/Iyzico | ❌ yok |
| `user_subscriptions` tablosu | ❌ yok |
| `profiles.subscription_price` | ✅ var |
| Ödeme butonu | ❌ fake checkout yok (korundu) |

### Implementasyon

- `fetch-membership-catalog.ts` — `profiles` where `subscription_price > 0`
- `use-subscriptions-hub.ts` / `useMembershipDetail` hooks
- Live modda katalog boş → “Henüz ücretli üyelik tanımlayan üretici yok”
- Premium tier kartları fiyat gösterir; satın alma **coming soon** mesajı

**BLOCKED_PRODUCT_DECISION:** Ödeme entegrasyonu olmadan `user_subscriptions` aktif edilmeyecek.

---

## Home Today / Trending Chips

| Chip | Live kaynak | Boşsa |
|------|-------------|-------|
| Today | `asset_prices` movers (top \|change%\|) | Gizle |
| Trending | `get_top_signals` RPC | Gizle |
| Creators | `get_leaderboard_analysts` RPC (önceki sprint) | Gizle |
| Market strip | `fetchMarketAssets` movers | Mock pulse fallback |

**Dosyalar:** `fetch-home-editorial-chips.ts`, `use-home-editorial-chips.ts`, `build-editorial-rail.ts`, `build-market-strip-items.ts`, `home-editorial-home.tsx`

---

## Cron & Edge Function Readiness

| Job | Edge Fn | Cron SQL | Secret | Tablo | Deploy | Manuel trigger |
|-----|---------|----------|--------|-------|--------|----------------|
| Market news ingest | ✅ `fetch-market-news` | ❌ | `NEWS_API_KEY` opt | ✅ | ✅ | `POST /functions/v1/fetch-market-news` |
| Economic calendar | 🟡 skeleton | ❌ | `TRADING_ECONOMICS_KEY` **BLOCKED** | ✅ | 🟡 | `POST /functions/v1/fetch-economic-calendar` |
| Price update | ❌ (VPS) | ❌ | Price API env | ✅ | VPS | VPS script |
| Analytics aggregation | partial RPC | `P2_006` MV refresh | — | ✅ | ✅ | SQL cron |
| Stories expire | — | ✅ `P2_006` | — | ✅ | ✅ | cron |
| Notifications digest | — | ✅ `P2_006` | `RESEND_API_KEY` | ✅ | partial | cron |
| Scheduled posts | — | ❌ | — | — | — | — |
| Rate limit cleanup | — | ✅ `P2_006` | — | ✅ | ✅ | cron |

**Env örnekleri (server/edge only):**
```
NEWS_API_KEY=
ALPHA_VANTAGE_KEY=
TRADING_ECONOMICS_KEY=
FINNHUB_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # edge only
```

---

## Observability / Job Runs

**Yeni SQL:** `DATA_FEED_SPRINT.sql` → `job_runs` tablosu

```
id, job_name, status, started_at, finished_at, duration_ms,
rows_processed, error_message, metadata jsonb
```

- RLS: public SELECT, client INSERT yok (service role only)
- `fetch-market-news` Edge Function job_runs yazmayı dener (tablo yoksa sessiz fail)
- Production'a zorla uygulanmadı — kullanıcı SQL Editor'da deploy edecek

---

## Changed SQL Files

| Dosya | Açıklama |
|-------|----------|
| `DATA_FEED_SPRINT.sql` | `UNIQUE(url)` on `market_news`, `job_runs` table + RLS |

**Kullanıcı aksiyonu:** `DATA_FEED_SPRINT.sql` production'da çalıştır → `fetch-market-news` tekrar trigger.

---

## Changed Edge Functions

| Function | Değişiklik |
|----------|------------|
| `fetch-market-news` | `job_runs` log insert (graceful) |
| `fetch-economic-calendar` | **Yeni** — BLOCKED without API key |

---

## Changed WEB Files

**Markets**
- `fetch-market-news.ts`, `fetch-economic-calendar.ts`
- `hooks/use-market-newsroom.ts`, `use-market-news-detail.ts`, `use-economic-calendar-intelligence.ts`, `use-economic-calendar-event-detail.ts`
- `market-newsroom-page-client.tsx`, `market-news-detail-client.tsx`
- `economic-calendar-intelligence-page-client.tsx`, `economic-calendar-event-detail-client.tsx`

**Home**
- `fetch-home-editorial-chips.ts`, `hooks/use-home-editorial-chips.ts`
- `editorial/build-editorial-rail.ts`, `editorial/build-market-strip-items.ts`
- `visual/home-editorial-home.tsx`

**Subscriptions**
- `fetch-membership-catalog.ts`, `hooks/use-subscriptions-hub.ts`
- `subscriptions-hub-client.tsx`, `membership-detail-client.tsx`

**Lib**
- `lib/query-keys.ts` — yeni query key'ler

---

## Mock True / Mock False Behavior

| Feature | Mock true | Mock false |
|---------|-----------|------------|
| Market news | Mock bundle + Unsplash | `market_news` table / empty state |
| Economic calendar | Mock + extra rows | `economic_events` / empty state |
| Prices | Mock fixtures | `asset_prices` live |
| Home today/trending | `EDITORIAL_MOCK_*` | Live chips or hidden |
| Market strip | Home repo movers | `asset_prices` movers |
| Subscriptions | `mock-subscription-repository` | `profiles.subscription_price` catalog / empty |
| Creators rail | Mock | RPC (önceki sprint) |

**Kural:** Mock fallback production'a sızmadı.

---

## Security Review

| Kontrol | Sonuç |
|---------|-------|
| Service role client bundle'da | ✅ Yok |
| API keys client'ta | ✅ Yok |
| `market_news` RLS | ✅ public SELECT only |
| `economic_events` RLS | ✅ public SELECT only |
| `job_runs` RLS | ✅ SELECT only, no client write |
| Write-gate | ✅ Değişiklik yok |
| Fake payment flow | ✅ Yok |

---

## Validation Results

| Check | Sonuç |
|-------|-------|
| `npx tsc --noEmit` (web) | ✅ Pass |
| Lint (changed files) | ✅ Yeni error yok (tailwind uyarıları mevcut) |
| Production REST smoke | ✅ `asset_prices`, ✅ empty `market_news` |
| Edge `fetch-market-news` | ✅ 200, insert blocked (unique index) |
| APP | ✅ Dokunulmadı |

---

## Blocked Items

| ID | Item | Reason |
|----|------|--------|
| B-DF-001 | Market news production data | `UNIQUE(url)` index deploy edilmedi → upsert 0 insert |
| B-DF-002 | Economic calendar ingest | `TRADING_ECONOMICS_KEY` / `FINNHUB_API_KEY` yok |
| B-DF-003 | Paid subscription checkout | Stripe/Iyzico yok — `BLOCKED_PRODUCT_DECISION` |
| B-DF-004 | `NEWS_API_KEY` premium sources | Opsiyonel; RSS fallback mevcut |
| B-DF-005 | Price feed Edge migration | VPS bağımlılığı devam ediyor |
| B-DF-006 | `job_runs` production | SQL hazır, deploy bekliyor |

---

## Remaining Work

1. **Deploy `DATA_FEED_SPRINT.sql`** → trigger `fetch-market-news` → verify `market_news` rows
2. Set `TRADING_ECONOMICS_KEY` or `FINNHUB_API_KEY` → wire `fetch-economic-calendar` provider
3. Supabase cron for `fetch-market-news` (ör. `0 */2 * * *`)
4. Price API stale badge UI (`updated_at` threshold)
5. Payment provider seçimi → `user_subscriptions` schema + write-gate
6. `profiles.subscription_price > 0` seed veya creator onboarding

---

## Final Decision

### `PARTIAL_BLOCKED`

WEB data feed wiring tamamlandı; production veri akışı iki kritik bağımlılıkta bekliyor:
1. `DATA_FEED_SPRINT.sql` deploy (market news upsert)
2. Economic calendar API secret + provider wiring

Ödeme sistemi olmadan subscription catalog doğru şekilde “catalog only / coming soon” modunda.

**Sonraki sprint:** Production Readiness — SQL deploy + cron schedule + ingest validation loop.
