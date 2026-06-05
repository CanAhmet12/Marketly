# WEB FEATURE REALITY MATRIX REPORT

**Tarih:** 5 Haziran 2026  
**Yöntem:** Kod taraması (47 route, 7 repo, 7 fetch, 20+ component). Hiçbir dosya değiştirilmedi.  
**Önceki Rapor Bağlantısı:** WEB_MOCK_CENTRALIZATION_AUDIT_REPORT.md (MC-001…MC-013)

---

## Executive Summary

Marketly WEB'de **47 dashboard route** analiz edildi. Mock kapalıyken:

- **14 route gerçek Supabase verisi kullanıyor** (feed, post, watch, search, upload, messages, notifications, studio content/drafts, stories vb.)
- **12 route kısmen canlı** — fetch katmanı gerçek, chrome/intel/analytics stub
- **12 route tamamen stub/sparse** — backend veya RPC eksik
- **4 route yapısal UI riski taşıyor** — sahte veri karışımı veya boş metrik gösterimi

**En kritik sorun:** Discover sayfası (`/discover`) gerçek feed + tamamen statik VR chrome kombinasyonu — kullanıcı gerçek içerik sandığı demo tiles görüyor. (MC-001/002)

---

## Route Inventory

| Route | Page/Component | Feature | Data Source (mock=false) | Status |
|-------|---------------|---------|--------------------------|--------|
| `/` | `HomeEditorialHome` | home, feed | `fetchHomeFeedPage` (`posts`+`follows`) | REAL_PARTIAL |
| `/discover` | `DiscoverVisualReferenceContainerLazy` | discover | `fetchDiscoverFeedPage` + **VR static fallback** | REAL_PARTIAL ⚠️ |
| `/signals` | `SignalsPageClient` | signals | `fetchSignalsFeed` (`signals`+`profiles`) | REAL_READY |
| `/signals/[id]` | `SignalDetailPageClient` | signals | same catalog + URL param | REAL_PARTIAL |
| `/creators` | `CreatorsPageClient` | creators | `SupabaseCreatorsRepository` → `creators:[]` | MOCK_ONLY |
| `/notifications` | `NotificationsPageClient` | social/notifications | `fetchNotifications` (`notifications`) | REAL_READY |
| `/messages` | `MessagesPageClientLazy` | social/messages | `fetchConversations`+`fetchMessages` | REAL_READY |
| `/messages/[conversationId]` | `MessagesPageClientLazy` | social/messages | same | REAL_READY |
| `/studio` | `StudioDashboardClient` | studio | `getDashboardOverview` → sıfır metrikler | EMPTY_STATE_NEEDED |
| `/studio/live` | `StudioLiveClient` | studio | `getLiveSchedule` → `[]` | BACKEND_GAP |
| `/studio/drafts` | `StudioDraftsClient` | studio | `fetchStudioDrafts` (`post_drafts`) | REAL_READY |
| `/studio/content` | `StudioContentClient` | studio | `fetchStudioContent` (`posts`) | REAL_READY |
| `/studio/content/[id]/edit` | `StudioContentEditClient` | studio | `getContentItems` → `[]` (fetch yok) | BACKEND_GAP |
| `/studio/scheduled` | `StudioScheduledClient` | studio | `fetchStudioScheduled` (`scheduled_posts`) | REAL_READY |
| `/studio/playlists` | `StudioPlaylistsClient` | studio | `fetchStudioPlaylists` (`playlists`) | REAL_READY |
| `/studio/analytics` | `StudioAnalyticsClient` | studio | `getAnalyticsBundle` → `emptyAnalytics` | BACKEND_GAP |
| `/studio/economy` | `StudioEconomyHubClient` | studio | assembled stub | MOCK_ONLY |
| `/subscriptions` | `SubscriptionsHubClient` | subscriptions | sparse hub `catalog:[]` | MOCK_ONLY |
| `/subscriptions/[creatorId]` | `MembershipDetailClient` | subscriptions | generic stub | MOCK_ONLY |
| `/onboarding` | `OnboardingWizardClient` | onboarding | `EMPTY_CATALOG` | BACKEND_GAP |
| `/live` | `LivePageClient` | discover | discover VM + VR | REAL_PARTIAL |
| `/live/[id]` | `LiveWatchClient` | live/watch | `fetchWatchPost` + Agora edge | REAL_PARTIAL |
| `/upload` | `UploadPageClientLazy` | upload | `uploadToBucket`+`insertUploadPost` | REAL_READY |
| `/settings` | `SettingsPageClient` | social/settings | `live_sparse`; profile in-memory | REAL_PARTIAL |
| `/close-friends` | `CloseFriendsPageClient` | close-friends | `live_sparse` | MOCK_ONLY |
| `/close-friends/circle/[circleId]` | `PrivateCircleDetailClient` | close-friends | sparse | MOCK_ONLY |
| `/market-news` | `MarketNewsroomPageClient` | markets | stub + Unsplash | HARDCODED_MOCK |
| `/market-news/[id]` | `MarketNewsDetailClient` | markets | stub | MOCK_ONLY |
| `/economic-calendar` | `EconomicCalendarIntelligencePageClient` | markets | `getEconomicCalendar` → `[]` | MOCK_ONLY |
| `/economic-calendar/[id]` | `EconomicCalendarEventDetailClient` | markets | stub | MOCK_ONLY |
| `/portfolio` | `PortfolioPageClient` | markets | `fetchPortfolioHoldings` (`portfolio_holdings`) | REAL_READY |
| `/price-alerts` | `PriceAlertsPageClient` | markets | `fetch-price-alerts` (kısmen) | REAL_PARTIAL |
| `/markets/category/[category]` | category clients | markets | `fetchMarketAssets` (`asset_prices`) | REAL_READY |
| `/markets/[symbol]` | `MarketSymbolPageClient` | markets | fetch + stub intel | REAL_PARTIAL |
| `/profile` | `ProfileEntryClient` | channel | redirect → own channel | REAL_READY |
| `/channel/[id]` | `ChannelPageClientLazy` | channel | `fetchChannelProfile`+`fetchChannelPosts` | REAL_READY |
| `/post/[id]` | `PostDetailClient` | post | `fetchPost` Supabase | REAL_READY |
| `/watch/[id]` | `WatchPageClient` | watch | `fetchWatchPost` Supabase | REAL_READY |
| `/playlist/[id]` | `PlaylistPageClient` | playlists/watch | `fetchWatchPost`; related mock | REAL_PARTIAL |
| `/pulse` | `PulsePageClient` | discover/pulse | discover feed filtered | REAL_PARTIAL |
| `/pulse/[id]` | `PulsePlayerClient` | pulse/watch | `fetchWatchPost` | REAL_READY |
| `/videos` | `VideosPageClient` | discover | discover feed | REAL_PARTIAL |
| `/results` | `SearchPageClient` | search | `fetch-search-results` Supabase | REAL_READY |
| `/watchlist` | `WatchlistPageClient` | markets | `fetch-watchlist` (`watchlists`) | REAL_READY |
| `/saved` | `SavedPageClient` | social | `fetch-saved-posts` Supabase | REAL_READY |

