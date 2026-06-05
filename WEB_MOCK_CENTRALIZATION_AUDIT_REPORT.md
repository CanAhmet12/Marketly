# WEB MOCK CENTRALIZATION / REAL DATA AUDIT REPORT

**Tarih:** 5 Haziran 2026  
**Yöntem:** Kod taraması + grep + dosya okuma. Hiçbir dosya değiştirilmedi.  
**Kapsam:** `web/features/`, `web/components/`, `web/app/`, `web/mock/`

---

## Executive Summary

Marketly WEB mock sistemi teknik olarak doğru kurulmuş ve production guard sağlam (`NODE_ENV === "production"` → mock asla açılamaz). Ancak **3 ayrı mock sızma kanalı** tespit edildi:

1. **Discover VR fallback** — `discover-visual-reference-data.ts` (~760 satır statik veri) merkezi mock sisteminden bağımsız; feed boşken mock false'da da sahte içerik gösteriyor. 🔴 **KRİTİK**
2. **Market news Unsplash görselleri** — `market-news-shared.ts` Unsplash URL haritası mock guard olmadan her zaman aktif. 🟡
3. **`use-mock-signal-subscriber.ts`** — `isMockDataEnabled()` kontrolü yok, localStorage ile mock false'da da tetiklenebilir. 🟡

Geri kalan bulgular ya zaten mock branch'te (`isMockDataEnabled()` korumalı) ya da sadece UI config (label/enum, veri değil).

---

## Current Mock System Map

### Mock Kontrol Noktası

```
web/mock/config.ts
├── isMockAllowedInCurrentEnv() → NODE_ENV !== "production"
├── readMockEnvFlag()           → NEXT_PUBLIC_USE_MOCK || NEXT_PUBLIC_USE_MOCK_DATA
└── isMockDataEnabled()         → her ikisi de true ise aktif
```

**Production guard:** `NODE_ENV === "production"` → `isMockAllowedInCurrentEnv()` her zaman `false` → env ne olursa olsun mock kapalı. **Sağlam.**

**Mevcut env:** `NEXT_PUBLIC_USE_MOCK_DATA=false` (web/.env.local) → mock **kapalı**.

### Mock Sistemi Kapsamı (~67 dosya)

| Katman | Konum | Feature'lar |
|--------|-------|-------------|
| **Fixtures** | `web/mock/fixtures/` | profiles, posts, signals, markets, comments, videos, channels, follows, stories, editorial |
| **Adapters** | `web/mock/adapters/` | feed, home-sections, discover-sections, markets (8 dosya), signals (5 dosya), channel, studio (8 dosya), watch, post, search, messages, notifications, settings, social (6 dosya), upload |
| **Authentication** | `web/mock/authentication/` | Demo viewer bootstrap |
| **Media** | `web/mock/media/` | Thumbnail fallback URL'leri |

---

## Mock Mode Control Points

| Kontrol | Dosya | Satır | Açıklama |
|---------|-------|-------|----------|
| Ana toggle | `web/mock/config.ts` | 20-28 | `isMockDataEnabled()` |
| Repository fabrikası | `web/features/*/repository/index.ts` (15 dosya) | — | `isMockDataEnabled()` ? Mock : Supabase |
| Fetch katmanı | `web/features/*/fetch-*.ts` (14 dosya) | — | `if (isMockDataEnabled()) return mockAdapter(...)` |
| Component düzey | `web/features/home/`, `web/features/social/` vb. | — | `const mockOn = isMockDataEnabled()` |
| UI badge | `web/mock/mock-mode-badge.tsx` | — | AppShell'de "Mock Mode" badge |

---

## Hardcoded Mock Data Findings

