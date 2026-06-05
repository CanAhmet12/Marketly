# LAUNCH PREPARATION REPORT

**Sprint:** Launch Preparation Mega Sprint  
**Tarih:** 5 Haziran 2026  
**Önceki karar:** `READY_FOR_BETA` (Beta Unblocker)  
**Kapsam:** WEB only — kalite, UX, güvenlik doğrulama, performans; yeni feature/RPC/tablo yok

---

## Executive Summary

Beta açılmadan önce yapılan son kalite turunda **canlı modda kullanıcıyı bloke eden veya yanıltan P0 UX sorunları** giderildi. En kritik bulgular: watchlist sayfasının tamamen mock-only kapısı, kategori sayfalarında `NEXT_PUBLIC_USE_MOCK` mesajı, sembol detayında her zaman görünen “canlı kapalı” bandı ve sinyal detayında canlı akışın erken kesilmesi.

Güvenlik (SEC-001), fiyat beslemesi ve market news önceki sprintte doğrulandı; bu sprintte regresyon yok. TypeScript temiz (`npx tsc --noEmit` ✅).

**50–200 kapalı beta kullanıcısı** için web deneyimi yeterince sağlam: anon gezinme, piyasalar, sinyaller, içerik üreticileri ve temel kişisel sayfalar çalışır durumda. Kısmi alanlar (ekonomik takvim, DM, tam kategori dashboard’ları) dokümante edildi ve beta için kabul edilebilir.

# Final Decision: `READY_FOR_LAUNCH`

Kapalı beta (`NEXT_PUBLIC_WEB_WRITE_ENABLED=true`, runbook ile) açılabilir. Launch sonrası P1 iyileştirmeler ayrı sprintte.

---

## First User Experience

### İncelenen akış (anon)

| Sayfa | Durum (önce) | Durum (sonra) |
|-------|--------------|---------------|
| Landing / Home | ✅ Canlı strip + editorial chips | ✅ |
| Discover | ✅ | ✅ |
| Creators | ✅ Live RPC directory | ✅ |
| Signals | ✅ Live feed + empty/error | ✅ |
| Market News | ✅ 10+ haber, empty state | ✅ |
| Markets hub | ✅ Live `asset_prices` | ✅ |
| Kategori rotaları (`/markets/category/*`) | ❌ Mock-only empty + env mesajı | ✅ `MarketsPageClient` fallback |
| Watchlist | ❌ Tam sayfa mock gate | ✅ Live assets + empty CTA |
| Sembol detay | 🟡 Her zaman `liveOff` bandı | ✅ Live fiyat merge + koşullu band |

### Yapılan düzeltmeler

- `watchlist-page-client.tsx` — `!mockOn` tam sayfa engeli kaldırıldı; `useMarketAssetsLive()` ile fiyatlar; boş liste CTA
- `crypto/forex/bist/nasdaq/commodities-category-page-client.tsx` — canlı modda `MarketsPageClient` segment fallback
- `market-symbol-page-client.tsx` — canlı fiyat birleştirme; `liveOff` yalnızca veri yokken
- `asset-detail-hero.tsx` — teknik env mesajı → kullanıcı dostu uyarı

### Kalan (P2, beta için OK)

- Home editorial bazı bloklar mock zenginleştirmeli (live minimal)
- Landing → signup CTA mevcut; derin funnel ölçümü sınırlı

---

## Creator Experience

### Akış: signup → profile → upload → signal → studio → analytics

| Adım | Durum | Not |
|------|-------|-----|
| Signup / login | **PASS** | Supabase Auth |
| Profil | **PASS** | |
| Upload post/signal | **PARTIAL** | `NEXT_PUBLIC_WEB_WRITE_ENABLED` + giriş gerekli; mock tam önizleme |
| Studio dashboard | **PASS** | Live `fetch-studio-analytics` + ES-001 empty → `/upload` CTA |
| Studio analytics | **PASS** | Live query + skeleton |
| Sinyal detay (creator link) | **PASS** (düzeltildi) | Canlı feed’den satır çözümü |

### Düzeltme

- `signal-detail-page-client.tsx` — canlı modda erken `!mockOn` dead-end kaldırıldı; loading → not-found akışı

### Kalan

- Upload: Supabase yapılandırılmamış ortamda teknik mesaj (yalnızca dev)
- Portföy ekleme web’de APP’e yönlendiriyor (bilinçli)

