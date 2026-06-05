# BETA OPERATIONS RUNBOOK

**Proje:** Marketly  
**Tarih:** 5 Haziran 2026  
**Kapsam:** Kapalı beta operasyonları (WEB + Supabase + VPS)

---

## 1. Günlük sağlık kontrolleri

| Kontrol | Komut / Yol | Beklenen |
|---------|-------------|----------|
| Price API | `GET http://164.90.189.231:3001/health` | `200 {"status":"ok"}` |
| BTC fiyat tazeliği | `GET /rest/v1/asset_prices?asset_id=eq.BTC&select=price,updated_at` | `updated_at` < 5 dk |
| Market news | `GET /rest/v1/market_news?select=id&limit=1` | ≥ 1 row (cron sonrası) |
| Edge news ingest | `POST /functions/v1/fetch-market-news` | `inserted` ≥ 0 |
| Anon fiyat güvenliği | `PATCH asset_prices` (anon) | `Content-Range: */*`, body `[]`, fiyat değişmez |

---

## 2. Price feed (VPS)

| Öğe | Değer |
|-----|-------|
| Aktif host | `164.90.189.231:3001` |
| Eski host | `134.122.84.92:3001` — **timeout (kullanma)** |
| Güncelleme | ~30 sn döngü (crypto majors) |
| Yazma yolu | Service role / backend (RLS bypass) |

**Stale uyarı:** `updated_at` > 24 saat olan semboller (ör. XAG, XAU — 2026-04-14) beta'da gizlenebilir veya VPS kapsamına alınır.

**Acil müdahale:** VPS down → `asset_prices` donar; WEB son bilinen fiyatı gösterir. PM2 restart runbook VPS SSH üzerinden.

---

## 3. Market news cron (önerilen)

Supabase Dashboard → Cron Jobs:

```text
Schedule: 0 */2 * * *   (her 2 saat)
Method: POST
URL: https://ufljsnqxvqzichwlpfgy.supabase.co/functions/v1/fetch-market-news
Headers: Authorization: Bearer <anon_or_service_key>
```

**Doğrulama:** `market_news` row count artar; aynı `url` duplicate olmaz (unique index).

---

## 4. SQL cron (`P2_006_CRON_JOBS.sql`)

| Job | Schedule | Durum |
|-----|----------|-------|
| `refresh-materialized-views` | */15 min | READY (deploy verify) |
| `cleanup-expired-stories` | hourly | READY |
| `cleanup-old-notifications` | 03:00 | READY |
| `cleanup-rate-limits` | hourly | READY |

Kontrol: `SELECT jobid, schedule, command FROM cron.job;`

---

## 5. Edge Functions

| Function | Beta ihtiyacı | Secret |
|----------|---------------|--------|
| `fetch-market-news` | **Zorunlu** | RSS fallback OK; `NEWS_API_KEY` opsiyonel |
| `feed`, `search` | Zorunlu | Deployed |
| `agora-token` | Canlı yayın varsa | Agora credentials |
| `fetch-economic-calendar` | **Beta dışı** | `TRADING_ECONOMICS_KEY` yok |
| `ai-chat` | Beta dışı | `OPENAI_API_KEY` |
| `send-weekly-digest` | Beta dışı | `RESEND_API_KEY` |
| `check-price-alerts` | P1 | Cron + service role |

---

## 6. Observability

| Tablo | Durum | Aksiyon |
|-------|-------|---------|
| `job_runs` | Tablo var, 0 row | Edge log insert çalışıyor mu kontrol; P1 dashboard |

---

## 7. Incident playbook

### SEC: Anon fiyat değişti

1. `P0_005_ASSET_PRICES_RLS_FIX.sql` deploy durumunu kontrol et
2. Anon PATCH probe
3. VPS ile fiyatları yeniden yaz (service role)

### News feed boş

1. Manuel `POST fetch-market-news`
2. `idx_market_news_url_unique` var mı
3. Cron job aktif mi

### Beta write çalışmıyor

1. `NEXT_PUBLIC_WEB_WRITE_ENABLED=true` mi?
2. Kullanıcı auth session var mı?
3. RLS policy user_id eşleşiyor mu

---

## 8. Launch günü sırası

1. Anon security probe (asset_prices PATCH deny)
2. VPS health
3. WEB env + `WEB_WRITE_ENABLED=true`
4. `POST fetch-market-news`
5. Smoke matrix (`BETA_UNBLOCKER_MEGA_SPRINT_REPORT.md`)
6. Kapalı beta invite listesi aç