| Risk | Feature | Dosya | Satır | Veri Tipi | Mock False'da görünür? | Öneri |
|------|---------|-------|-------|-----------|------------------------|-------|
| 🔴 KRİTİK | Discover VR | `web/features/discover/visual-reference/discover-visual-reference-data.ts` | 155–913 | picsum + statik VR section/ticker ~760 satır | **EVET** — feed boşken fallback doldurur | `ADD_EMPTY_STATE` veya `CENTRALIZE_TO_MOCK_SYSTEM` + mock guard |
| 🔴 KRİTİK | Discover VR fallback | `web/features/discover/visual-reference/discover-view-model-adapter.ts` | 334–370 | `orCopy` fallback: feed boşsa VR_LIVE/PULSE/VIDEO/SIGNAL doldurur | **EVET** | Mock false'da `orCopy` devre dışı bırakılmalı; empty sections |
| 🟡 YÜKSEK | Market news görseller | `web/features/markets/lib/market-news-shared.ts` | 8–32 | `NEWS_PHOTOS` — Unsplash URL haritası (mock guard yok) | **EVET** | `REPLACE_WITH_REAL_REPOSITORY` — gerçek `image_url` veya kategori placeholder |
| 🟡 YÜKSEK | Signal subscriber | `web/features/signals/hooks/use-mock-signal-subscriber.ts` | 14–31 | localStorage mock abonelik (`marketly_mock_signal_subscriber`) | **EVET** (localStorage varsa) | `isMockDataEnabled()` guard ekle |
| 🟢 ORTA | Home market strip | `web/features/home/repository/supabase-home-repository.ts` | 12–19 | `STATIC_MARKET_PULSE` — 6 sembol nav link | **EVET** | UI shortcut; fiyat değil — `KEEP_AS_UI_PLACEHOLDER_ONLY` |
| 🟢 ORTA | Home visual | `web/features/home/visual/mock-data.ts` | 40–189 | `HOME_VISUAL_STORIES`, `HOME_VISUAL_POSTS` (picsum/pravatar) | Kısmi (stories static fallback) | `CENTRALIZE_TO_MOCK_SYSTEM` |
| 🟢 ORTA | Creator thumbnail | `web/features/creators/components/creators-live-avatar.tsx` | 19 | `pickMockOfflineThumbnail()` — mock/media/thumbnail-urls.ts | **EVET** (thumbnail yoksa) | Gerçek avatar veya neutral fallback |
| 🟢 ORTA | Portfolio stats | `web/features/markets/portfolio-page-client.tsx` | 22–54 | `PORTFOLIO_STATS`, `HOLDING_ENRICHMENT` | **HAYIR** — `if (!mockOn)` branch içinde | `KEEP_AS_UI_PLACEHOLDER_ONLY` — mock dalına kilitli |
| 🟢 DÜŞÜK | Live chat | `web/features/live/fetch-live-messages.ts` | 19–56 | `MOCK_CHAT` | **HAYIR** — `isMockDataEnabled()` guard mevcut (satır 62) | OK |
| 🟢 DÜŞÜK | Settings | `web/features/social/repository/supabase-social-repository.ts` | 193 | `getDefaultMockSettings()` — Supabase repo'da mock fallback | **EVET** (live modda) | Mock settings yerine Supabase `profiles` kolonları |
| 🔵 DÜŞÜK | Auth form | `login-form.tsx:68`, `register-form.tsx:87` | 68, 87 | `ornek@email.com` placeholder metni | Form placeholder only | `KEEP_AS_UI_PLACEHOLDER_ONLY` |
| 🔵 DÜŞÜK | Dead renderers | `TrendingMixedRenderer`, `CreatorGridRenderer` | — | Route'ta kullanılmıyor | HAYIR (dead code) | `WAIT_FOR_BACKEND` |

---

## Data Source Classification

