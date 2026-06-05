# FULL WEB LIVE REGRESSION AUDIT REPORT

**Sprint:** Full Live Regression & Feature Parity Audit  
**Tarih:** 5 Haziran 2026  
**Production URL:** https://web-iota-three-b9kxiudy28.vercel.app  
**Önceki düzeltme:** `MARKETS_CATEGORY_LIVE_RESTORE_REPORT.md`  
**Kapsam:** Analiz only — kod/deploy/commit yok

---

## Executive Summary

Marketly WEB production'da (`NEXT_PUBLIC_USE_MOCK=false`) **Markets kategori regression'ı düzeltilmiş** durumda: beş kategori özel canvas render ediyor (`crypto-canvas`, `forex-canvas`, vb.).

Ancak WEB genelinde **sistematik mock/live ayrımı** var. Mock true'da zengin fixture + discussion/community katmanı; mock false'da çoğu repository metodu `null` / `[]` / `EMPTY_*` / `live_sparse` döndürüyor. Bir kısmı **fetch hook bypass** ile telafi edilmiş (home feed, signals feed, market assets, news, calendar, creators RPC, notifications, messages). Telafi edilmeyen alanlar **mock-only widget gizleme** veya **fakir empty state** olarak kalıyor.

**Markets regression'a benzer başka P0 (özel sayfa → genel fallback bypass) bulunmadı.** Kalan sorunların çoğu P1: mock rich / live poor zenginlik kaybı, bilinçli `live_sparse` ürün blokları, veya yanıltıcı empty/error metinleri.

| Metrik | Sonuç |
|--------|-------|
| Toplam route (page.tsx) | 51 |
| LIVE_FULL (fetch bypass + veri) | ~18 |
| LIVE_PARTIAL | ~22 |
| MOCK_ONLY / MOCK_RICH_LIVE_POOR | ~8 |
| FALLBACK_REGRESSION (aktif P0) | 0 (kategori düzeltildi) |
| PRODUCT_BLOCKED | 2 (onboarding, close-friends) |
| Production mock badge | Yok (doğru) |

# Final Decision: `REGRESSIONS_FOUND_FIXABLE_WITH_WEB`

Çoğu zenginlik kaybı WEB mapper + mevcut tablolarla kısmen giderilebilir. Discussion/community, onboarding catalog, close-friends ve server-side personalization **backend/RPC** ister. Bazı alanlar bilinçli ürün kararı (`PRODUCT_BLOCKED`).

---

## Route Inventory

> **Status açıklaması:** Kod + production smoke + repository kanıtına dayalı. SSR HTML'de client-only class marker'lar görünmeyebilir (not: Phase 6).