---

## Feature Reality Matrix

| Pri | Feature | Route/Component | Status | Data Source | Backend? | Repo? | Empty State? | Risk | Action |
|-----|---------|----------------|--------|-------------|----------|-------|-------------|------|--------|
| P0 | **Discover VR fallback** | `/discover` `discover-view-model-adapter.ts:359-369` | HARDCODED_MOCK | Static VR array `discover-visual-reference-data.ts:155-913` | ❌ | ❌ | Yok (VR dolduruyor) | 🔴 Sahte içerik | MC-001: mock guard ekle |
| P0 | **Market news Unsplash** | `/market-news` `market-news-shared.ts:8-32` | HARDCODED_MOCK | Hardcoded Unsplash map | ⚠️ `image_url` DB'de | ❌ | Yok | 🔴 3.parti URL | MC-003: gerçek image_url |
| P1 | Home feed | `/` `fetch-home-feed.ts:161-180` | REAL_READY | `posts`+`follows`+`post_likes` | ✅ | ✅ | ✅ `HomeGridPlaceholderCards` | 🟢 | — |
| P1 | Home editorial sections | `/` `supabase-home-repository.ts:40-96` | BACKEND_GAP | `getHomeSections`→`[]` | ❌ | Stub | Silently gizli | 🟡 Boş rail | MC-009: gizle veya empty state |
| P1 | Home stories | `/` `fetch-stories.ts:27-87` | REAL_READY | `stories`+`profiles`+`story_views` | ✅ | ✅ | ✅ Boş rail | 🟢 | — |
| P1 | Signals catalog | `/signals` `fetch-signals-feed.ts:61-130` | REAL_READY | `signals`+`assets`+`profiles` | ✅ | ✅ | ✅ EmptyState | 🟢 | — |
| P1 | Signals marketplace | `/signals` `supabase-signals-repository.ts:70-71` | BACKEND_GAP | `getMarketplaceRails`→`[]` | ❌ | Stub | Gizli/boş | 🟡 | P2 backlog |
| P1 | Post detail | `/post/[id]` `fetch-post-detail.ts` | REAL_READY | `posts`+`profiles`+`post_likes` | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Watch/Video | `/watch/[id]` `fetch-watch-post.ts` | REAL_READY | `posts`+Supabase | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Post comments | `/post/[id]` `fetch-post-comments.ts` | REAL_READY | `comments`+`comment_likes` | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Video comments | `/watch/[id]` `fetch-video-comments.ts` | REAL_READY | `video_comments`+`profiles` | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Search | `/results` `fetch-search-results.ts` | REAL_READY | `posts`+`profiles`+`assets`+`signals` | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Notifications | `/notifications` `fetch-notifications.ts` | REAL_READY | `notifications` | ✅ | ✅ | ✅ Boş state | 🟡 actor_avatar_url eksik | MC: avatar mapping |
| P1 | Direct Messages | `/messages` `fetch-conversations.ts` | REAL_READY | `dm_conversations`+`dm_messages` | ✅ | ✅ | ✅ EmptyState | 🟢 | — |
| P1 | Channel / Profile | `/channel/[id]` `fetch-channel-*.ts` | REAL_READY | `profiles`+`posts`+`signals`+`follows` | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Upload | `/upload` `storage-upload.ts` | REAL_READY | Storage buckets + `posts` insert | ✅ | ✅ | ✅ validation | 🟡 Signal kind stub | Sinyal upload ayrı tablo gerektirir |
| P1 | Stories display | `/` `/channel` `fetch-stories.ts` | REAL_READY | `stories`+`story_views` | ✅ | ✅ | ✅ boş rail | 🟡 static fallback discover | MC-001 bağlı |
| P1 | Saved posts | `/saved` `fetch-saved-posts.ts` | REAL_READY | `saved_posts`+`posts` | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Market prices | `/markets/category/[cat]` `use-market-assets.ts` | REAL_READY | `asset_prices`+`assets` | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Watchlist | `/watchlist` `fetch-watchlist.ts` | REAL_READY | `watchlists` | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Portfolio | `/portfolio` `fetch-portfolio-holdings.ts` | REAL_READY | `portfolio_holdings`+`asset_prices` | ✅ | ✅ | ✅ EmptyState | 🟢 | — |
| P1 | Price alerts | `/price-alerts` `fetch-price-alerts.ts` | REAL_PARTIAL | `price_alerts`+`assets` | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Live watch | `/live/[id]` `live-watch-client.tsx` | REAL_PARTIAL | `fetchWatchPost`+Agora edge | ✅ (edge dep.) | ✅ | ✅ "Yayın bekleniyor" | 🟡 Agora env | AGORA_APP_ID env |
| P1 | Studio content | `/studio/content` `fetch-studio.ts` | REAL_READY | `posts` | ✅ | ✅ | ✅ EmptyState | 🟢 | — |
| P1 | Studio drafts | `/studio/drafts` `fetch-studio.ts` | REAL_READY | `post_drafts` | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Studio scheduled | `/studio/scheduled` `fetch-studio.ts` | REAL_READY | `scheduled_posts` | ✅ | ✅ | ✅ | 🟢 | — |
| P1 | Studio playlists | `/studio/playlists` `fetch-studio.ts` | REAL_READY | `playlists` | ✅ | ✅ | ✅ | 🟢 | — |
| P2 | Studio dashboard | `/studio` `supabase-studio-repository.ts:61-78` | EMPTY_STATE_NEEDED | `getDashboardOverview`→sıfır | ❌ Analytics RPC | Stub | ❌ Sıfır metrik | 🟡 Yanıltıcı 0 | MC-006: "Henüz içerik yok" |
| P2 | Studio analytics | `/studio/analytics` `supabase-studio-repository.ts:87-89` | BACKEND_GAP | `getAnalyticsBundle`→empty | ❌ | Stub | ❌ Boş grafik | 🟡 | P3: analytics RPC |
| P2 | Studio content edit | `/studio/content/[id]/edit` | BACKEND_GAP | `getContentItems`→`[]` | ❌ edit API | Stub | ❌ | 🟡 | Fetch bağlantısı ekle |
| P2 | Groups / Group chat | Yok (route yok) | UI_ONLY_NO_BACKEND | — | `group_*` tabloları var | Yok | — | 🟢 (route yok) | WEB route henüz yok |
| P2 | Creators directory | `/creators` `supabase-creators-repository.ts:7-13` | BACKEND_GAP | `creators:[]` | ❌ RPC yok | Stub | ✅ EmptyState | 🟢 | `get_creators_directory` RPC |
| P2 | Suggested users | Sidebar widgets | MOCK_ONLY | mock adapters | ❌ | — | — | 🟡 | `follows` + profiles |
| P2 | Trending widgets | Sidebar/home rail | MOCK_SYSTEM_ONLY | `editorial-rail-extras` | ❌ | — | Silently gizli | 🟢 | mv_trending RPC |
| P3 | Asset detail intel | `/markets/[symbol]` `market-symbol-page-client.tsx` | REAL_PARTIAL | `fetch-price-alerts`+stub intel | ❌ intel | Kısmi | ✅ | 🟡 | Signal intel RPC |
| P3 | Market news | `/market-news` | HARDCODED_MOCK | Unsplash map | ⚠️ `image_url` DB | Stub | ❌ | 🔴 | MC-003 |
| P3 | Economic calendar | `/economic-calendar` | BACKEND_GAP | `getEconomicCalendar`→`[]` | `economic_events` boş | Stub | ✅ Boş | 🟢 | Veri beslemesi |
| P3 | Subscriptions | `/subscriptions` | MOCK_ONLY | `live_sparse` | ❌ Ürün kararı | Stub | ✅ sparse hub | 🟢 | Ürün kararı |
| P3 | Onboarding | `/onboarding` | BACKEND_GAP | `EMPTY_CATALOG` | ❌ RPC yok | Stub | "Bekleniyor" mesajı | 🟢 | `profiles.onboarding_json` RPC |
| P3 | Personalization | Hook layer | MOCK_SYSTEM_ONLY | `EMPTY_CTX` client rank | ❌ Affinity API | Stub | — | 🟢 | Edge Fn + affinity RPC |
| P3 | Close friends circles | `/close-friends` | MOCK_ONLY | `live_sparse` | `close_friends` tablosu var | Stub | sparse hub | 🟢 | Repository impl |
| P3 | Settings persistence | `/settings` | REAL_PARTIAL | in-memory profile seed | ❌ preferences save | In-memory | sparse hub | 🟡 | `profiles` prefs columns |
| P3 | Auth login/register | `/auth/*` `auth-provider.tsx` | REAL_READY | Supabase Auth | ✅ | ✅ | ✅ | 🟢 | — |
| P3 | Signal subscriber | `use-mock-signal-subscriber.ts` | HARDCODED_MOCK | localStorage (mock guard yok) | — | — | — | 🟡 | MC-004: guard ekle |