| Feature / Route | Component | Mevcut Kaynak Tipi | Gerçek Backend Var? | Problem | Öneri |
|----------------|-----------|-------------------|--------------------|---------|----|
| Home feed | `home-editorial-home.tsx` | REAL_WITH_MOCK_FALLBACK | ✅ (`fetch-home-feed.ts`) | OK | — |
| Home sections (trending/stories) | `supabase-home-repository.ts` | MOCK_SYSTEM_ONLY | ❌ (stub `[]`) | Live'da boş | `ADD_EMPTY_STATE` |
| Discover feed | `discover-feed-surface.tsx` | REAL_WITH_MOCK_FALLBACK | ✅ (`fetch-home-feed.ts`) | OK | — |
| **Discover VR sections** | `discover-visual-reference-surface.tsx` | **HARDCODED_MOCK** | ❌ | Mock false'da sahte içerik | `ADD_EMPTY_STATE` veya `CENTRALIZE` |
| Signals catalog | `signals-page-client.tsx` | REAL_WITH_MOCK_FALLBACK | ✅ (`fetch-signals-feed.ts`) | OK | — |
| Signals marketplace | `supabase-signals-repository.ts` | MOCK_SYSTEM_ONLY | ❌ | Boş `[]` | `ADD_EMPTY_STATE` |
| Markets hub | `markets-page-client.tsx` | REAL (live prices) + STUB (hero/intel) | Kısmi | Hero placeholder | Live hero RPC |
| Market news | `market-newsroom-page-client.tsx` | MOCK_SYSTEM_ONLY + Unsplash | ⚠️ Unsplash URL | Görsel mock false'da da Unsplash | `REPLACE_WITH_REAL_REPOSITORY` |
| Portfolio | `portfolio-page-client.tsx` | REAL (live holdings) | ✅ | Mock dalı kilitli | OK |
| Watchlist | `use-markets-watchlist.ts` | REAL (Supabase + localStorage) | ✅ | OK | — |
| Creators directory | `creators-results-grid.tsx` | MOCK_SYSTEM_ONLY | ❌ (RPC yok) | Boş `[]` | `WAIT_FOR_BACKEND` |
| Studio | `studio-*-client.tsx` (4 dosya) | REAL (Supabase bağlı) | ✅ | Empty state yok | `ADD_EMPTY_STATE` |
| Messages | `messages-page-client.tsx` | REAL (Supabase) | ✅ | OK | — |
| Notifications | `use-notification-inbox.ts` | REAL (Supabase) | ✅ | OK | — |
| Stories | `home-stories-section.tsx` | REAL_WITH_MOCK_FALLBACK | ✅ | Static picsum fallback | Mock guard ekle |
| Live chat | `live-watch-client.tsx` | REAL (Supabase RT) | ✅ | OK | — |
| Search | `search-page-client.tsx` | REAL (fetch-search) | ✅ | OK | — |
| Channel/Watch/Post | `fetch-*` | REAL | ✅ | OK | — |
| Subscriptions | `supabase-subscription-repository.ts` | MOCK_SYSTEM_ONLY (sparse) | ❌ | Bilinçli sparse | `WAIT_FOR_BACKEND` |
| Onboarding | `supabase-onboarding-repository.ts` | MOCK_SYSTEM_ONLY | ❌ | Empty catalog | `WAIT_FOR_BACKEND` |
| Personalization | `supabase-personalization-repository.ts` | MOCK_SYSTEM_ONLY | ❌ | Empty ctx | `WAIT_FOR_BACKEND` |

---

## Centralization Plan

| Kaynak Dosya | Mock Veri Tipi | Hedef Mock Modülü | Mock True Davranışı | Mock False Davranışı | Öncelik |
|-------------|---------------|-------------------|--------------------|--------------------|---------|
| `discover-visual-reference-data.ts` | VR section/ticker array'leri | `web/mock/fixtures/discover-vr.ts` (yeni) | Adapter'dan VR doldurur | Empty sections / "Keşfet içeriği yükleniyor" | 🔴 P0 |
| `discover-view-model-adapter.ts` `orCopy` | Fallback dispatch | Mock guard ile sarmala | Fallback doldurur | Gerçek veri yoksa boş bölüm | 🔴 P0 |
| `home/visual/mock-data.ts` | Stories + posts görselleri | Zaten `mock/` dışında — `web/mock/fixtures/` altına taşı | Mock fixtures'dan gelen | Static fallback → neutral avatar | 🟡 P1 |
| `creators-live-avatar.tsx:19` | `pickMockOfflineThumbnail()` | Mock guard ile sarmala | Mock thumbnail | Gerçek avatar veya gri placeholder | 🟡 P1 |
| `market-news-shared.ts` Unsplash map | Haber görseli URL | `web/mock/media/news-thumbnails.ts` (yeni) | Mock Unsplash görseller | Gerçek `image_url` veya kategori SVG | 🟡 P1 |
| `use-mock-signal-subscriber.ts` | localStorage abonelik | `isMockDataEnabled()` guard ekle | localStorage mock aktif | Devre dışı | 🟢 P2 |
| `supabase-social-repository.ts:193` | `getDefaultMockSettings()` | `profiles` tablosundan kullanıcı tercihleri | Mock settings | Supabase settings | 🟢 P2 |

