# modules.md — Modül Referansı

## screens/ (27 dosya)

| Ekran | Görev | Önemli Özellik |
|-------|-------|----------------|
| HomeScreen | Ana feed | 3 sekme, Stories, ticker, infinite scroll, FAB pulse |
| DiscoverScreen | Keşfet | Arama anim (focus), banner carousel, videolar |
| CreateScreen | İçerik oluştur | Post/sinyal/live, video upload progress bar |
| MarketsScreen | Piyasa listesi | 4 kategori, AsyncStorage tab hafızası |
| LiveScreen | Yayın listesi | Aktif yayınlar |
| ShortsScreen | Kısa video | FlatList swipe, preload, double-tap beğeni |
| ProfileScreen | Kendi profil | Grid/liste toggle, bio inline edit |
| VideoDetailScreen | Video izle | Optimistik like/share sayaçları |
| AssetDetailScreen | Varlık detay | CoinGecko OHLC grafik, watchlist spring anim |
| PortfolioScreen | Portföy | SVG-less donut chart, PnL |
| SignalMarketplaceScreen | Sinyal market | Gerçek sinyal detay modal |
| LeaderboardScreen | Sıralama | Accuracy bar, "Profil →" quick-action |
| MessagingScreen | DM | Yeni sohbet modal (kullanıcı arama) |
| NotificationsScreen | Bildirimler | 7 tip filtre chip |
| PriceAlertsScreen | Fiyat alarmları | Tetiklenmiş alarm geçmişi |
| AIAssistantScreen | AI sohbet | GPT-4o-mini, Türkçe finansal |
| SearchScreen | Arama | 5 sekme, contextual empty state |
| LiveBroadcastScreen | Yayıncı | Agora RTC, chat, hediyeler |
| LiveWatchScreen | İzleyici | Agora RTC, avatar chat, expandable |
| PaywallScreen | Abonelik | Aylık/Yıllık planlar |
| EditProfileScreen | Profil düzenle | Avatar live preview (anında göster) |
| UserProfileScreen | Başka kullanıcı | (ProfileView route adı) |

## components/ (15 dosya)

| Bileşen | Görev |
|---------|-------|
| PostCard | Gönderi — like anim, bookmark, uzun basınca action sheet |
| SignalCard | Sinyal kartı |
| VideoCard | Video önizleme |
| CommentSheet | Bottom sheet yorum paneli (realtime) |
| ErrorBoundary | Crash → `error_logs` Supabase insert |
| OfflineBanner | Ağ durumu animasyonlu banner |
| SkeletonLoader | PostCardSkeleton dahil yükleme iskeleti |
| PriceAlertWatcher | Arka plan fiyat kontrol |
| ProGate | Pro/Elite özellik kilidi sarmalayıcı |

## hooks/ (18 dosya)

| Hook | Tablo | Döndürdüğü |
|------|-------|-----------|
| usePosts | posts | posts, loading, hasMore, loadMore, toggleLike, deletePost, createPost |
| useVideos | posts(video) | videos, loading, refetch |
| useSignals | signals | signals, loading, refetch |
| useMarketPrices | asset_prices+assets | allAssets, loading |
| useAgoraLive | — | state, leaveChannel, toggleMute, toggleCamera |
| usePortfolio | portfolio_holdings | holdings, addHolding, removeHolding |
| useMessages | dm_messages | messages, sendMessage |
| useComments | comments | comments, addComment |
| useVideoComments | video_comments | comments, addComment |
| useNotifications | notifications | notifications, unreadCount, markRead |
| usePriceAlerts | price_alerts | alerts, createAlert, deleteAlert |
| useLeaderboard | profiles | analysts, topSignals |
| useUserProfile | profiles | profile, loading |
| useFollow | follows | following, toggleFollow |
| useWatchlist | watchlist | watchlist, toggleWatch |
| useSubscription | analyst_subscriptions | subscribed, subscribe, unsubscribe |
| useBadges | user_badges | badges |
| useAIChat | — (Edge Fn) | messages, sendMessage, loading |

## contexts/ (5 dosya)

| Context | Sağladığı |
|---------|----------|
| AuthContext | user, profile, session, login, register, logout, refreshProfile |
| TabBarContext | hideTabBar, showTabBar, resetTabBar, TAB_BAR_H |
| ToastContext | toast.success(), toast.error(), toast.info() |
| CurrencyContext | currency, setCurrency |
| ThemeContext | tema (şimdilik light-only) |

## lib/ (4 dosya)

| Dosya | Görev |
|-------|-------|
| supabase.ts | Supabase client (SecureStore adapter) + tip export |
| database.types.ts | Tüm DB tablo TS tipleri |
| avatarUrl.ts | DiceBear URL üreteci |
| agora-stub.js | Agora mock — metro.config.js Expo Go'da yükler |

## constants/theme.ts — Design Tokens

```typescript
colors.primary = '#00C853'   colors.bg = '#F7F8FC'   colors.bgPure = '#FFFFFF'
colors.text = '#0F1117'      colors.textMuted = '#9CA3AF'
colors.rise = '#00C853'      colors.fall = '#F03E3E'

font.regular / font.medium / font.semiBold / font.bold / font.extraBold / font.black
radius.sm / radius.md / radius.lg / radius.full
shadow.card / shadow.lg
```