---

## Repository / Fetch Layer Matrix

| Modül | Real Repo Gerçek Sorgular | Mock Repo | Factory OK | Live Davranış | Problem | Öneri |
|-------|--------------------------|-----------|-----------|--------------|---------|-------|
| **home** | `getHomeFeed` → `fetch-home-feed.ts` ✅ | ✅ | ✅ | Feed gerçek; sections/stories/trending/live stub `[]` | 7 stub metod | `getStories` bypass var; sections empty state |
| **signals** | `hydrateFeedCache` → `fetchSignalsFeed` ✅ | ✅ | ✅ | Feed gerçek; marketplace/leaderboard/cards `[]` | 8 stub metod | Leaderboard RPC bağlı (`get_leaderboard_analysts`) |
| **social** | Repo stub; **bypass:** `fetch-notifications.ts` + `fetch-conversations.ts` hook'larda | ✅ | ✅ | Notifications/messages fetch gerçek; settings in-memory | Çift katman riski | Repo metodlarını da güncelle |
| **subscriptions** | `live_sparse` | ✅ | ✅ | Sparse hub (bilinçli) | Ürün kararı bekliyor | Bekle |
| **onboarding** | `EMPTY_CATALOG`; TODO `profiles.onboarding_json` | ✅ | ✅ | "Sunucu kataloğu bekleniyor" | RPC yok | Bekle |
| **personalization** | `EMPTY_CTX`; client rank localStorage | ✅ | ✅ | Cold start; localStorage rank çalışır | Affinity API yok | Edge Fn + RPC |
| **creators** | `creators:[]` | ✅ | ✅ | EmptyState | `get_creators_directory` RPC yok | RPC implement |
| **markets** | `getDashboardPayload`→boş; `getEconomicCalendar`→`[]`; `getMarketNewsStrip`→`[]` | ✅ | ✅ | Hub shell (boş); **live prices ayrı hook** `use-market-assets.ts` ✅ | Intel/news stub | Unsplash MC-003; news images real |
| **studio** | `getDashboardOverview`→0; **bypass: fetch-studio.ts** content/drafts/scheduled/playlists ✅ | ✅ | ✅ | Content gerçek; dashboard 0 metrik | Analytics RPC yok | Empty state P2 |
| **fetch-home-feed** | ✅ `posts`+`follows`+`post_likes`+`saved_posts` | — | — | Gerçek | — | — |
| **fetch-signals-feed** | ✅ `signals`+`assets`+`profiles` | — | — | Gerçek | `symbol` değil `asset_id` | — |
| **fetch-stories** | ✅ `stories`+`profiles`+`story_views` | — | — | Gerçek | Discover'da static fallback | MC-001 bağlı |
| **fetch-market-assets** | ✅ `asset_prices`+`assets` | — | — | Gerçek, 60s refresh | — | — |
| **fetch-notifications** | ✅ `notifications` | — | — | Gerçek | actor_avatar_url eksik | avatar mapping |
| **fetch-conversations** | ✅ `dm_conversations`+`dm_messages`+`profiles` | — | — | Gerçek | — | — |
| **fetch-studio** | ✅ `posts`+`post_drafts`+`scheduled_posts`+`playlists` | — | — | Gerçek | edit endpoint yok | Studio content edit |