---

## Empty State Gap Map

| Alan | Şimdiki Durum (Mock False) | Doğru Davranış | Önerilen Empty State Metni | Öncelik |
|------|---------------------------|----------------|---------------------------|---------|
| **Discover VR** | Sahte 8+ bölüm gösteriyor (picsum/VR data) | Backend veri gelene kadar "içerik yükleniyor" veya boş | "Keşfet henüz hazır değil. Yakında burada içerikler görünecek." | 🔴 P0 |
| **Home sections** | Boş rail'ler (trend/stories/creator) | Minimal skeleton veya gizli | Sessizce gizle (height 0) | 🟡 P1 |
| **Signals marketplace** | Boş listeler | EmptyState bileşeni | "Henüz sinyal marketplace aktif değil." | 🟡 P1 |
| **Studio dashboard** | Sıfır metrikler (totalViews:0 vb.) | "İçerik yükle, metriklerin burada göster" | "Henüz içerik yok. İlk içeriğini yükle." | 🟡 P1 |
| **Creators directory** | Boş liste (silently) | EmptyState | "Creator rehberi yakında açılıyor." | 🟢 P2 |
| **Subscriptions** | Sparse "Yakında" placeholder | Bilinçli — OK | Mevcut metin yeterli | — |

---

## Backend Gap Map

| Feature | Eksik Backend Parçası | Tür | DEV Mock'ta kalabilir mi? | Öncelik |
|---------|----------------------|-----|--------------------------|---------|
| **Home trending/sections** | `getHomeSections`, `getTrendingVideos`, `getLiveNow` | RPC / query | ✅ DEV-only | P2 |
| **Home recommended creators** | Creator recommendation RPC | RPC | ✅ DEV-only | P2 |
| **Discover sections** | Topic ecosystem, market ticker backend | Query / Edge Fn | ✅ DEV-only | P2 |
| **Signals marketplace/leaderboard** | `getMarketplaceRails`, `getAnalystLeaderboard` | RPC | ✅ DEV-only | P1 |
| **Creators directory** | `get_creators_directory` RPC | RPC | ✅ DEV-only | P2 |
| **Market news görselleri** | Gerçek `image_url` Supabase | DB column | ✅ DEV-only (Unsplash) | P1 |
| **Subscriptions catalog** | Membership tiers + pricing | Ürün kararı | ✅ DEV-only | P3 |
| **Onboarding RPC** | `profiles.onboarding_json` + RPC | RPC + column | ✅ DEV-only | P3 |
| **Personalization/Affinity** | Sunucu ingest + affinity RPC | Edge Fn | ✅ DEV-only | P3 |
| **Social discussions/rooms** | Community tables + RPC | DB + RPC | ✅ DEV-only | P3 |

---

## Risk Assessment

### Yüksek Risk (Production'da yanlış veri gösterme potansiyeli)

| # | Risk | Kanıt | Etki |
|---|------|-------|------|
| 1 | Discover VR fallback | `discover-view-model-adapter.ts:359-369` — feed boşsa statik VR fill | Kullanıcı gerçek değil demo içerik görür |
| 2 | Market news Unsplash | `market-news-shared.ts:8-32` — her zaman aktif | 3. parti URL bağımlılığı, içerik tutarsızlığı |
| 3 | Signal subscriber localStorage | `use-mock-signal-subscriber.ts` — mock guard yok | Dev araçlarıyla mock false'da tetiklenebilir |