| Route | Page | Client Component | Mock True | Mock False | Data Source | Status |
|-------|------|------------------|-----------|------------|-------------|--------|
| `/` | `page.tsx` | `HomeEditorialHome` | Tam editorial + ambient rails + stories mock | Feed: `fetch-home-feed`; chips: `fetch-market-assets`+signals RPC; rails fakir; ambient mock-only bölümler gizli | `posts`, `asset_prices`, RPC | **LIVE_PARTIAL** |
| `/discover` | `discover/page.tsx` | `DiscoverVisualReferenceContainer` | VR fallback + zengin VM | Feed gerçek; VR static fallback kapalı (MC-001/002) | `posts` discover | **LIVE_PARTIAL** |
| `/pulse` | `pulse/page.tsx` | `PulsePageClient` | VR shell + mock VM | Feed→VM; hata banner yanıltıcı | `posts` | **LIVE_PARTIAL** |
| `/videos` | `videos/page.tsx` | `VideosPageClient` | Aynı | Aynı | `posts` | **LIVE_PARTIAL** |
| `/live` | `live/page.tsx` | `LivePageClient` | Aynı | Aynı | `posts` type=live | **LIVE_PARTIAL** |
| `/watch/[id]` | `watch/[id]/page.tsx` | `WatchPageClient` | Tam watch + discussion context | Fiyat live; discussion/community widget'lar mock-only gizli | `posts`, `asset_prices` | **LIVE_PARTIAL** |
| `/post/[id]` | `post/[id]/page.tsx` | `PostDetailClient` | Discussion sidecar zengin | `getPostDiscussionSidecar` → EMPTY | `posts`, comments fetch | **LIVE_PARTIAL** |
| `/channel/[id]` | `channel/[id]/page.tsx` | `ChannelPageClient` | Tam kanal + community inset | Profile/posts/signals fetch; community inset mock-only | `profiles`, `posts`, RPC | **LIVE_PARTIAL** |
| `/creators` | `creators/page.tsx` | `CreatorsPageClient` | Mock directory | RPC `get_creators_directory` | RPC | **LIVE_FULL** * |
| `/signals` | `signals/page.tsx` | `SignalsPageClient` | Tam intel + rails + affinity | Feed+leaderboard RPC; intel derived; discussion widgets mock-only | `signals`, RPC | **LIVE_PARTIAL** |
| `/signals/[id]` | `signals/[id]/page.tsx` | `SignalDetailPageClient` | Tam detay | Feed'den satır; discussion panel mock-only | `signals` | **LIVE_PARTIAL** |
| `/market-news` | `market-news/page.tsx` | `MarketNewsroomPageClient` | Mock bundle | `fetch-market-news` | `market_news` | **LIVE_FULL** * |
| `/market-news/[id]` | `market-news/[id]/page.tsx` | `MarketNewsDetailClient` | Mock detail | `use-market-news-detail` fetch | `market_news` | **LIVE_FULL** * |
| `/economic-calendar` | `economic-calendar/page.tsx` | `EconomicCalendarIntelligencePageClient` | Mock + extra rows | `fetch-economic-calendar` | `economic_events` | **LIVE_FULL** * |
| `/economic-calendar/[id]` | `economic-calendar/[id]/page.tsx` | `EconomicCalendarEventDetailClient` | Mock narrative | Live fetch + sparse narrative | `economic_events` | **LIVE_PARTIAL** |
| `/markets` | `markets/page.tsx` | redirect → crypto | — | redirect | — | **LIVE_FULL** |
| `/markets/category/*` | `category/[category]/page.tsx` | 5 `*-category-page-client` | Mock dashboard | `build-*-dashboard-from-assets` | `asset_prices`+`assets` | **LIVE_FULL** |
| `/markets/[symbol]` | `markets/[symbol]/page.tsx` | `MarketSymbolPageClient` | Tam `ad-canvas` intel | Empty bundle shell + live price merge; intel placeholder metinleri | repo empty + `asset_prices` | **LIVE_PARTIAL** |
| `/watchlist` | `watchlist/page.tsx` | `WatchlistPageClient` | Tam intel bundle | Watchlist localStorage+DB; intel bundle empty; personalized signals empty | `watchlists`, `asset_prices` | **LIVE_PARTIAL** |
| `/portfolio` | `portfolio/page.tsx` | `PortfolioPageClient` | Zengin mock UI | Minimal live list; `fetch-portfolio-holdings` | `portfolio_holdings` | **LIVE_PARTIAL** |
| `/price-alerts` | `price-alerts/page.tsx` | `PriceAlertsPageClient` | localStorage mock | `fetch-price-alerts` | `price_alerts` | **LIVE_FULL** * |
| `/messages` | `messages/page.tsx` | `MessagesPageClient` | Mock convos + hub chrome | `fetch-conversations`; live-empty → full-page EmptyState (hub gizli) | `dm_conversations` | **LIVE_PARTIAL** |
| `/messages/[id]` | `messages/[conversationId]/page.tsx` | (thread view) | Mock messages | `fetch-messages` | `dm_messages` | **LIVE_PARTIAL** |
| `/notifications` | `notifications/page.tsx` | `NotificationsPageClient` | Mock center | `fetch-notifications` | `notifications` | **LIVE_FULL** * |
| `/saved` | `saved/page.tsx` | `SavedPostsPageClient` | Mock saved | `fetch-saved-posts` | `saved_posts` | **LIVE_FULL** * |
| `/upload` | `upload/page.tsx` | `UploadPageClient` | Demo composer | Gerçek upload (write-gated) | Storage/`posts` | **LIVE_PARTIAL** |
| `/studio` | `studio/page.tsx` | `StudioDashboardClient` | Zengin dashboard | `fetch-studio` content; overview zeros | `posts`, drafts | **LIVE_PARTIAL** |
| `/studio/content` | `studio/content/page.tsx` | `StudioContentClient` | Mock list | `fetch-studio` | `posts` | **LIVE_FULL** * |
| `/studio/analytics` | `studio/analytics/page.tsx` | `StudioAnalyticsClient` | Mock analytics | RPC `get_studio_analytics_bundle` | RPC | **LIVE_PARTIAL** |
| `/studio/economy` | `studio/economy/page.tsx` | `StudioEconomyHubClient` | Zengin economy | `data_sparse: true` assembler | subscriptions mock refs | **MOCK_RICH_LIVE_POOR** |
| `/studio/live` | `studio/live/page.tsx` | `StudioLiveClient` | Mock schedule | `getLiveSchedule` → `[]` | Yok | **STUB_LIVE** |
| `/studio/drafts` | `studio/drafts/page.tsx` | `StudioDraftsClient` | Mock | `fetch-studio` drafts | `post_drafts` | **LIVE_FULL** * |
| `/studio/playlists` | `studio/playlists/page.tsx` | `StudioPlaylistsClient` | Mock | `fetch-studio` playlists | `playlists` | **LIVE_PARTIAL** |
| `/studio/content/[id]/edit` | edit page | `StudioContentEditClient` | Mock | fetch edit | `posts` | **LIVE_PARTIAL** |
| `/subscriptions` | `subscriptions/page.tsx` | `SubscriptionsHubClient` | Tam hub | `fetch-membership-catalog`; `live_sparse` rails | `profiles` | **LIVE_PARTIAL** |
| `/subscriptions/[creatorId]` | detail | `MembershipDetailClient` | Tam detail | Profile-based sparse detail | `profiles` | **LIVE_PARTIAL** |
| `/settings` | `settings/page.tsx` | `SettingsPageClient` | Tam personalization intel | `live_sparse`; session-only prefs | localStorage session | **LIVE_PARTIAL** |
| `/onboarding` | `onboarding/page.tsx` | `OnboardingWizardClient` | Tam wizard | `EMPTY_CATALOG` → "Sunucu kataloğu bekleniyor" | Yok | **PRODUCT_BLOCKED** |
| `/close-friends` | `close-friends/page.tsx` | `CloseFriendsHubClient` | Tam hub | `live_sparse` tüm rails boş | Yok | **PRODUCT_BLOCKED** |
| `/close-friends/circle/[id]` | circle detail | `PrivateCircleDetailClient` | Tam detail | Skeleton + empty feed | Yok | **PRODUCT_BLOCKED** |
| `/playlist/[id]` | `playlist/[id]/page.tsx` | `PlaylistPageClient` | Tam playlist intel | `getPlaylistDetail` → `null` | Yok (fetch yok) | **STUB_LIVE** |
| `/profile` | `profile/page.tsx` | Profile redirect/view | — | Auth profile | `profiles` | **LIVE_PARTIAL** |
| `/search` | `search/page.tsx` | Search results | Mock search hits | `fetch-search-results` sparse | `posts`, profiles | **LIVE_PARTIAL** |
| `/results` | `results/page.tsx` | Results + community hint | Community hint mock | `getMarketCommunityNetwork` empty; hint mock-only | repo empty | **MOCK_RICH_LIVE_POOR** |
| `/pulse/[id]` | pulse detail | `PulsePlayerClient` | Mock comments merge | Live comments fetch | `posts`, comments | **LIVE_PARTIAL** |
| `/live/[id]` | live watch | `LiveWatchClient` | Mock chat merge | Live messages fetch; chat mock append in mockOn only | `posts`, messages | **LIVE_PARTIAL** |
| `/auth/*` | login/register/... | Auth forms | Static copy | Supabase Auth | Supabase | **LIVE_FULL** |