---

## Backend Gap Matrix

| Feature | Eksik Backend | Tür | Öncelik |
|---------|-------------|-----|---------|
| Home editorial sections | `getHomeSections` query / sections API | DB query / RPC | P2 |
| Home trending signals | `getTrendingSignals` query | DB query | P2 |
| Home recommended creators | Creator recommendation RPC | RPC | P2 |
| Home live now | `getLiveNow` query | `live_sessions` query | P2 |
| Discover VR chrome | Real topic/ticker data | DB query + RPC | P1 (MC-001 fix) |
| Signals marketplace | `getMarketplaceRails` | RPC | P2 |
| Signals leaderboard sections | `getAnalystLeaderboardSections` | RPC (get_leaderboard_analysts bağlı) | P1 |
| Studio analytics | Analytics RPC | RPC | P3 |
| Studio content edit | Edit API | REST endpoint | P2 |
| Studio live schedule | `getLiveSchedule` | `scheduled_streams` query | P2 |
| Creators directory | `get_creators_directory` RPC | RPC | P2 |
| Market news images | Gerçek `image_url` DB | `market_news.image_url` | P1 (MC-003) |
| Market news feed | `market_news` tablosu dolması | `fetch-market-news` Edge cron | P1 |
| Economic calendar data | `economic_events` tablosu dolması | Data feed / manual SQL | P2 |
| Subscriptions catalog | Membership tiers + pricing | Ürün kararı | P3 |
| Onboarding wizard | `profiles.onboarding_json` + catalog RPC | RPC + column | P3 |
| Personalization affinity | Sunucu affinity ingest | Edge Fn + RPC | P3 |
| Close friends circles | Circle data + membership | `close_friends` query | P2 |
| Settings persistence | User pref columns | `profiles` columns | P2 |
| Signal upload (kind=signal) | `signals` tablosuna insert | signals INSERT | P1 |

