# Marketly — Özellik Denetim ve Geliştirme Takip Dosyası
> Her oturumda bu dosya güncellenir. Yapılanlar ✅, devam edenler 🔄, bekleyenler ⏳ olarak işaretlenir.
> Son güncelleme: Oturum 1

---

## 🔴 KRİTİK EKSİKLİKLER (Kullanıcıyı doğrudan etkiler)

### 1. Ödeme Sistemi Yok — PaywallScreen
- **Durum:** ⏳ Bekliyor
- **Sorun:** "7 Gün Ücretsiz Dene" butonu bir Alert gösteriyor: "ödeme altyapısı yakında". RevenueCat, Stripe veya App Store IAP yok.
- **Etki:** Kullanıcı ücretli plana geçemiyor. Tüm Pro özellikler fiilen herkese açık.
- **Çözüm:** RevenueCat entegrasyonu (react-native-purchases) → App Store & Google Play IAP
- **Referans:** Instagram/YouTube subscription model

---

### 2. Mesajlaşma Tabloları Yoksa Özellik Kapalı — MessagingScreen
- **Durum:** ⏳ Bekliyor
- **Sorun:** `tablesExist === false` ise ekran "Mesajlaşma Yakında" gösteriyor. Supabase'de `dm_conversations` ve `dm_messages` tabloları oluşturulmazsa DM tamamen devre dışı.
- **Etki:** Kullanıcılar birbirine mesaj atamıyor.
- **Çözüm:** ADD_TABLES.sql'e DM tablo tanımları ekle ve kontrol kaldır
- **Ek eksiklik:** Mesajlaşma ekranından yeni konuşma başlatma butonu yok (kullanıcı profil sayfasına gidip oradan başlatmak zorunda)

---

### 3. Fiyat Alarmları Push Bildirimi Yok
- **Durum:** ✅ Tamamlandı (Oturum 3)
- **Sorun:** Edge Function alarm tetiklendiğinde sadece DB'ye bildirim yazıyor. Expo Push Notifications veya FCM entegre değil — kullanıcı uygulamayı açmadığı sürece alarmı görmüyor.
- **Etki:** Fiyat alarmı özelliğinin temel amacı çalışmıyor.
- **Çözüm:** `savePushToken` artık `push_tokens` tablosuna yazıyor — Edge Function bu tabloyu okuyor

---

### 4. Video Yükleme Akışı Yok
- **Durum:** ⏳ Bekliyor
- **Sorun:** `createPost` hook'u sadece metin + resim kabul ediyor. Gerçek video yükleme (Supabase Storage'a upload) yok. `CreateScreen`'deki video seçici sadece önizleme gösteriyor, yüklemiyor.
- **Etki:** Kullanıcılar video paylaşamıyor.
- **Çözüm:** `expo-image-picker` video seçimi → Supabase Storage'a chunked upload → `posts` tablosuna `video_url` kaydet

---

### 5. Post Likes/Comments Race Condition
- **Durum:** ✅ Tamamlandı (Oturum 3)
- **Sorun:** `posts.likes` ve `posts.comments` sayaçları manuel `+1/-1` ile güncelleniyor. Eş zamanlı kullanımda değerler bozuluyor.
- **Çözüm:** `fn_update_post_likes_count` ve `fn_update_post_comments_count` DB trigger'ları eklendi

---

## 🟠 YÜKSEK ÖNCELİKLİ EKSİKLİKLER

### 6. Profil "Beğeniler" ve "Kaydedilenler" Sekmeleri Yok
- **Durum:** ⏳ Bekliyor
- **Sorun:** ProfileScreen sadece 4 sekme: Videolar, Sinyaller, Portföy, İstatistikler. Beğenilen gönderiler ve kaydedilen içerik için sekme yok.
- **Çözüm:** `post_likes` ve `saved_posts` tablolarından kullanıcının içeriklerini çeken 2 sekme ekle

---

### 7. Takipçi/Takip Listesi Açılmıyor
- **Durum:** ⏳ Bekliyor
- **Sorun:** ProfileScreen'de takipçi/takip sayılarına tıklanabiliyor görünüyor ama `onPress` handler yok. Instagram gibi liste açılmalı.
- **Çözüm:** Yeni `FollowListScreen` veya modal — `follows` tablosundan kullanıcıları çek

