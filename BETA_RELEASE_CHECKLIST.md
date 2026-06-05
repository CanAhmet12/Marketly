# BETA RELEASE CHECKLIST

**Proje:** Marketly WEB  
**Tarih:** 5 Haziran 2026  
**Karar (sprint sonu):** `READY_FOR_BETA` — Beta Unblocker sprint (5 Haziran 2026) ile SEC-001 kapandı

---

## Tamamlananlar

- [x] WEB core feed (`fetch-home-feed.ts`) — `posts` + `profiles` + pagination
- [x] Signals catalog (`fetch-signals-feed.ts`) — live
- [x] Creators directory — `get_creators_directory` RPC + hook
- [x] Studio analytics — `get_studio_analytics_bundle` RPC (auth required)
- [x] Notifications — `fetch-notifications.ts`
- [x] Messages — `fetch-conversations.ts`
- [x] Channel/profile — `fetch-channel-*.ts`
- [x] Upload post/signal — storage + insert (write-gate gated)
- [x] Settings persistence hook — write-gate gated
- [x] Market news / economic calendar — live fetch hooks + empty states
- [x] Home editorial chips — live movers + trending signals
- [x] Subscriptions catalog — `profiles.subscription_price` (no fake checkout)
- [x] Write-gate standard (`isWebWriteEnabled`) — default blocked
- [x] comments RLS fix deployed (P0-002) — anon PATCH `*/0` verified
- [x] video_comments RLS fix deployed (P0-003) — anon PATCH `*/0` verified
- [x] TypeScript clean (`npx tsc --noEmit`)

---

## Eksikler (Beta öncesi zorunlu)

- [ ] **P0-005** `P0_005_ASSET_PRICES_RLS_FIX.sql` deploy — anon `asset_prices` UPDATE kapat
- [ ] BTC fiyatı VPS updater ile doğrula (readiness probe `999999` yazdı — kontrol et)
- [ ] `DATA_FEED_SPRINT.sql` deploy doğrulaması (`market_news` unique + `job_runs`)
- [ ] `fetch-market-news` cron schedule (Supabase Dashboard)
- [ ] `NEXT_PUBLIC_WEB_WRITE_ENABLED=true` beta politikası netleştir (hangi write'lar açık?)
- [ ] Production env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Agora live: `NEXT_PUBLIC_AGORA_APP_ID` (+ edge `agora-token` secrets)

---

## Eksikler (Beta sonrası / P1)

- [ ] Economic calendar ingest — `TRADING_ECONOMICS_KEY` + `fetch-economic-calendar` deploy
- [ ] Payment provider — subscriptions checkout
- [ ] Social discussion/rooms repository — channel teasers live
- [ ] Close friends — `live_sparse` → real tables
- [ ] Studio economy hub — mock assembly
- [ ] `fetch-home-sections.ts` wire (dosya var, import yok)
- [ ] `fetch-market-assets.ts` — `.limit()` ekle (unbounded select)
- [ ] Observability — `job_runs` tablosu + dashboard

---

## Manuel Doğrulamalar

### Güvenlik (anon key)

```text
1. PATCH asset_prices?asset_id=eq.BTC → 401/0 rows (P0-005 sonrası)
2. PATCH comments?id=eq.<id> → Content-Range */0
3. PATCH video_comments?id=eq.<id> → Content-Range */0
4. Client bundle'da SERVICE_ROLE yok (grep build output)
```

### Anon user flows

```text
1. / — feed yüklenir, chips boş veya live data
2. /creators — RPC directory listesi
3. /signals — signals feed
4. /market-news — tablo boşsa empty state (veri varsa kartlar)
5. /economic-calendar — empty state veya events
6. /markets/category/crypto — asset_prices
```

### Authenticated user flows

```text
1. Login → /settings kaydet (WEB_WRITE_ENABLED=true iken)
2. /watchlist — watchlists tablosu
3. /price-alerts — price_alerts tablosu
4. /notifications — notifications tablosu
```

### Creator flows

```text
1. /upload — post insert (write enabled)
2. /upload signal — insert-signal.ts
3. /studio/analytics — RPC (logged in owner)
4. /studio/content/[id]/edit — save (write-gate)
```

### Edge / cron

```text
1. POST /functions/v1/fetch-market-news → inserted > 0 (unique index sonrası)
2. pg_cron jobs: refresh-materialized-views, cleanup-expired-stories, ...
3. VPS price API — asset_prices updated_at < 5 min
```

---

## Rollback Planı

1. **WEB deploy rollback:** Önceki Vercel/hosting build'e dön; `NEXT_PUBLIC_USE_MOCK=true` acil önizleme (prod'da önerilmez)
2. **SQL rollback:** Her migration dosyasında rollback notu var; `asset_prices` için eski policy geri ekleme **güvenlik riski** — yapma
3. **Edge function:** Supabase Dashboard → Functions → önceki versiyon
4. **Write-gate:** `NEXT_PUBLIC_WEB_WRITE_ENABLED` kaldır veya `false` — tüm mutation'lar client'ta bloke

---

## Deploy Sırası (önerilen)

| # | Adım | Dosya / Kaynak |
|---|------|----------------|
| 1 | SQL güvenlik | `P0_005_ASSET_PRICES_RLS_FIX.sql` |
| 2 | SQL data feed | `DATA_FEED_SPRINT.sql` (henüz yoksa) |
| 3 | Edge functions | `fetch-market-news`, mevcut 9 fn verify |
| 4 | Cron | `P2_006_CRON_JOBS.sql` jobs active mi kontrol |
| 5 | VPS price API | DigitalOcean :3001 health |
| 6 | WEB env | Supabase URL/anon, SITE_URL, write flag |
| 7 | WEB build | `npm run build` + smoke |
| 8 | Trigger ingest | `POST fetch-market-news` |
| 9 | Manuel matrix | Yukarıdaki checklist |

---

## Beta Go / No-Go

| Kriter | Durum |
|--------|-------|
| P0 güvenlik açığı yok | ❌ `asset_prices` anon UPDATE |
| Core anon flows çalışıyor | ✅ (empty states kabul) |
| Auth write paths kontrollü | ✅ write-gate |
| Data feeds minimum | 🟡 news kısmen, calendar boş |
| Operations (cron/price) | 🟡 VPS bağımlı |

**Go kararı:** P0-005 deploy + BTC fiyat doğrulama + write env politikası sonrası yeniden değerlendir.