---

## Empty State Gap Matrix

| Feature | Şimdiki Mock False Davranışı | Doğru Davranış | Öncelik |
|---------|------------------------------|----------------|---------|
| **Discover VR sections** | Static VR tiles dolu (sahte içerik) | Section gizle veya "Keşfet içeriği hazırlanıyor" | 🔴 P0 |
| **Studio dashboard metrics** | `totalViews:0`, `followerGrowth7d:0` vb. gösterir | "Henüz içerik yok. İlk içeriğini yükle." | 🟡 P1 |
| **Studio live schedule** | Boş list (silently) | EmptyState "Henüz zamanlanmış yayın yok." | 🟡 P1 |
| **Signals marketplace rails** | Sessizce yok | EmptyState veya gizle | 🟡 P1 |
| **Home editorial rail** | Boş alan | Sessizce gizle (height:0) | 🟢 P2 |
| **Creators directory** | ✅ EmptyState mevcut | OK | P2 |
| **Market news** | ✅ Kısmen — Unsplash sorunlu | Gerçek resim veya SVG placeholder | 🟡 P1 |
| **Economic calendar** | ✅ EmptyState mevcut | OK | P2 |
| **Subscriptions** | ✅ Sparse hub (bilinçli) | OK | — |
| **Notifications inbox** | ✅ EmptyState mevcut | OK — avatar eksik | 🟢 |
| **Messages inbox** | ✅ EmptyState mevcut | OK | 🟢 |
| **Portfolio** | ✅ EmptyState "Portföy boş" | OK | 🟢 |