---

### 8. Sinyal Aboneliği Teslimat Mekanizması Yok
- **Durum:** ⏳ Bekliyor
- **Sorun:** "Abone Ol" DB'ye satır yazıyor ama abone olan kullanıcıya sinyal bildirimi gitmiyor, özel feed yok.
- **Çözüm:** Sinyal eklendiğinde abone kullanıcılara push notification + `useSignals`'a "subscribed" filtresi ekle

---

### 9. Arama'da Sinyal Sekmesi Yok
- **Durum:** ✅ Tamamlandı (Oturum 3)
- **Sorun:** SearchScreen'de Gönderiler, Yaratıcılar, Varlıklar var ama Sinyaller sekmesi yok.
- **Çözüm:** `signals` tablosunu `asset_id ilike` + `rationale ilike` ile sorgulayan sekme eklendi, SignalCard ile gösteriliyor

---

### 10. Kapak Fotoğrafı Yükleme Yok — ProfileScreen
- **Durum:** ⏳ Bekliyor
- **Sorun:** Profil kapak fotoğrafı okunuyor ama düzenleme butonu yok. Kullanıcılar kapak fotoğrafı değiştiremiyor.
- **Çözüm:** EditProfileScreen'e kapak fotoğrafı picker + Supabase Storage upload ekle

---

## 🟡 ORTA ÖNCELİKLİ EKSİKLİKLER

### 11. Videoların İlerleme Çubuğu Dekoratif
- **Durum:** ⏳ Bekliyor
- **Sorun:** `VideoDetailScreen`'deki ilerleme çubuğu `%35` sabit genişlik. Gerçek bir seek bar değil.
- **Çözüm:** `expo-video` `onProgress` event → gerçek seek bar

### 12. AI Yanıtları Sahte Veri İçeriyor (Fallback)
- **Durum:** ⏳ Bekliyor
- **Sorun:** Edge Function çevrimdışı olduğunda `generateDemoReply()` gerçekmiş gibi görünen sahte RSI, fiyat verileri döndürüyor. Hiçbir uyarı yok.
- **Çözüm:** Demo yanıtlara "Bu yanıt demo modunda oluşturulmuştur, yatırım tavsiyesi değildir" banner ekle

### 13. Liderlik Tablosu "Haftalık" Filtresi Çalışmıyor
- **Durum:** ⏳ Bekliyor
- **Sorun:** "Bu haftanın en iyileri" başlığı var ama veri tüm zamanların doğruluğunu gösteriyor, haftalık değil.
- **Çözüm:** `useLeaderboard`'a tarih filtresi ekle (son 7 gün sinyaller)

### 14. LiveWatchScreen Viewer Count Race Condition
- **Durum:** ⏳ Bekliyor
- **Sorun:** İzleyici sayısı `viewers + 1` ile raw arithmetic yapılıyor. Eş zamanlı izleyicilerde yanlış sonuç.
- **Çözüm:** Supabase RPC `increment_viewers` zaten tanımlı — giriş için de kullan

### 15. Follow Bildirimi Gönderilmiyor
- **Durum:** ⏳ Bekliyor
- **Sorun:** Birisi takip ettiğinde takip edilen kullanıcıya bildirim gitmiyor.
- **Çözüm:** `useFollow.follow()` içinde `createNotification` çağrısı ekle

### 16. Yorum Yanıt (Reply) UI Yok — CommentSheet
- **Durum:** ⏳ Bekliyor
- **Sorun:** VideoDetailScreen'de `onReply` prop geçiliyor ama CommentSheet'te reply UI yok. Yorumlar düz liste.
- **Çözüm:** Reply input + @mention prefix + görsel girinti ekle

### 17. Portfolio'ya Varlık Eklerken Otomatik Tamamlama Yok
- **Durum:** ⏳ Bekliyor
- **Sorun:** Kullanıcı sembolü elle yazıyor. Yanlış sembol girerse fiyat 0 gösteriyor.
- **Çözüm:** Canlı piyasa verisinden arama önerisi dropdown ekle