### Orta Risk (Kötü UX ama veri yanlışlığı yok)

| # | Risk | Açıklama |
|---|------|----------|
| 4 | Studio sıfır metrikler | Yanıltıcı dashboard (0 views, 0 followers) |
| 5 | Home boş rail'leri | Trending/stories yokken boş alan |
| 6 | Creator thumbnail fallback | Gerçek thumbnail yerine mock görseli |

### Düşük Risk / Kabul Edilebilir

| # | Alan | Açıklama |
|---|------|----------|
| 7 | `STATIC_MARKET_PULSE` | UI navigation shortcut, sahte fiyat değil |
| 8 | Portfolio mock branch | `if (!mockOn)` korumalı, sızma yok |
| 9 | Auth form placeholder | UX metin, veri değil |
| 10 | Production guard | `NODE_ENV !== "production"` — sağlam |

---

## Recommended Fix Order

### P0 — Kritik (Production'da sahte içerik riski)

| ID | İş | Dosya | Aksiyon |
|----|----|-------|---------|
| MC-001 | Discover VR fallback mock guard | `discover-view-model-adapter.ts:334-370` | `!isMockDataEnabled()` ise `orCopy` = boş bölüm dönsün |
| MC-002 | Discover VR data mock sisteme taşı | `discover-visual-reference-data.ts` | `isMockDataEnabled()` false iken bu data hiç yüklenmesin |

### P1 — Yüksek (Tutarsız UX)

| ID | İş | Dosya | Aksiyon |
|----|----|-------|---------|
| MC-003 | Market news Unsplash kaldır / gerçek image_url | `market-news-shared.ts:8-32` | Live'da `image_url` DB kolonunu kullan; yoksa kategori SVG |
| MC-004 | Signal subscriber mock guard | `use-mock-signal-subscriber.ts:14` | `isMockDataEnabled()` check ekle |
| MC-005 | Creator thumbnail neutral fallback | `creators-live-avatar.tsx:19` | Mock guard; yoksa identicon/grey circle |
| MC-006 | Studio empty states | `studio-dashboard-client.tsx` | 0 değer yerine "Henüz içerik yok" mesajı |

### P2 — Orta

| ID | İş | Dosya | Aksiyon |
|----|----|-------|---------|
| MC-007 | Home stories static fallback | `map-story-visual.ts:52` | Mock guard; live'da URL yoksa gizle |
| MC-008 | Settings mock adapter | `supabase-social-repository.ts:193` | `profiles` tablosundan gerçek tercihler |
| MC-009 | Home boş section gizleme | `supabase-home-repository.ts:40-96` | Boş array döndüğünde section render etme |

### P3 — Düşük (Backend hazır olunca)

| ID | İş | Açıklama |
|----|----|---------|
| MC-010 | Creators RPC | `get_creators_directory` RPC oluştur |
| MC-011 | Signals marketplace | Analyst leaderboard + marketplace RPC |
| MC-012 | Onboarding wizard | `profiles.onboarding_json` + RPC |
| MC-013 | Personalization affinity | Edge Function + affinity RPC |

---

## Sonuç

**Merkezi mock sistemi sağlam.** Production guard titiz. Mock true/false ayrımı 80+ bileşende doğru uygulanmış.

**3 gerçek sorun var:**
1. Discover VR fallback → mock false'da statik demo içerik gösteriyor (**MC-001/002**)
2. Market news Unsplash → gerçek haberlerde mock thumbnail (**MC-003**)
3. Signal subscriber → mock guard eksik (**MC-004**)

**Geri kalan bulgular ya mock branch'te kilitli ya da UI config (veri değil).**

Kod değişikliği MC-001'den başlanmalı — en az kırıcı, en yüksek production riski.