---

## Production Risk Ranking

### P0 — Mock false'da sahte veri sızıntısı (kullanıcı yanıltma)

| # | Feature | Kanıt | Risk |
|---|---------|-------|------|
| 1 | Discover VR fallback | `discover-view-model-adapter.ts:359-369` | Kullanıcı gerçek değil demo tiles görür |
| 2 | Market news Unsplash | `market-news-shared.ts:8-32` | 3. parti URL bağımlılığı; gerçek haber yanlış görselle |

### P1 — Kötü UX / eksik empty state

| # | Feature | Kanıt | Risk |
|---|---------|-------|------|
| 3 | Studio dashboard 0 metrikler | `supabase-studio-repository.ts:61-78` | Creator "başarısız" hisseder |
| 4 | Signals leaderboard boş | `supabase-signals-repository.ts:84-85` | Leaderboard ekranı boş; RPC bağlı |
| 5 | Signal upload kind stub | `upload-page-client.tsx:319-325` | Sinyal `posts` tablosuna giriyor |
| 6 | Signal subscriber guard | `use-mock-signal-subscriber.ts:14` | localStorage ile dev'de tetiklenebilir |

### P2 — Backend eksik (mock/dev'de kalabilir)

Studio analytics, home sections, home live now, creators RPC, close-friends, settings persist, studio live schedule, studio content edit.