---

## Empty States

| Sayfa | Kalite | Not |
|-------|--------|-----|
| Creators | ✅ | Live empty + CTA |
| Signals | ✅ | Filtre / canlı boş ayrımı |
| Market News | ✅ | Loading + error + empty |
| Economic Calendar | ✅ (iyileştirildi) | Teknik tablo adı kaldırıldı |
| Studio | ✅ | İçerik yok → upload CTA |
| Watchlist | ✅ (düzeltildi) | Boş liste CTA |
| Price Alerts | ✅ | Login / error / empty |
| Notifications | ✅ | Canlı “henüz olay yok” |
| Portfolio | ✅ | Live holdings empty |
| Messages | ✅ | Canlı boş sohbet mesajı |

**Değişiklik:** `economic-calendar-intelligence-page-client.tsx` — kullanıcı dostu boş açıklama.

---

## Error Handling

### Tarama

- `console.error` — yalnızca `logger.ts`, `client-error-log.ts`, `global-error.tsx`, build script (kabul edilebilir)
- Silent `.catch(() => {})` — **1 bulgu düzeltildi**

### Düzeltme

- `use-markets-watchlist.ts` — DB sync hatasında `showMutationToast` (yerel kopya korunur mesajı)

### Mevcut altyapı

- `reportOperationalWarning` / `reportClientException` (`web/lib/observability/`)
- Sayfa düzeyi error empty state’ler: alerts, news, signals catalog

### Kalan (P2)

- Merkezi Sentry entegrasyonu yok (console köprüsü var)
- Bazı fetch hataları yalnızca empty state (yeterli beta için)

---

## Performance

### Bulgular ve düzeltmeler

| ID | Sorun | Öncelik | Durum |
|----|-------|---------|-------|
| PERF-001 | `fetch-market-assets` sınırsız SELECT | P1 | ✅ `.limit(200)` |
| PERF-002 | Home + markets duplicate live query | P2 | React Query cache paylaşımı (`market-assets-live` key) — kabul |
| PERF-003 | Watchlist virtual table | OK | Mevcut `useVirtualTableRows` |
| PERF-004 | Signals catalog refetch | OK | `staleTime: 60s` |

### İncelenen sayfalar

- **Home** — live assets hook, editorial ayrı query ✅
- **Signals** — tek feed query + leaderboard ✅
- **Creators** — directory RPC, stale 120s ✅
- **Studio** — analytics query, skeleton ✅

---

## Mobile Web

### Genişlikler 320 / 375 / 390 / 414

Kod incelemesi + mevcut pattern’ler:

- `min-w-0`, `overflow-x-hidden` (globals + sayfa wrapper’ları) yaygın
- Kartlar `ms-container-*` ile sınırlandırılmış
- Markets dense table horizontal scroll (`mkt-vt-scroll`)
- Modallar: asset detail alert sheet, market drawer — `min-w-0` parent zinciri mevcut

### Bulgu

- Kategori özel canvas’lar (crypto/forex mock dashboard) canlıda fallback ile standart markets layout’a düşüyor → mobil uyumluluk **iyileşti**
- P2: Bazı studio grafik SVG’leri dar ekranda küçülür (scroll yok, okunabilir)

**Karar:** P0 mobil kırılma yok; spot test önerilir.

---

## Accessibility

### P0 kontrol

| Alan | Durum |
|------|-------|
| Watchlist çıkar butonu | ✅ `aria-label` |
| Studio subnav | ✅ `aria-label="Studio bölümleri"` |
| Studio grafikler | ✅ `aria-label` |
| Form labels (auth) | ✅ Mevcut sayfalarda |
| Keyboard nav | 🟡 P2 — drawer/modal focus trap tam değil |

Beta için P0 eksik yok; focus trap post-beta.

---

## Telemetry

### Mevcut

| Kanal | Durum | Not |
|-------|-------|-----|
| `reportOperationalWarning` | ✅ | Realtime, analytics RPC fallback |
| `reportClientException` | ✅ | Hazır, sınırlı kullanım |
| `trackAssetView` | ✅ | Sembol sayfası |
| `trackVideoViewImpulse` | ✅ | Video detay RPC |
| Edge `job_runs` | 🟡 Tablo var, **0 row** | News ingest log henüz boş |
| Product analytics (Segment/Amplitude) | ❌ | Yok |