\* **LIVE_FULL** = fetch/RPC bağlı; içerik DB'ye bağlı (boş DB → empty state, tasarım kaybı değil)

---

## Mock True vs Mock False Parity Findings

| Area | File | Mock True | Mock False | Difference | Risk |
|------|------|-----------|------------|------------|------|
| Kategori canvas | `*-category-page-client.tsx` | Mock dashboard → özel canvas | `useCategoryDashboard` → live mapper → canvas | **Düzeltildi** | ✅ |
| Kategori global fail | 5 category clients | — | `MarketsPageClient` yalnızca `fetchError \|\| !hasGlobalAssets` | Bilinçli degrade | P2 |
| Home ambient "Sana özel" | `home-ambient-rail.tsx` | InterestProfile + ForYou rails | Bölüm tamamen gizli (`mockOn` gate) | 4 widget kayıp | P1 |
| Home ambient "Topluluk" | `home-ambient-rail.tsx` | Discussion + RecNetwork rails | Gizli | 2 widget kayıp | P1 |
| Home topic rails | `home-topic-community-rails.tsx` | Strip render | `return null` | Widget kayıp | P1 |
| Home editorial today/trending | `build-editorial-rail.ts` | `EDITORIAL_MOCK_TODAY/TRENDING` | `liveChips` only (boş olabilir) | Rail fakir | P1 |
| Home stories | `home-stories-section.tsx` | `HOME_VISUAL_STORIES` fallback | DB `stories` tablosu; boşsa boş şerit | Stories kayıp (veri yoksa) | P2 |
| Discover VR fallback | `discover-view-model-adapter.ts` | VR static data merge | MC-001/002: VR fallback **kapalı** | Doğru (sahte içerik yok) | ✅ |
| Discover error banner | `discover-vertical-page-shell.tsx` | "Örnek içerik gösteriliyor" | Aynı metin ama live'da VR fallback yok → **boş** | Yanıltıcı mesaj | P1 |
| Personalization rails (3) | `home-for-you-intelligence-rails.tsx`, `recommendation-network-rails.tsx`, `discover-explore-personalization-rails.tsx` | Tam rails | `return null` | Keşfet/home kişiselleştirme kayıp | P1 |
| Discussion layer (10+ components) | `social/components/*` | Zengin discussion/community | `if (!isMockDataEnabled()) return null` | Tüm discussion UI kayıp | P1 |
| Markets community widgets (6) | `markets/components/*` | Community hub, rails, hints | Mock-only gizleme | Markets sosyal bağlam kayıp | P1 |
| Signals discussion | `signal-discussion-panel.tsx`, `signals-topic-community-rail.tsx` | Tam panel | Mock-only gizleme | Sinyal tartışma kayıp | P1 |
| Asset symbol intel | `market-symbol-page-client.tsx` | Tam `AssetIntelligenceBundle` | `emptyAssetIntelligenceBundle` + live price overlay | Layout var, intel placeholder | P1 |
| Watchlist intel | `watchlist-page-client.tsx` | `getWatchlistIntelligenceBundle` zengin | Empty bundle (counts only) | Kişisel intel kayıp | P1 |
| Portfolio UI | `portfolio-page-client.tsx` | Zengin mock canvas | Minimal live list | UI fakirleşme | P1 |
| Studio economy | `studio-economy-hub-client.tsx` | Revenue donut, tiers | `data_sparse: true` | Economy hub boş | P1 |
| Studio live schedule | `supabase-studio-repository.ts` | Mock schedule | `[]` | Schedule boş | P2 |
| Subscriptions hub | `subscriptions-hub-client.tsx` | Tam catalog+rails | `live_sparse`; catalog from profiles | Rails/active memberships boş | P1 |
| Onboarding | `onboarding-wizard-client.tsx` | 7 adım wizard | `EMPTY_CATALOG` card | Feature unusable | P0 product |
| Close friends | `close-friends-hub-client.tsx` | Tam hub | `live_sparse` | Feature unusable | P0 product |
| Playlists | `playlist-page-client.tsx` | Tam detail | `null` → empty "hazırlanıyor" | Detail broken | P1 |
| Settings intel | `settings-page-client.tsx` | Personalization lines | `live_sparse` inline info | Panel boş | P1 |
| Messages hub | `messages-page-client.tsx` | Hub chrome + empty | Live-empty → **full-page** EmptyState | Chrome kayıp | P2 |
| Affinity on signals | `signals-page-client.tsx` | `pSnap.affinity` | `affinity = null` | Marketplace rails basitleşir (live builder var) | P2 |

