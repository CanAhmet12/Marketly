# COMMIT & DEPLOY PRODUCTION REPORT

**Sprint:** Commit & Deploy Mega Sprint  
**Tarih:** 5 Haziran 2026  
**Kapsam:** WEB + Supabase SQL/Edge doğrulama; APP hariç

---

## Executive Summary

WEB beta paketi **yerel git commit** ile kaydedildi (`9c73ed4`). Production Supabase **RLS, RPC, market news ve fiyat beslemesi** canlı probe ile doğrulandı. `npm run build` başarılı; `npx tsc --noEmit` temiz.

**Push ve WEB deploy BLOCKED:** `origin` remote yok, `gh` oturumu yok, Vercel/Supabase CLI kurulu değil, `NEXT_PUBLIC_SITE_URL` tanımlı değil.

# Final Decision: `DEPLOY_BLOCKED`

Commit tamam; production backend hazır; WEB hosting push/deploy adımı kullanıcı aksiyonu bekliyor.

---

## Git Change Audit

### Staged & committed (957 files)

| Sınıf | İçerik |
|-------|--------|
| **WEB code** | `web/` — Next.js 16 app (tüm feature/repository/hooks) |
| **SQL migrations** | `P0_002`, `P0_003`, `P0_005`, `RPC_CLOSURE_SPRINT.sql`, `DATA_FEED_SPRINT.sql` |
| **Edge functions** | `fetch-market-news`, `fetch-economic-calendar`, `_shared` |
| **Reports/docs** | Beta/Launch/Production/DataFeed/RPC/WEB sprint raporları, runbooks |
| **Config** | `.gitignore` (supabase/.temp, web/.next) |

### Bilerek commitlenmedi (302 unstaged)

| Sınıf | Dosyalar | Sebep |
|-------|----------|-------|
| **APP (RN/Expo)** | `App.tsx`, `screens/*`, `components/*`, `hooks/*`, … | Sprint kuralı: APP dokunulmaz |
| **APP assets** | `assets/*.png` | Mobil |
| **Edge (eski diff)** | `supabase/functions/ai-chat`, `check-price-alerts` | APP sprint değişiklikleri |
| **SQL (genel)** | `ADD_TABLES.sql`, `SEED_*.sql`, … | Production seed riski / kapsam dışı |
| **Kişisel/geçici** | `BM218_*`, `Logo.png`, `analysis/`, `sorunlar/` | Gereksiz |
| **Build artifact** | `web/.next/`, `node_modules/` | `.gitignore` |

### Commitlenmeyecek / review

| Dosya | Karar |
|-------|-------|
| `.env`, `web/.env.local` | ❌ Gitignore — commit yok ✅ |
| `supabase/.temp/` | ❌ Gitignore |
| `web/.next/` | ❌ Build artifact; anon key inline (Next.js `NEXT_PUBLIC_*` — beklenen, repo dışı) |

---

## Pre-Commit Validation

| Kontrol | Sonuç | Detay |
|---------|-------|-------|
| `npx tsc --noEmit` | ✅ PASS | web/ |
| `npm run build` | ✅ PASS | Next.js 16 production build |
| `npm run lint` | ⚠️ FAIL (126 error) | Çoğu `react-hooks/set-state-in-effect` — **önceden var**; launch fix dosyalarında yeni lint yok |
| Mock false build | ✅ | `NEXT_PUBLIC_USE_MOCK_DATA=false` ile build OK |
| Import/export | ✅ | Build geçti |

**Karar:** Build geçtiği için deploy önkoşulu (build) sağlandı; lint teknik borç olarak raporlandı.

---

## Security Check

### Secret taraması (commitlenecek kaynak)

| Pattern | Sonuç |
|---------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yalnız Edge `Deno.env.get` — client bundle'da yok ✅ |
| `service_role` | Edge-only ✅ |
| API keys hardcoded | Yok ✅ |
| `.env` commit | Yok ✅ |

### Build artifact notu

