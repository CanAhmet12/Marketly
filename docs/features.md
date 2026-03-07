# features.md — Özellik Durumu

> Detaylı takip için `FEATURE_AUDIT.md` dosyasına bak.

## ✅ Tamamlanan Özellikler

### Kimlik Doğrulama
- Email/şifre kayıt, giriş, şifre sıfırlama, oturum kalıcılığı, onboarding

### Ana Feed (HomeScreen)
- "Senin İçin" (HackerNews skoru), "Takip", "Haberler" sekmeleri
- Sonsuz scroll, pull-to-refresh
- Canlı fiyat ticker (fiyat flash animasyonu)
- Stories: yükleme (image-picker→storage), fullscreen viewer (5s progress bar), takip edilenlerin hikayeleri
- Compose bar FAB pulse animasyonu

### PostCard
- Like (optimistik), yorum (realtime), paylaş, kaydet
- **Uzun basınca action sheet** → Kaydet / Paylaş / Kopyala / Şikayet / Sil

### Video
- VideoDetailScreen: optimistik like/share sayaçları, kaydet, yorum, ilgili videolar
- CreateScreen: video upload progress bar (%göstergesi)
- ShortsScreen: FlatList preload, double-tap, swipe

### Piyasalar
- 4 kategori (Kripto/Hisse/Emtia/Döviz), AsyncStorage tab hafızası
- AssetDetailScreen: CoinGecko OHLC mum grafik (5 zaman aralığı), watchlist spring animasyonu

### Portföy
- Holdings CRUD, PnL hesaplama, SVG-less donut chart, paylaşılabilir kart

### Sinyaller
- Listeleme, like, kopyalama, Signal Marketplace, gerçek sinyal detay modal

### Canlı Yayın
- Yayıncı + izleyici (Agora RTC), realtime chat, avatar, hediye sistemi, viewer sayacı

### Sosyal
- Profil: grid/liste toggle, bio inline edit, avatar live preview
- Liderboard: accuracy bar, "Profil →" quick-action
- DM: yeni sohbet modal (kullanıcı arama)
- Bildirimler: 7 tip filtre chip
- Fiyat alarmları: oluştur/sil + tetiklenmiş geçmiş panel
- DiscoverScreen: arama çubuğu focus animasyonu
- SearchScreen: 5 sekme, contextual empty state

### Sistem
- ErrorBoundary → Supabase `error_logs`
- OfflineBanner
- Skeleton loader
- Push bildirim (Edge Function)
- AI asistan (GPT-4o-mini)
- Expo Go uyumluluk (Agora stub)

---

## 🗺 Oturum 12 Planı (Öncelik Sırası)

1. SignalCard — uzun basınca sinyal kopyalama action sheet
2. ProfileScreen — takipçi/takip listesi modal (tıklanabilir kullanıcı satırları)
3. SearchScreen — debounce iyileştirmesi (API çağrısını azalt)
4. LiveBroadcastScreen — yayın kalitesi seçici (360p/720p)
5. SettingsScreen — bildirim tercihleri toggle (hangi tipler push göndersin)
