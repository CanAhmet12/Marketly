# PROJECT_CONTEXT.md — Marketly AI Hafızası

> **Yeni oturum başladığında:** Bu dosyayı oku → `FEATURE_AUDIT.md` oku → gerekirse `docs/` bak.
> Tüm projeyi tarama; `docs/` klasörü ve bu dosya yeterlidir.

---

## Ne?

**Marketly** = Türkçe finans sosyal medyası uygulaması.
Instagram + YouTube + Robinhood karışımı. Analistler sinyal satar, kullanıcılar takip eder.

**Platform:** React Native / Expo (iOS + Android)
**Backend:** Supabase (BaaS) + Node.js fiyat API'si

---

## Teknoloji Özeti

| Katman | Teknoloji |
|--------|-----------|
| Mobil | React Native 0.76, Expo SDK 52, TypeScript 5.3 |
| State | React Context (Auth/TabBar/Toast/Currency/Theme) |
| Navigasyon | React Navigation 7 (NativeStack + BottomTabs) |
| BaaS | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| Fiyat API | Node.js/Express — port 3001, DigitalOcean VPS |
| Canlı Yayın | react-native-agora 4.5 (dev build gerekli, Expo Go'da stub) |
| AI | OpenAI GPT-4o-mini (Supabase Edge Function: `ai-chat`) |
| Animasyon | React Native Animated API (spring/timing/loop) |
| Font | Inter (Google Fonts) — `font.bold` kullan, `fontWeight` yasaklı |

---

## Mimari (3 Katman)

```
[Expo App] ──Supabase JS──► [Supabase: DB + Auth + Realtime + Storage]
           ──HTTP──────────► [Node.js Price API :3001 — DigitalOcean VPS]
                             └─► [CoinGecko / Yahoo / Finnhub]
[Supabase Edge Functions]
  ├── ai-chat          → OpenAI GPT-4o-mini
  └── check-price-alerts → push bildirim
```

**Backend API Bağlantısı:**
- Mobil app `hooks/useMarketPrices.ts` kullanır.
- Base URL: `http://<sunucu-ip>:3001/api/prices` (production'da `https://api.marketly.app`)
- Fiyatlar 2-15 dakikada bir güncellenir (kategori bazlı cron).
- **Detaylı dokümantasyon:** `backend/README.md`

---

## Klasör Haritası

```
screens/      27 ekran (HomeScreen, DiscoverScreen, MarketsScreen...)
components/   PostCard, SignalCard, VideoCard, CommentSheet, ErrorBoundary...
hooks/        18 Supabase hook (usePosts, useVideos, useSignals, useMarketPrices...)
contexts/     AuthContext, TabBarContext, ToastContext, CurrencyContext, ThemeContext
navigation/   RootNavigator.tsx — tüm route tanımları
constants/    theme.ts — colors, font, radius, shadow design tokens
lib/          supabase.ts, database.types.ts, avatarUrl.ts, agora-stub.js
supabase/     Edge Functions: ai-chat/, check-price-alerts/
backend/      Node.js fiyat API (DigitalOcean VPS, PM2, port 3001)
              └─ README.md — kurulum, komutlar, API endpoint'leri
docs/         AI dokümantasyon (modules.md, architecture.md, api_structure.md...)
```

---

## Kritik Kod Kuralları

```
✅ fontFamily: font.bold         ❌ fontWeight: '700'
✅ paddingHorizontal: 12         ❌ paddingHorizontal: 16
✅ marginHorizontal: 0 (kartlar) ❌ marginHorizontal: 8
✅ StrReplace aracı              ❌ PowerShell Set-Content (encoding bozar)
✅ import { colors, font, radius, shadow } from '../constants/theme'
```

---

## Temel Renkler

```
primary:   #00C853  (yeşil — brand)
bg:        #F7F8FC  (sayfa arkaplan)
bgPure:    #FFFFFF  (kart arkaplan)
text:      #0F1117  (ana metin)
textMuted: #9CA3AF  (yardımcı metin)
rise:      #00C853  (yükseliş)
fall:      #F03E3E  (düşüş)
```

---

## Önemli Dosyalar

| Dosya | İçerik |
|-------|--------|
| `ADD_TABLES.sql` | Tüm DB şeması + RLS — başında idempotent policy drop bloğu |
| `FEATURE_AUDIT.md` | Her oturumda oku — tamamlanan/eksik özellikler |
| `docs/modules.md` | Her dosya/klasörün görevi |
| `docs/database_schema.md` | Tablo yapıları özeti |
| `docs/api_structure.md` | Supabase sorguları + API endpoint'leri |
| `docs/features.md` | Özellik listesi — tamamlananlar + planlananlar |
| `docs/architecture.md` | Navigasyon ağacı, state yönetimi, build komutları |

---

## Sık Kullanılan Supabase Pattern'leri

```typescript
// Auth
const { user, profile } = useAuth();

// Veri çekme (hooks)
const { posts, loading, loadMore, toggleLike } = usePosts(undefined, 'all');
const { allAssets } = useMarketPrices();

// Direkt sorgu
supabase.from('posts').select(`*, profiles!posts_user_id_fkey(...)`).order('created_at', { ascending: false })

// Storage
supabase.storage.from('avatars').upload(path, blob)
supabase.storage.from('avatars').getPublicUrl(path)

// Realtime
supabase.channel('ch').on('postgres_changes', { event: 'INSERT', table: 'live_messages' }, cb).subscribe()

// RPC (atomic)
supabase.rpc('toggle_post_like', { p_post_id: id })
```

---

## Expo Go Uyumluluk Notları

- **Agora (canlı yayın):** Expo Go'da çalışmaz → `metro.config.js` stub'a yönlendirir
- **Push bildirimleri:** Expo Go'da kısıtlı → dev build önerilir
- **Dev build:** `eas build --profile development`

---

*Oturum 11 sonrası — Mart 2026*
*Sonraki görevler: `FEATURE_AUDIT.md` → "Oturum 12 için öncelik sırası"*