---

## Repository / Fetch Gap Matrix

### Telafi edilmiş (fetch bypass → LIVE_FULL potansiyeli)

| Repository | Method | Mock | Supabase Repo | Effective Live | Risk |
|------------|--------|------|---------------|----------------|------|
| Home | `getHomeFeed` / `getDiscoverFeedPage` | Rich | Delegates to `fetch-home-feed` | **real** `posts` | Low |
| Signals | `getFeedRows` | Rich | `[]` cache | `fetch-signals-feed` → **real** | Low |
| Creators | `getDirectoryPayload` | Rich | `[]` | RPC `get_creators_directory` | Low |
| Markets | category dashboards | Rich | `null` | `build-*-from-assets` | Low (fixed) |
| Markets | assets/prices | Rich | `[]` in payload | `fetch-market-assets` | Low |
| Markets | news/calendar | Rich | empty bundle | `fetch-market-news` / `fetch-economic-calendar` | Low |
| Studio | content/drafts/analytics | Rich | `[]`/zeros | `fetch-studio*` + RPC | Low |
| Social | notifications/conversations | Rich | `[]` | `fetch-notifications` / `fetch-conversations` | Low |

### Telafi edilmemiş (repo stub → fakir/boş live)

| Repository | Method | Live Return | Risk |
|------------|--------|-------------|------|
| Markets | `getAssetIntelligenceBundle` | `emptyAssetIntelligenceBundle(symbol)` | **High** — symbol page intel |
| Markets | `getMarketCommunityNetwork` | `emptyMarketsCommunityNetworkBundle()` | **High** — 4 component doğrudan repo çağırıyor |
| Markets | `getWatchlistIntelligenceBundle` | Empty + onboarding text | Medium |
| Markets | `getDashboardPayload` | `{ assets: [], hero: emptyHero() }` | Medium — `/markets` hub redirect kullanıyor |
| Social | 20+ discussion methods | `EMPTY_*` / `[]` / `null` | **High** — tüm discussion katmanı |
| Signals | `getMarketSignalIntelligence` | `EMPTY_MARKET_SIGNAL_INTELLIGENCE` | Medium — hook `buildMarketSignalIntelligence(rows)` telafi ediyor |
| Signals | `getAssetSignalCommunityPulse` | EMPTY | High — asset community |
| Personalization | `getAffinityContext` / `getInterestIntelligence` | `EMPTY_CTX` / `EMPTY_INTEL` | **High** |
| Personalization | `getDiscoverExploreSurface` | `EMPTY_EXPLORE` | High |
| Personalization | `getRecommendationNetworkBundle` | `EMPTY_REC_BUNDLE` | High |
| Onboarding | `getCatalog` | `EMPTY_CATALOG` | **Critical** |
| Onboarding | `saveDraft` / `applyBootstrap` | no-op / `null` | Critical |
| CloseFriends | `getPrivateCirclesHub` / `getCircleDetail` | `live_sparse` | Critical |
| Playlists | `getPlaylistDetail` | `null` | **Critical** — fetch yok |
| Subscriptions | `getSubscriptionsHub` (repo only) | `live_sparse` | Medium — hook telafi kısmen |
| Settings | `getAccountControlHub` | `live_sparse` | High |
| Studio | `getLiveSchedule` | `[]` | Medium |
| Studio | `getCreatorEconomyHub` | sparse assembler | High |
| Home | `getStories` | `[]` | Medium — `fetch-stories` ayrı çalışıyor |
| Home | `getDiscoverSections` | `[]` | Medium |

