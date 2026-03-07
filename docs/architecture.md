# architecture.md — Marketly Mimari Özeti

## Sistem Katmanları

```
[Expo RN App] ──► [Supabase BaaS]  (DB, Auth, Realtime, Storage, Edge Fn)
              ──► [Price API :3001] (Node.js/Express → CoinGecko/Yahoo/Finnhub)
              ──► [Agora RTC]       (canlı yayın — dev build gerekli)
```

## Navigasyon Ağacı

```
RootNavigator (NativeStack)
├── Auth: Onboarding → Login → Register → ResetPassword
└── Main:
    ├── TabNavigator (BottomTabs)
    │   ├── HomeScreen
    │   ├── DiscoverScreen
    │   ├── CreateScreen
    │   ├── MarketsScreen
    │   └── LiveScreen
    └── Stack Modals
        Profile, VideoDetail, AssetDetail, Shorts, Notifications,
        Search, Settings, Paywall, EditProfile, Portfolio,
        Leaderboard, PriceAlerts, AIAssistant, SignalMarketplace,
        UserProfile (ProfileView), LiveBroadcast, LiveWatch, Messaging
```

## State Yönetimi

- **Global:** React Context (Auth, TabBar, Toast, Currency, Theme)
- **Ekran:** `useState` + `useEffect`
- **Veri:** Custom Hooks (Supabase sorguları)
- **Kalıcı:** AsyncStorage (tercihler), expo-secure-store (auth token)

## Realtime Abonelikler

| Tablo | Ekran |
|-------|-------|
| `live_messages` | LiveWatchScreen, LiveBroadcastScreen |
| `notifications` | NotificationsScreen |
| `dm_messages` | MessagingScreen |

## Güvenlik

- RLS tüm tablolarda etkin — `auth.uid()` filtresi
- Auth token: iOS Keychain / Android Keystore (expo-secure-store)
- Edge Function sırları: Supabase Dashboard → Secrets

## Build Komutları

```bash
npx expo start --clear          # Geliştirme (Expo Go)
eas build --profile development # Dev build (Agora dahil)
eas build --profile production --platform android
eas build --profile production --platform ios
cd backend && npm start          # Price API
supabase functions deploy ai-chat
```