`web/.next/` build sırasında `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` inline edilir — **anon key public tasarım gereği**; service role yok.

### Client env (local `.env.local` — commit dışı)

```
NEXT_PUBLIC_SUPABASE_URL=https://ufljsnqxvqzichwlpfgy.supabase.co
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_WEB_WRITE_ENABLED=true
NEXT_PUBLIC_SITE_URL=(tanımlı değil)
```

---

## SQL Production Status

| SQL | Production | Probe |
|-----|------------|-------|
| `P0_002_COMMENTS_RLS_FIX.sql` | ✅ | Anon PATCH → `200`, `Content-Range: */*`; içerik `evet` değişmedi |
| `P0_003_VIDEO_COMMENTS_RLS_FIX.sql` | ✅ | Anon PATCH → `200`, `Content-Range: */*` |
| `P0_005_ASSET_PRICES_RLS_FIX.sql` | ✅ | Anon PATCH BTC→111111 → fiyat `61188` korundu |
| `RPC_CLOSURE_SPRINT.sql` | ✅ | `get_creators_directory` 200; `get_studio_analytics_bundle` 200 |
| `DATA_FEED_SPRINT.sql` | ✅ | `market_news` 5+ row; `job_runs` tablo 200 |

**Ek RPC:** `get_leaderboard_analysts` → 3 row ✅