### 18. Bildirimler Kaydır-Sil (Swipe-to-Delete) Yok
- **Durum:** ⏳ Bekliyor
- **Sorun:** Bildirimi silmek için 2 Alert onayı gerekiyor. Mobilde swipe-to-delete çok daha doğal.
- **Çözüm:** `react-native-gesture-handler` swipeable wrapper

### 19. Mesaj Uzun Basma Menüsü Yok
- **Durum:** ⏳ Bekliyor
- **Sorun:** MessagingScreen'de mesaja uzun basınca hiçbir şey olmuyor. Kopyala/Sil menüsü olmalı.
- **Çözüm:** `onLongPress` → `ActionSheetIOS` veya custom modal

### 20. Bildirim'den Yanlış Ekrana Yönlendirme
- **Durum:** ⏳ Bekliyor
- **Sorun:** Like/comment bildirimine tıklayınca `VideoDetail`'a yönlendiriyor ama post bir metin gönderisiyse bu ekran yanlış.
- **Çözüm:** `meta.post_type` kontrolü ekle — text post ise yorum sheet aç

---

## ✅ TAMAMLANANLAR

### Oturum 1 — UI/UX Temel İyileştirmeler
- Inter font sistemi entegre edildi (App.tsx)
- theme.ts yenilendi (spacing, shadow, gradient, font sistemi)
- Tüm ekranlar ve componentlerde `paddingHorizontal: 16` → `10` (daha geniş görünüm)
- `fontWeight` string değerleri → `fontFamily: font.xxx` (Inter)
- SignalCard, PostCard, VideoCard, HomeScreen, MarketsScreen tam genişlik
- LiveScreen grid `47.5%` → `48.5%` (kenar boşlukları azaltıldı)
- Encoding bozulması düzeltildi (tüm dosyalar git'ten restore + güvenli StrReplace)

### Oturum 2 — Eksik Özellikler İlk Tur
- ✅ Kapsamlı uygulama denetimi yapıldı (20+ sorun tespit edildi)
- ✅ FEATURE_AUDIT.md oluşturuldu
- ✅ .cursor/rules/development-protocol.mdc kuralı oluşturuldu
- ✅ ADD_TABLES.sql'e DM (dm_conversations + dm_messages) tabloları eklendi
- ✅ ProfileScreen'e "Beğeniler" ve "Kaydedilenler" sekmeleri eklendi (Supabase sorguları ile)
- ✅ ProfileScreen "Videolar" sekmesi "Gönderiler" olarak düzeltildi
- ✅ Takipçi/Takip sayılarına tıklanabilir modal eklendi (FollowListModal)
- ✅ AI Assistant demo modunda "Bu yanıt demo modundadır" uyarı banner'ı eklendi
- ✅ Follow bildirimi zaten çalışıyormuş (useFollow.ts satır 70-77)

---

### Oturum 3 — Push Bildirimleri, Race Condition, Arama, Yönlendirme
- ✅ #3 Push bildirimi fix: `savePushToken` artık `profiles.push_token` yerine `push_tokens` tablosuna yazıyor (Edge Function bunu okuyor)
- ✅ #5 Race condition fix: `post_likes` ve `comments` INSERT/DELETE trigger'ları ADD_TABLES.sql'e eklendi (`fn_update_post_likes_count`, `fn_update_post_comments_count`) — `usePosts` manuel sayaç güncellemesini bıraktı
- ✅ #9 SearchScreen'e Sinyal sekmesi eklendi — `signals` tablosunu `asset_id` ve `rationale` üzerinden arar, `SignalCard` ile gösterir
- ✅ #10 EditProfileScreen kapak fotoğrafı yükleme zaten implement edilmişti (false alarm)
- ✅ #14 LiveWatchScreen: `increment_viewers` RPC eklendi, giriş artık raw arithmetic yerine atomic RPC kullanıyor
- ✅ #20 Bildirim yönlendirme düzeltildi: `post_type` kontrolü eklendi — text post akışa, video/short/live VideoDetail'a gidiyor
- ✅ `createNotification`'a `meta` alanı eklendi (post_type, post_id)
- ✅ notifications tablosuna `is_read`, `sender_id`, `related_id`, `image_url` migration ALTER TABLE'ları eklendi
- ✅ `is_read` ↔ `read` kolon senkronizasyon trigger'ı eklendi

---

### Oturum 4 — Video, Seek Bar, Liderboard, Reply, Mesaj Menüsü
- ✅ #4 Video yükleme akışı zaten implement edilmişti (CreateScreen'de `uploadVideoToStorage` + progress bar)
- ✅ #8 Sinyal abonelik bildirimi: `useSignals.createSignal` başarılı olunca `signal_subscriptions` tablosundan aboneleri çekip `createNotification` gönderiliyor
- ✅ #11 VideoDetailScreen gerçek seek bar: `VideoPlayer` bileşeni `player.currentTime/duration` ile 500ms interval'de güncelleniyor, dokunarak seek yapılabiliyor, süre göstergesi eklendi
- ✅ #13 Leaderboard haftalık filtre: `fetchLeaderboard(period)` parametresi eklendi, header'a "7G/Tüm" toggle butonu eklendi, period değişince otomatik yeniden çekiyor
- ✅ #16 CommentSheet reply UI: "Yanıtla" butonu, @mention prefix, replyTo banner ve görsel girinti eklendi
- ✅ #19 MessagingScreen uzun basma menüsü: `Pressable` + `onLongPress` ile Kopyala/Sil Alert menüsü eklendi

---

### Oturum 5 — Portfolio Autocomplete, Swipe-Delete, PnL Chart, Offline Banner
- ✅ #17 Portfolio autocomplete: `AddHoldingModal`'a `allAssets` prop eklendi, sembol yazılınca canlı fiyat + isim dropdown gösteriyor, tıklayınca sembol + güncel fiyat otomatik dolduruluyor
- ✅ #18 Bildirimler swipe-to-delete: `SwipeableRow` bileşeni eklendi (PanResponder + Animated), sola kaydırınca kırmızı "Sil" butonu açılıyor, tam sola sürmek bildirimi siliyor
- ✅ Live chat zaten implement edilmişti (false alarm — live_messages tablosu + Supabase realtime)
- ✅ Offline banner zaten App.tsx'e entegre edilmişti (false alarm)
- ✅ Portfolio mini PnL bar: Her holding genişletildiğinde animasyonlu PnL progress bar ve renk göstergesi eklendi

---

### Oturum 6 — UserProfile Grid, Discover Trending, ShortsScreen Double-tap, Paywall Fix
- ✅ UserProfileScreen: Instagram tarzı 3'lü grid görünümü, grid/liste toggle, Sinyaller sekmesi eklendi
- ✅ DiscoverScreen: 48 saatlik trend içerikler engagement score'a göre (likes×3 + comments×5 + views×0.1) sıralanarak yatay scroll kart listesi eklendi
- ✅ ShortsScreen: Çift dokunuş ile like (double-tap) — kalp animasyonu ile Instagram benzeri UX eklendi
- ✅ PaywallScreen: Encoding bozulması (Ã, Ä± karakterleri) düzeltildi
- ✅ #5 RevenueCat IAP: Expo Go'da native modül çalışmaz — gerçek build için `npx expo install react-native-purchases` + RevenueCat dashboard konfigürasyonu gerekiyor (ADD_TABLES.sql'e subscription tablosu planlandı)

| Oturum | Tarih | Yapılanlar |
|--------|-------|-----------|
| 1 | 2026-03-03 | UI/UX: Inter font, geniş layout, encoding düzeltme, font import |
| 2 | 2026-03-03 | Denetim, DM tabloları, Profil sekmeleri, Takipçi modal, AI disclaimer |
| 3 | 2026-03-05 | Push fix, race condition trigger, sinyal arama, viewer RPC, bildirim yönlendirme |
| 4 | 2026-03-05 | Sinyal bildirimi, VideoDetail seek bar, Leaderboard haftalık filtre, CommentSheet reply, Mesaj uzun basma |
| 5 | 2026-03-05 | Portfolio autocomplete, Swipe-to-delete bildirimler, PnL mini bar |
| 6 | 2026-03-05 | UserProfile grid/sekme, Discover trend, Shorts double-tap, Paywall encoding fix |
| 7 | 2026-03-05 | CoinGecko OHLC grafik, ProfileScreen grid toggle, Home sonsuz scroll, Search boş state, ErrorBoundary log |
| 8 | 2026-03-05 | LiveChat avatar+fade anim, CreateScreen progress bar, Notifications filtresi, MarketTicker flash, Messaging yeni sohbet |

---

### Oturum 8 — Chat UX, Upload Progress, Bildirim Filtresi, Ticker Flash, Yeni Sohbet
- ✅ LiveWatchScreen: `ChatBubble` bileşeni — avatar, fade-in animasyonu, kendi mesajlarına mavi vurgu, chat genişletme butonu (↑/↓), `sendMessage`'a `avatar_url` eklendi
- ✅ CreateScreen: `uploadVideoToStorage`'a `onProgress` callback desteği — `uploadProgress` state, yükleme sırasında `%N tamamlandı` progress bar görünür
- ✅ NotificationsScreen: Tip filtresi çipleri — Tümü / Beğeni / Yorum / Takip / Sinyal / Alarm / Sistem; sıfır kayıtlı tipler gizlenir; `typeFilter` state ile liste anlık güncellenir
- ✅ MarketTicker: `TickerItemView` bileşeni — `useRef` ile önceki fiyat karşılaştırma, değişince 120ms yeşil/kırmızı `Animated.View` flash (native olmayan backgroundColor interpolation)
- ✅ MessagingScreen: `NewConversationModal` — profil arama (debounce 300ms), sonuç listesi, tıklayınca mevcut konuşmayı aç ya da `dm_conversations` upsert ile yeni oluştur; header'da "yeni mesaj" compose ikonu

---

### Oturum 9 — Stories, Watchlist Anim, Shorts Preload, Bio Edit, Markets Kalıcı Tab
- ✅ HomeScreen Stories: Kullanıcı kendi "Hikayem" öğesine basınca `expo-image-picker` ile resim seçer, Supabase `stories` bucket'a yükler, 24s geçerli hikaye kaydeder; aktif hikaye varsa küçük ön izleme gösterilir; `ADD_TABLES.sql`'e `stories` tablosu + RLS + cleanup fonksiyonu eklendi
- ✅ AssetDetailScreen: Watchlist yıldız butonuna tıklayınca `spring` + `rotate` animasyonu (header + action bar'da); `watchAnim` ve `watchRotate` Animated.Value ile ölçek ve 36° dönüş
- ✅ ShortsScreen: `viewAreaCoveragePercentThreshold` 70→50, `initialNumToRender:2`, `maxToRenderPerBatch:3`, `windowSize:5`, `removeClippedSubviews:false` ile preload iyileştirmesi; `preload` prop ile bir sonraki video başlatılır
- ✅ ProfileScreen: Bio alanına tıklayınca `TextInput` inplace açılır, kaydetmede `supabase.from('profiles').update({ bio })` çağrısı; maks. 150 karakter sınırı; blur veya Return ile otomatik kayıt
- ✅ MarketsScreen: `AsyncStorage.getItem/setItem('markets_active_tab')` ile seçili kategori uygulamayı yeniden açınca hatırlanır; `handleSetTab` wrapper fonksiyonu eklendi

| Oturum | Tarih | Yapılanlar |
|--------|-------|-----------|
| 1 | 2026-03-03 | UI/UX: Inter font, geniş layout, encoding düzeltme, font import |
| 2 | 2026-03-03 | Denetim, DM tabloları, Profil sekmeleri, Takipçi modal, AI disclaimer |
| 3 | 2026-03-05 | Push fix, race condition trigger, sinyal arama, viewer RPC, bildirim yönlendirme |
| 4 | 2026-03-05 | Sinyal bildirimi, VideoDetail seek bar, Leaderboard haftalık filtre, CommentSheet reply, Mesaj uzun basma |
| 5 | 2026-03-05 | Portfolio autocomplete, Swipe-to-delete bildirimler, PnL mini bar |
| 6 | 2026-03-05 | UserProfile grid/sekme, Discover trend, Shorts double-tap, Paywall encoding fix |
| 7 | 2026-03-05 | CoinGecko OHLC grafik, ProfileScreen grid toggle, Home sonsuz scroll, Search boş state, ErrorBoundary log |
| 8 | 2026-03-05 | LiveChat avatar+fade anim, CreateScreen progress bar, Notifications filtresi, MarketTicker flash, Messaging yeni sohbet |
| 9 | 2026-03-05 | Stories yükleme, Watchlist anim, Shorts preload, Bio inplace edit, Markets kalıcı tab |
| 10 | 2026-03-05 | SignalMarketplace detay, Story görüntüleme, Leaderboard profil, Portfolio pie chart, PriceAlerts geçmiş |
| 11 | 2026-03-05 | PostCard action sheet, VideoDetail aksiyon fix, Discover arama anim, FAB pulse, Avatar live preview |

---

### Oturum 10 — Signal Detay, Story Viewer, Leaderboard UX, Portfolio Chart, Alert History
- ✅ SignalMarketplaceScreen: `PackageDetailModal`'a `useEffect` ile gerçek Supabase sinyal çekme — giriş/hedef/stop fiyatı, durum (Aktif/Başarılı/Başarısız), kopya sayısı, rationale gösterimi; loading spinner; Supabase yoksa fallback top_picks
- ✅ HomeScreen Stories: `StoryViewerModal` — fullscreen görüntüleme, 5s animated progress bar, username gösterimi, dokunarak kapatma; takip edilen kullanıcıların 24h hikayeleri stories row'a eklendi; kendi hikayesine basınca da viewer açılıyor
- ✅ LeaderboardScreen: `AnalystRow` yenilendi — mini accuracy progress bar (renk kodlu), "Profil →" quick-action butonu, `rowRight` stili iyileştirildi
- ✅ PortfolioScreen: `DonutChart` — SVG gerektirmeyen View tabanlı donut grafik, merkez "X Varlık" bilgisi, renk kodlu segmentler; `AllocationView`'ın üstüne eklendi
- ✅ PriceAlertsScreen: `showHistory` toggle ile panel açılır; `notifications` tablosundan `type='price_alert'` filtreleyerek son 30 tetiklenen alarm listelenir; header'a saat ikonu eklendi

---

### Oturum 11 — PostCard ActionSheet, VideoDetail Aksiyon Fix, Discover Arama Anim, FAB Pulse, Avatar Preview
- ✅ PostCard: Uzun basınca iOS `ActionSheetIOS` / Android `Alert` tabanlı context menü — Kaydet 🔖, Paylaş, Kopyala, Şikayet Et (yabancı gönderi), Sil (kendi gönderisi); `Clipboard.setString`, `user_reports` insert; kart dışı `View` → `Pressable` olarak güncellendi; `isOwner` component üst seviyeye taşındı
- ✅ VideoDetailScreen: `localLikes` ve `localShares` state eklendi; `onLike`'da `setLocalLikes(n => n ± 1)` optimistik güncelleme; `onShare`'de `setLocalShares(n => n + 1)`; `likeCount + (liked ? 1 : 0)` duplikasyonu kaldırıldı
- ✅ DiscoverScreen: `handleSearchFocus` / `handleSearchBlur` ile `searchFocusAnim` `Animated.Value`; `Animated.View` wrapper — `borderColor` primary'a interpolate, `shadowOpacity` ve `scaleX` ile odaklanma efekti
- ✅ HomeScreen: `fabPulse` Animated.Value ile looping `Animated.loop` — "Yaz" butonu sürekli hafif scale 1→1.08→1 (900ms her adım); `Animated.View` wrapper eklendi
- ✅ EditProfileScreen: `localAvatarUri` state ile anında live preview — seçilir seçilmez lokal URI gösterilir, upload tamamlanınca `setLocalAvatarUri(null)` ile Supabase URL'ye geçilir; `Animated.Image` + `avatarFlashAnim` ile seçim anı fade flash; "Yükleniyor…" hint metni

---

## 🗺️ SONRAKİ OTURUM PLANI

**Oturum 12 için öncelik sırası:**
1. SignalCard — uzun basınca sinyal kopyalama action sheet
2. ProfileScreen — takipçi/takip listesi modal (tıklanabilir kullanıcı satırları)
3. SearchScreen — filtreli arama debounce iyileştirmesi (API'yi kaydetme)
4. LiveBroadcastScreen — yayın kalitesi seçici (360p/720p)
5. SettingsScreen — bildirim tercihleri (hangi tiplerin push notification gönderileceği)