### P3 — Uzun vadeli / ürün kararı

Subscriptions, onboarding, personalization affinity, social discussions/rooms.

---

## Recommended Fix Order

### Phase 1 — Sahte Veri Sızıntısını Kes (P0, sadece frontend)

| ID | İş | Dosya | Tip |
|----|-----|-------|-----|
| MC-001 | Discover `orCopy` fallback'e mock guard | `discover-view-model-adapter.ts:359-369` | Frontend only |
| MC-002 | Discover VR data mock sisteme taşı | `discover-visual-reference-data.ts:155+` | Frontend + mock system |
| MC-003 | Market news Unsplash → gerçek image_url veya SVG | `market-news-shared.ts:8-32` | Frontend only |
| MC-004 | Signal subscriber mock guard | `use-mock-signal-subscriber.ts:14` | Frontend only |

### Phase 2 — Empty State Eksiklerini Tamamla (P1, frontend only)

| ID | İş | Dosya |
|----|-----|-------|
| ES-001 | Studio dashboard empty state | `studio-dashboard-client.tsx` |
| ES-002 | Studio live empty state | `studio-live-client.tsx` |
| ES-003 | Signals marketplace empty/hidden | `signals-page-client.tsx` |
| ES-004 | Home editorial rail gizle | `supabase-home-repository.ts` + layout |

### Phase 3 — Mevcut Backend'i Olan Feature'ları Bağla (P1, frontend)

| ID | İş | Backend Durumu |
|----|-----|---------------|
| BE-REP-001 | Notification actor_avatar_url | `profiles` JOIN (`fetch-notifications.ts`) |
| BE-REP-002 | Signal upload → `signals` tablosu | `signals` INSERT (backend hazır) |
| BE-REP-003 | Studio content edit fetch bağlantısı | `posts` UPDATE (backend hazır) |
| BE-REP-004 | Settings persistence | `profiles` columns |

### Phase 4 — Backend/RPC Gerektiren Feature'lar (P2-P3, backend first)

| ID | İş | Gereken Backend |
|----|-----|----------------|
| P4-001 | Home sections gerçek data | Sections RPC |
| P4-002 | Creators directory | `get_creators_directory` RPC |
| P4-003 | Signals leaderboard sections | `getAnalystLeaderboardSections` → mevcut `get_leaderboard_analysts` |
| P4-004 | Studio analytics | Analytics RPC |
| P4-005 | Economic calendar data feed | `economic_events` data |
| P4-006 | Close friends circles | `close_friends` repository |
| P4-007 | Market news `fetch-market-news` cron aktif | cron job |

---

## Safe Implementation Phases Summary

```
Phase 1 (P0 — ~2 saat, sadece WEB):
  MC-001..004 — mock guard'lar, Discover VR fix, Unsplash kaldır
  Write-gate gerektirmez.

Phase 2 (P1 — ~1 gün, sadece WEB):  
  ES-001..004 — empty state tamamlama
  Write-gate gerektirmez.

Phase 3 (P1/P2 — ~2-3 gün, WEB + hafif backend):
  BE-REP-001..004 — mevcut tabloları kullanan repository bağlantıları
  Write-gate açık (P1-004 yapılmış).

Phase 4 (P2/P3 — backend önce, sonra WEB):
  P4-001..007 — RPC + data feed gerektiren bölümler
  Backend/RPC tamamlanınca WEB repository implementasyonu.
```

**Not:** Phase 1 ve 2 write-gate'ten bağımsız — salt UI/mock değişikliği. Phase 3 öncesi write-gate açık olmalı.