**Sıra (eksik olsaydı):** P0_002 → P0_003 → P0_005 → RPC_CLOSURE → DATA_FEED (production'da uygulanmış görünüyor).

---

## Edge Functions Status

| Function | Beta | Deploy | Probe |
|----------|------|--------|-------|
| `fetch-market-news` | **Zorunlu** | ✅ (production URL yanıt veriyor) | `fetched=10 inserted=10` |
| `fetch-economic-calendar` | Beta dışı | 🟡 skeleton | `TRADING_ECONOMICS_KEY` yok — beklenen |
| `ai-chat` | Beta dışı | partial | `OPENAI_API_KEY` gerekli |
| `send-weekly-digest` | Beta dışı | partial | `RESEND_API_KEY` gerekli |

**CLI:** `supabase` CLI kurulu değil — redeploy bu oturumda çalıştırılmadı; canlı function zaten yanıt veriyor.

---

## Web Env Status

| Değişken | Local | Production hosting |
|----------|-------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Hosting panelinde set edilmeli |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Hosting panelinde set edilmeli |
| `NEXT_PUBLIC_USE_MOCK` / `_DATA` | `false` ✅ | `false` zorunlu |
| `NEXT_PUBLIC_WEB_WRITE_ENABLED` | `true` ✅ | Beta politikasına göre |
| `NEXT_PUBLIC_SITE_URL` | ❌ eksik | OAuth/canonical için gerekli |

**Önerilen hosting:** Vercel (Next.js default); root directory: `web`

---

## Commit Info

| Alan | Değer |
|------|-------|
| **Hash** | `9c73ed4e40c090c82b250f363ddfe9452901ca61` |
| **Branch** | `master` |
| **Mesaj** | `feat(web): prepare Marketly web for closed beta launch` |
| **Dosya sayısı** | 957 |
| **APP dahil** | Hayır |

---

## Push Info

| Adım | Sonuç |
|------|-------|
| `git push origin master` | ❌ **FAIL** — `fatal: 'origin' does not appear to be a git repository` |
| `gh auth` | ❌ Oturum yok |
| **Gerekli aksiyon** | `git remote add origin <repo-url>` + `gh auth login` + `git push -u origin master` |

---

## Deployment Info

| Katman | Durum |
|--------|-------|
| **Git push** | ❌ Remote yok |
| **CI** | `.github/workflows` yok |
| **Vercel CLI** | Kurulu değil |
| **WEB production URL** | Bilinmiyor / deploy edilmedi |
| **VPS price API** | ✅ `164.90.189.231:3001/health` → `ok` |
| **Supabase** | ✅ Proje canlı |

### WEB deploy adımları (manuel)

1. GitHub repo oluştur / remote ekle → push
2. Vercel: Import repo, **Root Directory = `web`**
3. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_USE_MOCK_DATA=false`, `NEXT_PUBLIC_WEB_WRITE_ENABLED=true`, `NEXT_PUBLIC_SITE_URL=https://<host>`
4. Deploy → smoke test

---

## Post-Deploy Smoke Tests

### API/DB (canlı — bu oturumda çalıştırıldı)

| Test | Sonuç |
|------|-------|
| `asset_prices` SELECT | ✅ 3+ rows, BTC fresh (`2026-06-05T20:45:00Z`) |
| `asset_prices` anon PATCH deny | ✅ Fiyat değişmedi |
| `comments` anon PATCH deny | ✅ İçerik korundu |
| `video_comments` anon PATCH deny | ✅ `*/0` |
| `get_creators_directory` RPC | ✅ 200 |
| `get_leaderboard_analysts` RPC | ✅ 3 rows |
| `get_studio_analytics_bundle` RPC | ✅ 200 |
| `market_news` rows | ✅ 5+ (trigger sonrası +10 insert) |
| `job_runs` table | ✅ Var |
| `fetch-market-news` POST | ✅ inserted=10 |
| VPS health | ✅ ok |

### WEB sayfa smoke (deploy sonrası yapılacak)

| Route | Beklenen |
|-------|----------|
| `/` | Mock sızıntısı yok, live strip |
| `/discover` | Render OK |
| `/creators` | Live RPC directory |
| `/signals` | Live feed |
| `/market-news` | Haber listesi |
| `/markets/category/crypto` | Markets fallback (mock dashboard yok) |
| `/watchlist` | Boş state CTA (live) |

Auth rotaları (`/settings`, `/upload`, `/studio`) — manuel login gerekli.

---

## Rollback Plan

### WEB

- Vercel/hosting: **Previous Deployment** → Promote
- Acil write kapatma: `NEXT_PUBLIC_WEB_WRITE_ENABLED=false` → redeploy

### SQL

- **Güvenlik SQL geri alınmaz** (P0 RLS forward-only)
- Sorun olursa yeni forward-fix migration

### Edge

- Supabase Dashboard → Functions → önceki sürüm redeploy
- `fetch-market-news` kapatılırsa: son `market_news` rows kalır; cron durur

### VPS fiyat

1. `GET http://164.90.189.231:3001/health`
2. SSH → PM2 restart price service (runbook §2)
3. `asset_prices.updated_at` tazeliğini kontrol et

---

## Remaining Risks

| ID | Risk | Seviye |
|----|------|--------|
| DEP-001 | Git remote yok — kod yedeklenmemiş (remote) | P0 |
| DEP-002 | WEB hosting deploy edilmedi | P0 |
| DEP-003 | `NEXT_PUBLIC_SITE_URL` eksik | P1 |
| DEP-004 | ESLint 126 error (teknik borç) | P2 |
| DEP-005 | 302 unstaged APP dosyası — ayrı commit gerekir | P2 |
| DEP-006 | Economic calendar ingest secret yok | P2 (beta dışı) |

---

## Final Decision

# `DEPLOY_BLOCKED`

| Tamamlanan | Bekleyen |
|------------|----------|
| ✅ Yerel commit `9c73ed4` | ❌ `git remote` + push |
| ✅ Production RLS/RPC/news/price probe | ❌ Vercel (veya hosting) deploy |
| ✅ `npm run build` | ❌ Canlı URL smoke test |
| ✅ Secret sızıntısı yok (commit) | ❌ `NEXT_PUBLIC_SITE_URL` |

**Sonraki adım (5 dk checklist):**

```bash
git remote add origin <github-url>
git push -u origin master
# Vercel: root=web, env set, deploy
```

---

*Rapor otomatik üretildi — Commit & Deploy Mega Sprint, 5 Haziran 2026*
