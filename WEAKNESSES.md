# Marketly — Zayıf Yönler & Düzeltme Listesi

> Son güncelleme: 2026-03-02  
> Durum: `✅ Düzeltildi` | `🔄 Devam Ediyor` | `⬜ Bekliyor`

---

## 🔴 KRİTİK — Yayın Öncesi Mutlaka Düzeltilmeli

| # | Dosya | Sorun | Durum |
|---|-------|-------|-------|
| 1 | `app.json` | `"scheme": "marketly"` yok → tüm deep linkler çalışmıyor (şifre sıfırlama, profil paylaşma) | ✅ Düzeltildi |
| 2 | `lib/supabase.ts` | Supabase URL ve anon key kaynak koduna gömülü, git geçmişine girmiş | ✅ Düzeltildi |
| 3 | `screens/CreateScreen.tsx` | Video upload FormData bug → `supabase.storage.upload(formData as any)` hiç çalışmıyor | ✅ Düzeltildi |
| 4 | `screens/LoginScreen.tsx` | Google/Apple sosyal giriş butonlarının `onPress` yok — tamamen işlevsiz görünen butonlar | ✅ Düzeltildi |
| 5 | `contexts/AuthContext.tsx` | Kayıt sırasında Supabase `database error` → `return true` (sessiz başarı) → hatalı hesapla giriş | ✅ Düzeltildi |
| 6 | `screens/HomeScreen.tsx` | Hardcoded stale fiyatlar (`BTC: $64,280`, `DOLAR: ₺32.44`) live data yoksa fallback olarak gösteriliyor | ✅ Düzeltildi |
| 7 | `screens/MessagingScreen.tsx` | Dev/SQL kodu (tablo oluşturma komutları) kullanıcı arayüzünde görünüyor | ✅ Düzeltildi |
| 8 | `http://134.122.84.92:3001` | Piyasa API'si HTTPS değil, HTTP üzerinden — MITM güvenlik açığı | ⬜ Bekliyor |

---

## 🟠 YÜKSEK ÖNCELİK — Kullanıcı Deneyimini Doğrudan Kırıyor

| # | Dosya | Sorun | Durum |
|---|-------|-------|-------|
| 9 | `screens/CreateScreen.tsx` | `canPublish` video seçilmeden `true` olabiliyor → boş video publish edilebilir | ✅ Düzeltildi |
| 10 | `screens/LoginScreen.tsx` | Şifre sıfırlama deep link çalışmıyor (scheme yok + `access_token` handler yok) | ✅ Düzeltildi |
| 11 | `hooks/usePortfolio.ts` | Her fiyat tick'inde tam DB sorgusu → dakikada 30+ gereksiz Supabase çağrısı | ✅ Düzeltildi |
| 12 | `hooks/useSignals.ts` | Like/copy race condition — SELECT→INSERT pattern'i atomic değil, duplicate like mümkün | ⬜ Bekliyor |
| 13 | `screens/AIAssistantScreen.tsx` | API başarısız → stale hardcoded fiyatlar (`$60,000–$62,000`) "AI cevabı" olarak sunuluyor | ⬜ Bekliyor |
| 14 | `screens/SettingsScreen.tsx` | Biyometrik & 2FA toggle sadece toast gösteriyor, AsyncStorage'a kaydedilmiyor, app restart'ta sıfırlanıyor | ✅ Düzeltildi |
| 15 | `hooks/usePortfolio.ts` | `addHolding` duplicate pozisyon ekliyor → portföy değeri çift sayılıyor | ✅ Düzeltildi |
| 16 | `screens/DiscoverScreen.tsx` | Banner kartlarının `onPress` yok, filtre butonu işlevsiz | ⬜ Bekliyor |
| 17 | `contexts/AuthContext.tsx` | Şifre politikası çok zayıf: min 6 karakter, kompleksite kuralı yok | ✅ Düzeltildi |

---

## 🟡 ORTA ÖNCELİK — Kalite ve Sağlamlık