---

## Component Fallback Findings

| File | Condition | Fallback | Correct? | Risk |
|------|-----------|----------|----------|------|
| 5× `*-category-page-client.tsx` | `!data && !mockOn && (fetchError \|\| !hasGlobalAssets)` | `<MarketsPageClient initialSegment=…>` | **Yes** (post-restore) | P2 |
| 5× category clients | `!data && category empty, global OK` | Category `EmptyState` in `*-canvas` | **Yes** | Low |
| BIST/NASDAQ fallback | `initialSegment="stocks"` both | Same segment | Partial | P1 |
| `playlist-page-client.tsx` | `!detail` live | EmptyState "hazırlanıyor" | Yes (not generic page) | P1 stub |
| `onboarding-wizard-client.tsx` | `sparseCatalog` | Custom card, not redirect | Yes | P0 product |
| `messages-page-client.tsx` | `!mockOn && conversations.length===0` | Full-page EmptyState | Acceptable | P2 |
| `discover-vertical-page-shell.tsx` | `feedError` | Banner "Örnek içerik" (live'da içerik boş) | **Misleading** | P1 |
| `market-symbol-page-client.tsx` | `!bundle` | EmptyState (live: empty bundle always exists) | Stays on route | Low |
| `watchlist-page-client.tsx` | empty symbols | EmptyState | Yes | Low |
| `portfolio-page-client.tsx` | `!mockOn` no holdings | EmptyState / minimal list | Yes | Low |
| `signals-page-client.tsx` | `emptyCatalog` | Contextual EmptyState | Yes | Low |
| `channel-page-client.tsx` | `!profile` | Custom not-found | Yes | Low |
| `home-editorial-home.tsx` | legacy chips | `router.replace` → discover | Intentional | Low |
| `markets-category-page-client.tsx` | (dead stub) | Placeholder text | Unreachable | P3 |

**Sonuç:** Markets regression sınıfındaki **koşulsuz genel sayfa swap** başka yerde **yok**.

---

## Page-by-Page Audit

### 1. Home — LIVE_PARTIAL
- **Mock:** Editorial feed, ambient rails (sana özel, topluluk), stories, interest rails, discussion widgets.
- **Live:** `useHomeFeed` gerçek posts; market strip `useMarketAssetsLive`; editorial today/trending boş olabilir; ambient mock-only bölümler gizli; stories DB'den (boş olabilir).
- **Risk:** P1 zenginlik kaybı sağ rail ve topic rails.

### 2. Discover — LIVE_PARTIAL
- **Mock:** VR static fallback ile dolu grid.
- **Live:** Feed gerçek; VM yalnızca posts'tan türetilir; boş feed → boş grid (doğru).
- **Risk:** P1 error banner metni yanıltıcı.

### 3–5. Pulse / Videos / Live — LIVE_PARTIAL
- `DiscoverVerticalPageShell` + tab-specific renderer.
- Live feed çalışır; auxiliary VM chips (topic ecosystems, desk heat) mock'ta VR'den gelir, live'da sparse.

### 6. Watch detail — LIVE_PARTIAL
- Video player + related sidebar çalışır.
- `watch-markets-discussion-context`, asset pulse strip → repo empty / mock-only.

### 7. Post detail — LIVE_PARTIAL
- Post + comments fetch.
- `post-detail-sidebar` → `getPostDiscussionSidecar` EMPTY.

### 8. Channel/Profile — LIVE_PARTIAL
- Profile, posts, signals fetch OK.
- Community inset, discussion teasers mock-only.

### 9. Creators — LIVE_FULL*
- RPC directory; featured/live badges DB'ye bağlı.

### 10–11. Signals / Signal detail — LIVE_PARTIAL
- Feed, hero, intel, leaderboard, marketplace rails live builder ile çalışır.
- Discussion panel, topic community rail, creator room link → mock-only hidden.
- Affinity null → rails basit.

### 12–13. Market News / Economic Calendar — LIVE_FULL*
- Fetch hooks tam bağlı; empty = DB boş.

### 14. Markets hub — LIVE_FULL
- `/markets` → redirect crypto category.

### 15. Market symbol detail — LIVE_PARTIAL
- `ad-canvas` render; live price merge.
- Intel sections: placeholder metinler ("Canlı katman kapalı", "Tartışma verisi bekleniyor").
- Community tabs boş.

### 16. Watchlist — LIVE_PARTIAL
- Symbols watchlist OK.
- Intelligence bundle, personalized signals, community context empty.

### 17. Portfolio — LIVE_PARTIAL
- Live: minimal holdings list.
- Mock: full `pf-canvas` with charts/intel.

### 18. Price Alerts — LIVE_FULL*
- `price_alerts` table fetch.

### 19–20. Messages / Notifications — LIVE_PARTIAL / LIVE_FULL*
- Fetch OK; messages empty loses hub chrome.

### 21. Saved — LIVE_FULL*
- `saved_posts` fetch.

### 22. Upload — LIVE_PARTIAL
- Write-gated; mock demo labels.

### 23–28. Studio — LIVE_PARTIAL
- Content/drafts/scheduled/playlists: fetch OK.
- Dashboard overview zeros; analytics RPC (zeros if no data); economy sparse; live schedule stub.

### 29–30. Subscriptions — LIVE_PARTIAL
- Catalog from `profiles.subscription_price`; rails/intel empty.

### 31. Settings — LIVE_PARTIAL
- Form works session-only; personalization intel `live_sparse`.

### 32. Onboarding — PRODUCT_BLOCKED
- `EMPTY_CATALOG`; mutations no-op.

### 33. Close Friends — PRODUCT_BLOCKED
- Explicit `live_sparse`; no backend.

### 34. Search/Results — LIVE_PARTIAL
- Search fetch sparse; results community hint mock-only.

---

## Production Smoke Findings

**Tarih:** 5 Haziran 2026  
**Yöntem:** `Invoke-WebRequest` HTML grep  
**Sınırlama:** Çoğu sayfa `"use client"` — SSR HTML'de canvas class'ları hydration öncesi görünmeyebilir. Kategori sayfaları istisna (server/initial render'da marker var).

| Route | HTTP | Marker Evidence | Notes |
|-------|------|-----------------|-------|
| `/` | 200 | `editorial-home` pattern | Ana akış render |
| `/discover` | 200 | `discover-visual` | Hub render |
| `/pulse`, `/videos`, `/live` | 200 | `DiscoverVertical` marker SSR'da yok | Client shell; feed runtime |
| `/creators` | 200 | creators marker | |
| `/signals` | 200 | signals marker | |
| `/market-news` | 200 | marker SSR'da yok | `mnr-page` client-only |
| `/economic-calendar` | 200 | marker SSR'da yok | `ec-page` client-only |
| `/markets/category/crypto` | 200 | **`crypto-canvas=True`**, `markets-fluid-scope=False` | **Regression fixed** |
| `/markets/category/forex` | 200 | `forex-canvas=True` | Fixed |
| `/markets/category/bist` | 200 | `bist-canvas=True` | Fixed |
| `/markets/category/nasdaq` | 200 | `nasdaq-canvas=True` | Fixed |
| `/markets/category/commodities` | 200 | `commodities-canvas=True` | Fixed |
| `/watchlist` | 200 | watchlist marker | |
| `/portfolio` | 200 | `pf-canvas` | |
| `/price-alerts` | 200 | marker | |
| `/notifications` | 200 | marker | |
| `/messages` | 200 | marker SSR'da yok | `msg-canvas` client |
| `/studio`, `/studio/analytics` | 200 | marker SSR'da yok | Client |
| `/subscriptions` | 200 | partial | |
| `/settings` | 200 | marker SSR'da yok | `sg-shell` client |
| `/onboarding` | 200 | **"Sunucu kataloğu bekleniyor"** | PRODUCT_BLOCKED confirmed |
| `/close-friends` | 200 | sparse empty copy | PRODUCT_BLOCKED confirmed |
| `/saved`, `/upload`, `/profile` | 200 | markers | |
| Tüm route'lar | — | **mock-mode-badge=False** | Production mock kapalı ✅ |

---

## User-Perceived Regression List

### P0 — Kullanıcı yanlış/eksik sayfa veya feature kaybı

| ID | Alan | Sorun | Kanıt |
|----|------|-------|-------|
| P0-001 | Onboarding | Wizard unusable; yalnızca "Sunucu kataloğu bekleniyor" | `supabase-onboarding-repository.ts` `EMPTY_CATALOG` |
| P0-002 | Close Friends | Tüm hub/detail boş `live_sparse` | `supabase-close-friends-repository.ts` |
| ~~P0-003~~ | Markets categories | ~~Genel fallback~~ | **FIXED** — live restore sprint |

### P1 — Feature var ama fakir / widget kayıp

| ID | Alan | Sorun |
|----|------|-------|
| P1-001 | Discussion/Community layer | 10+ social + 6 markets + 3 signals widget mock-only gizli |
| P1-002 | Home right rail | "Sana özel" + "Topluluk" bölümleri live'da yok |
| P1-003 | Personalization rails | 3 rail component `return null` live'da |
| P1-004 | Asset symbol detail | Canvas var; intel/community placeholder |
| P1-005 | Watchlist | Intelligence bundle boş |
| P1-006 | Portfolio | Minimal live UI vs zengin mock |
| P1-007 | Studio economy | `data_sparse: true` |
| P1-008 | Playlists | Detail always null live |
| P1-009 | Subscriptions | Rails/active memberships empty |
| P1-010 | Settings | Personalization intel panel blank |
| P1-011 | Discover error UX | "Örnek içerik" banner yanıltıcı (live'da boş) |
| P1-012 | BIST/NASDAQ fallback | Both `initialSegment="stocks"` on global fail |

### P2 — UX polish / nice-to-have

| ID | Alan | Sorun |
|----|------|-------|
| P2-001 | Messages | Live-empty full-page gate loses hub |
| P2-002 | Studio live schedule | Always empty |
| P2-003 | Home stories | Empty if no DB stories |
| P2-004 | Economic calendar detail | Narrative shift placeholder |
| P2-005 | Category global fail | URL/category canvas → markets-fluid-scope DOM |

### P3 — Teknik borç

| ID | Alan | Sorun |
|----|------|-------|
| P3-001 | `markets-category-page-client.tsx` | Dead stub |
| P3-002 | Social repo mark-read/send | no-op TODO |
| P3-003 | Home deprecated repo methods | `getHomeSections` etc. always `[]` |

---

## Restore Feasibility Matrix

| Issue | WEB Mapper? | RPC? | Table? | Edge/Feed? | Product? | Decision |
|-------|-------------|------|--------|------------|----------|----------|
| P0-003 Categories | ✅ Done | ❌ | ❌ | ❌ | ❌ | **RESTORED** |
| P1-004 Asset symbol intel | ✅ Partial | Optional | ❌ | Optional | ❌ | **WEB_MAPPER_ENOUGH** (price+signals+news merge) |
| P1-005 Watchlist intel | ✅ | ❌ | ❌ | ❌ | ❌ | **WEB_MAPPER_ENOUGH** |
| P1-001 Discussion layer | Partial | ✅ | ✅ | ❌ | Maybe | **NEEDS_RPC** + product |
| P1-002 Home ambient rails | ✅ derive | ❌ | ❌ | ❌ | ❌ | **WEB_MAPPER_ENOUGH** (hide vs derive) |
| P1-003 Personalization rails | ✅ local | ✅ | ✅ | ❌ | ❌ | **NEEDS_RPC** for server affinity |
| P1-008 Playlists | ✅ | Optional | ❌ | ❌ | ❌ | **WEB_MAPPER_ENOUGH** (`fetch-studio` playlists + join) |
| P1-007 Studio economy | Partial | ✅ | ✅ | ❌ | ❌ | **NEEDS_RPC** |
| P0-001 Onboarding | ❌ | ✅ | ✅ | ❌ | ✅ | **PRODUCT_DECISION** |
| P0-002 Close friends | ❌ | ✅ | ✅ | ❌ | ✅ | **PRODUCT_DECISION** |
| P1-009 Subscriptions rails | Partial | ✅ | ❌ | ❌ | ❌ | **NEEDS_RPC** |
| P1-011 Discover error copy | ✅ | ❌ | ❌ | ❌ | ❌ | **WEB_MAPPER_ENOUGH** (copy fix) |
| P1-006 Portfolio UI | ✅ | ❌ | ❌ | ❌ | ❌ | **WEB_MAPPER_ENOUGH** |
| P1-010 Settings intel | ✅ derive | ❌ | ❌ | ❌ | ❌ | **WEB_MAPPER_ENOUGH** or **SHOULD_HIDE** |

---

## Risk Ranking

| Rank | Issue | Severity | Effort | Impact |
|------|-------|----------|--------|--------|
| 1 | Discussion/community mock-only layer | P1 | High | Görünür sosyal zenginlik kaybı |
| 2 | Asset symbol intel placeholders | P1 | Medium | Markets detay sayfası güven kaybı |
| 3 | Onboarding PRODUCT_BLOCKED | P0 | Backend | Yeni kullanıcı akışı |
| 4 | Close friends PRODUCT_BLOCKED | P0 | Backend | Premium feature boş |
| 5 | Playlists stub | P1 | Low-Med | Studio→playlist loop kırık |
| 6 | Home/personalization rails hidden | P1 | Med | Ana sayfa fakir |
| 7 | Discover error banner copy | P1 | Low | Yanıltıcı UX |
| 8 | Studio economy sparse | P1 | Med | Creator monetization görünümü |
| 9 | Watchlist/portfolio richness | P1 | Med | Markets UX |
| 10 | Subscriptions rails | P1 | Med | Membership discovery |

---

## Recommended Fix Roadmap

### SPRINT A — P0/P1 Visible Live Regression Restore (WEB-only)

**Hedef:** Mock rich/live poor alanlarda mevcut tablolarla mapper; yanıltıcı UX düzeltme.

| Görev | Dosyalar | Backend? |
|-------|----------|----------|
| Asset symbol live intel mapper | `build-asset-intelligence-from-assets.ts`, `market-symbol-page-client.tsx` | ❌ |
| Watchlist intel mapper | `build-watchlist-intelligence-from-assets.ts`, `watchlist-page-client.tsx` | ❌ |
| Playlist detail fetch | `fetch-playlist-detail.ts`, `playlist-page-client.tsx` | ❌ |
| Discover error copy fix | `discover-vertical-page-shell.tsx` | ❌ |
| Portfolio live UI parity (phase 1) | `portfolio-page-client.tsx` | ❌ |
| BIST/NASDAQ fallback segment | category clients `initialSegment` | ❌ |
| Conditional widget empty states | markets/social components (hide vs compact empty) | ❌ |

**Deploy:** Evet (WEB only)

### SPRINT B — P1 Richness Restore (WEB mapper + light RPC)

**Hedef:** Home rails, settings intel, subscriptions catalog enrichment.

| Görev | Dosyalar | Backend? |
|-------|----------|----------|
| Home editorial live chips fallback | `use-home-editorial-chips.ts`, `build-editorial-rail.ts` | ❌ |
| Home ambient live section (derived) | `home-ambient-rail.tsx` | ❌ |
| Settings personalization derive | `settings-page-client.tsx` | ❌ |
| Subscriptions active memberships | `fetch-membership-catalog.ts` | Optional RPC |
| Studio economy partial mapper | `assemble-creator-studio-economy-hub.ts` | ❌ partial |

**Deploy:** Evet

### SPRINT C — Stub/Feature Cleanup & Product Gates

**Hedef:** Bilinçli boş feature'ları netleştir veya gizle.

| Görev | Karar |
|-------|-------|
| Onboarding | `PRODUCT_DECISION`: RPC+table veya route gizle |
| Close friends | `PRODUCT_DECISION`: backend veya beta'da nav gizle |
| Discussion layer | `SHOULD_HIDE` live'da vs `NEEDS_RPC` restore |
| Personalization server affinity | `NEEDS_RPC` post-beta |
| Studio live schedule | `SHOULD_HIDE` veya `NEEDS_TABLE` |

### SPRINT D — Observability / QA

- Production smoke script: client marker + authenticated paths
- Mock false CI gate: `isMockDataEnabled()` false integration snapshot
- Regression guard: category canvas grep (already passing)
- Dashboard: repo method → fetch bypass coverage matrix

---

## Final Decision

# `REGRESSIONS_FOUND_FIXABLE_WITH_WEB`

---

## Cevaplar (Özet)

### 1. Markets regression'a benzer başka P0 var mı?

**Hayır** (aktif). Kategori sayfaları düzeltildi. Benzer "özel sayfa → genel `MarketsPageClient`" pattern'i başka route'ta **koşulsuz** çalışmıyor. Playlist ve onboarding **stub/empty** döndürüyor ama farklı sayfaya swap etmiyor.

### 2. Mock güzel / live fakir en önemli alanlar?

1. **Discussion/Community katmanı** (social + markets + signals widget'ları)
2. **Home sağ rail** (sana özel, topluluk, topic rails)
3. **Asset symbol intel** (placeholder metinler)
4. **Onboarding + Close Friends** (bilinçli product block)
5. **Playlists detail** (null)
6. **Studio economy hub**
7. **Watchlist/Portfolio zenginlik**

### 3. WEB mapper ile çözülebilir?

- Asset symbol intel (kısmi)
- Watchlist intel
- Playlist detail (`playlists` + `posts` join)
- Home editorial chips / market strip (kısmen var)
- Portfolio UI phase 1
- Discover error copy
- Category widget empty states (kategori restore pattern'i)

### 4. Backend/RPC/feed ister?

- Discussion/community (posts comments aggregation, topic graph)
- Onboarding catalog + bootstrap persistence
- Close friends circles + feed
- Server-side personalization affinity
- Studio economy revenue
- Subscriptions active memberships / rails
- Studio live schedule

### 5. Bir sonraki sprintte ne yapılmalı?

**SPRINT A** öncelik:
1. Asset symbol live intel mapper
2. Playlist detail fetch
3. Discover error banner copy fix
4. Watchlist intel mapper
5. Discussion widget'lar için compact empty vs hide matrisi (mock data sızmadan)

**Defer (ürün kararı):** Onboarding, Close Friends backend sprintine kadar nav'da beta etiketi veya gizleme.

---

*Audit tamamlandı. Kod değişikliği yok.*