### Beta için yeterlilik

- Hata ve operasyonel uyarılar console + yapılandırılabilir logger ile toplanabilir
- `job_runs` doldurulması P1 (news/calendar cron izleme)
- İlk 50–200 kullanıcı: Supabase logs + VPS health + manuel probe yeterli (runbook)

---

## QA Matrix

| Akış | Rol | Sonuç | Gerekçe |
|------|-----|-------|---------|
| Browse (home, discover, markets) | Anon | **PASS** | Live prices + navigation |
| Search | Anon | **PASS** | Markets search + discover |
| Creators directory | Anon | **PASS** | Live RPC |
| Signals marketplace | Anon | **PASS** | Live feed |
| Signal detail deep link | Anon | **PASS** | Dead-end kaldırıldı |
| Login / settings | User | **PARTIAL** | İlgi alanı bölümü live’da gizli |
| Notifications | User | **PARTIAL** | Boş akış normal; zeka kutusu veri bekler |
| Watchlist | User | **PASS** | Live + local/DB sync |
| Price alerts | User | **PASS** | Auth + empty/error |
| Upload post/signal | Creator | **PARTIAL** | Write gate + auth |
| Studio dashboard | Creator | **PASS** | Live analytics |
| Studio analytics | Creator | **PASS** | |
| Portfolio | User | **PARTIAL** | Web read-only; APP’den ekleme |
| Messages | User | **PARTIAL** | Live boş state (DM backend sınırlı) |
| Economic calendar | Anon | **PARTIAL** | Empty (NOT_REQUIRED_FOR_BETA) |

---

## Remaining Risks

| ID | Risk | Seviye | Mitigasyon |
|----|------|--------|------------|
| CAL-001 | Ekonomik takvim boş | P2 | Empty state; beta dışı |
| OBS-001 | `job_runs` boş | P2 | Manual edge trigger + runbook |
| STALE-001 | XAG/XAU eski fiyat | P1 | VPS kapsamı / UI filtre (runbook) |
| MSG-001 | DM live boş | P2 | Empty state; beta kapsam dışı |
| CAT-001 | Özel kategori dashboard mock-only | P2 | Markets fallback (bu sprint) |
| OBS-002 | Sentry yok | P2 | Console + Supabase logs |
| WRITE-001 | Upload write gate | P1 | `BETA_WRITE_POLICY.md` |

Hiçbiri kapalı beta açılışını **BLOCK** etmiyor.

---

## Recommended Beta Rollout

1. **Ortam:** Production web, `NEXT_PUBLIC_USE_MOCK=false`, `NEXT_PUBLIC_WEB_WRITE_ENABLED=true`
2. **Davet:** 50–200 kapalı beta (creator + tüketici karışık)
3. **İzleme (günlük):** VPS health, `asset_prices` freshness, `market_news` row count, anon PATCH probe (runbook §1–3)
4. **Hafta 1 odak:** Watchlist sync, upload success rate, signals feed errors
5. **Hafta 2:** `job_runs` doldurma, economic calendar ingest kararı, Sentry P1

---

## Final Decision

# `READY_FOR_LAUNCH`

İlk 50–200 beta kullanıcısı için Marketly web yeterince sağlam: kritik güvenlik kapalı, canlı veri akışları çalışıyor, boş/hata durumları kullanıcıya anlamlı, P0 UX blokları giderildi.

**Bu sprintte yapılan kod değişiklikleri (özet):**

| Dosya | Değişiklik |
|-------|------------|
| `fetch-market-assets.ts` | `.limit(200)` |
| `use-markets-watchlist.ts` | DB sync toast |
| `watchlist-page-client.tsx` | Live mode açıldı |
| `market-symbol-page-client.tsx` | Live fiyat merge |
| `asset-detail-hero.tsx` | Band metni |
| 5× category page clients | Markets fallback |
| `signal-detail-page-client.tsx` | Live dead-end kaldırıldı |
| `economic-calendar-intelligence-page-client.tsx` | Empty copy |

**TypeScript:** ✅  
**Yeni feature / RPC / tablo:** ❌ (yok)

---

*Sonraki sprint önerisi: Observability (Sentry + job_runs), economic calendar ingest, mobil spot QA cihaz testi.*