| # | Dosya | Sorun | Durum |
|---|-------|-------|-------|
| 18 | `contexts/AuthContext.tsx` | `Math.random()` güvenlik-hassas değerlerde — username suffix ve referral code | ⬜ Bekliyor |
| 19 | `screens/AIAssistantScreen.tsx` | Tüm mesajlar AI'ya gönderiliyor, context limit kontrolü yok → API hatası | ⬜ Bekliyor |
| 20 | `screens/AIAssistantScreen.tsx` | `ScrollView` yerine `FlatList` kullanılmalı (uzun sohbetlerde bellek sorunu) | ⬜ Bekliyor |
| 21 | `hooks/useSignals.ts` | 3 ayrı sıralı network isteği: Signals → Profiles → Assets (Supabase join ile tek sorgu yapılabilir) | ⬜ Bekliyor |
| 22 | `hooks/usePortfolio.ts` | `totalValue`, `totalCost`, `totalPnL` her render'da `useMemo` olmadan hesaplanıyor | ⬜ Bekliyor |
| 23 | `contexts/AuthContext.tsx` | Streak hesaplaması client clock'una bağlı — kullanıcı cihaz saatini değiştirerek streak manipüle edebilir | ⬜ Bekliyor |
| 24 | `screens/DiscoverScreen.tsx` | Aynı Unsplash fotoğrafı tüm analist cover'larında kullanılıyor | ⬜ Bekliyor |
| 25 | `hooks/useMarketPrices.ts` | Realtime subscription sadece UPDATE dinliyor — INSERT/DELETE olayları kaçırılıyor | ⬜ Bekliyor |
| 26 | `screens/CreateScreen.tsx` | `SuccessScreen` hardcoded `2.4K` takipçi sayısı | ⬜ Bekliyor |
| 27 | `screens/CreateScreen.tsx` | Signal confidence 1–5 ölçeği — DB muhtemelen 0–100 bekliyor | ⬜ Bekliyor |
| 28 | `screens/CreateScreen.tsx` | Fiyat inputlarında `$64,000` yazınca `parseFloat` NaN döndürüyor | ⬜ Bekliyor |

---

## 🔵 DÜŞÜK ÖNCELİK — Uzun Vadeli Teknik Borç

| # | Dosya | Sorun | Durum |
|---|-------|-------|-------|
| 29 | `lib/supabase.ts` | Supabase DB tipleri üretilmemiş (`supabase gen types`) → her yerde `any` cast | ⬜ Bekliyor |
| 30 | `app.json` | `userInterfaceStyle: "light"` — dark mode desteği yok | ⬜ Bekliyor |
| 31 | `app.json` | iOS Privacy Manifest (`PrivacyInfo.xcprivacy`) eksik → App Store reddi riski | ⬜ Bekliyor |
| 32 | `app.json` | Bluetooth izinleri var ama kullanılmıyor → Play Store incelemesi | ⬜ Bekliyor |
| 33 | `app.json` | EAS / OTA güncelleme konfigürasyonu yok | ⬜ Bekliyor |
| 34 | Tüm ekranlar | Erişilebilirlik (accessibility) sıfır — `accessibilityLabel` hiçbir yerde yok | ⬜ Bekliyor |
| 35 | `hooks/useSignals.ts` | `pravatar.cc` üçüncü parti placeholder servisi — down olursa tüm avatarlar bozuluyor | ⬜ Bekliyor |
| 36 | `hooks/usePosts.ts` | `followingIds` her sayfa yüklemesinde DB'den yeniden çekiliyor | ⬜ Bekliyor |
| 37 | `screens/LoginScreen.tsx` | `KVKK Uyumlu` iddiası — resmi uyum olmadan hukuki sorumluluk | ⬜ Bekliyor |
| 38 | `contexts/AuthContext.tsx` | Supabase raw error mesajları kullanıcıya gösteriliyor (tablo adı, constraint bilgisi) | ⬜ Bekliyor |

---

## Tamamlanan Düzeltmeler (Önceki Sessionlar)

| Dosya | Düzeltme |
|-------|----------|
| `screens/SignalMarketplaceScreen.tsx` | Hook koşullu return'dan önceye taşındı (crash fix) |
| `screens/NotificationsScreen.tsx` | Broken navigation (Akış/Piyasalar) düzeltildi |
| `screens/SearchScreen.tsx` | CreatorResult tıklanabilir yapıldı + loading state |
| `hooks/useVideoComments.ts` | Like dedup + double fetch fix + deleteComment null guard |
| `screens/ProfileScreen.tsx` | Deprecated `Clipboard` → `Share` API |
| `lib/notifications.ts` | Push notification bağlantısı eklendi |
| `hooks/useFollow.ts` | Error handling iyileştirildi |
| `navigation/RootNavigator.tsx` | Null wrapper → FallbackScreen |
| `screens/SettingsScreen.tsx` | Logout → navigation stack reset |
| `ADD_TABLES.sql` | `increment_video_comment_likes` RPC eklendi |
