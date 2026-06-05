# EDGE_FUNCTION_MATRIX.md — Marketly Edge Function Matrisi

**Tarih:** 5 Haziran 2026  
**Doğrulama:** REST GET `/functions/v1/{name}` — 404 = deploy edilmedi  
**Durum:** 15 fonksiyonun **TAMAMSI deploy edilmedi**

---

## ÖZET

| Durum | Sayı |
|---|:--:|
| ✅ Deploy edilmiş | 0 |
| ❌ Deploy edilmemiş | 15 |
| 🔑 Ek secret gerektiriyor | 5 |
| ⚠️ Deploy sonrası problem olabilir | 3 |

---

## TAM EDGEFUNCTİON MATRİSİ

| Fonksiyon | Deploy? | APP | WEB | Secrets | Okuduğu Tablolar | Yazdığı Tablolar | Risk | Deploy Önceliği |
|---|:--:|:--:|:--:|---|---|---|:--:|:--:|
| `agora-token` | ❌ | ✅ | ✅ | AGORA_APP_ID (opsiyonel), AGORA_APP_CERTIFICATE (opsiyonel) | profiles (auth) | — | 🟢 | **P0** |
| `feed` | ❌ | — | — | yok | posts, follows, post_likes, saved_posts, profiles, mv_* | — | 🟢 | **P0** |
| `search` | ❌ | — | — | yok | posts, videos, signals, profiles, asset (static list) | — | 🟢 | **P0** |
| `fetch-market-news` | ❌ | ✅ | — | NEWS_API_KEY (opt), ALPHA_VANTAGE_KEY (opt) | — | `market_news` (UPSERT) | 🟢 | **P0** |
| `calculate-daily-pnl` | ❌ | ✅ | — | yok | portfolio_holdings | `portfolio_snapshots`, `portfolio_performance_summary` (UPSERT) | 🟡 | **P0** |
| `check-price-alerts` | ❌ | — (cron) | — | yok | price_alerts, asset_prices, push_tokens | `price_alerts` (UPDATE), `notifications` (INSERT) | 🟡 | **P0** |
| `publish-scheduled-posts` | ❌ | — (cron) | — | yok | scheduled_posts | `posts` (INSERT), `scheduled_posts` (UPDATE) | 🟡 | **P1 — ayrı onay** |
| `ai-chat` | ❌ | ✅ | — | **OPENAI_API_KEY** | portfolio_holdings, watchlist, signals | `ai_chat_logs`* (INSERT) | 🟡 | **P1** |
| `video-transcribe` | ❌ | ✅ | — | **OPENAI_API_KEY** | — | `video_captions` (INSERT) | 🟡 | **P1** |
| `auto-caption` | ❌ | ✅ | — | **OPENAI_API_KEY** | — | — (response olarak döner) | 🟡 | **P1** |
| `moderate-content` | ❌ | — | — | **GOOGLE_API_KEY** | — | moderation_logs* (INSERT) | 🟡 | **P2** |
| `send-weekly-digest` | ❌ | — (cron) | — | **RESEND_API_KEY** | profiles, posts, signals, follows | email_logs (INSERT) | 🟢 | **P2** |
| `upload-validate` | ❌ | — | — | yok | posts (rate limit check) | — (signed URL döner) | 🟡 | **P2 — bucket fix sonrası** |
| `send-gift` | ❌ | ✅ | — | yok | profiles (coins_balance) | live_messages (INSERT), notifications (INSERT), RPC `send_gift_transaction` | 🔴 | **P2 — RPC oluşturulunca** |
| `delete-account` | ❌ | ✅ | — | yok | 12 tablo | 12 tablodan DELETE + auth.admin.deleteUser | 🔴 | **P3 — test ortamı önce** |

*`ai_chat_logs` ve `moderation_logs` tabloları henüz DB'de yok (P0-002'de oluşturulacak)

---

## DEPLOY EDİLEBİLİR — 6 FONKSIYON (P0)

> Herhangi bir ek secret gerektirmez, mevcut prod'da güvenle çalışır.

```bash
# Sıra: önce yan etkisi olmayanlar
npx supabase functions deploy agora-token         --project-ref ufljsnqxvqzichwlpfgy --no-verify-jwt
npx supabase functions deploy feed                --project-ref ufljsnqxvqzichwlpfgy
npx supabase functions deploy search              --project-ref ufljsnqxvqzichwlpfgy
npx supabase functions deploy fetch-market-news   --project-ref ufljsnqxvqzichwlpfgy --no-verify-jwt
npx supabase functions deploy calculate-daily-pnl --project-ref ufljsnqxvqzichwlpfgy --no-verify-jwt
npx supabase functions deploy check-price-alerts  --project-ref ufljsnqxvqzichwlpfgy --no-verify-jwt
```

### Deploy sonrası doğrulama:

```
GET /functions/v1/agora-token    → 401 (auth gerekli) = ✅ deploy edildi
GET /functions/v1/feed           → 401 = ✅
GET /functions/v1/search         → 401 = ✅
GET /functions/v1/fetch-market-news → 405/200 = ✅
GET /functions/v1/calculate-daily-pnl → 405/200 = ✅
GET /functions/v1/check-price-alerts  → 405/200 = ✅
```

---

## BEKLEYEN FONKSIYONLAR VE KOŞULLARI

### publish-scheduled-posts (P1 — ayrı onay gerekli)
- **Neden bekliyor:** `posts` INSERT işlemi yapıyor → production data'ya yazar
- **Koşul:** Zamanlanmış post davranışı tam test edilmeli
- **Risk:** Yanlış içerik zamanında otomatik yayınlanabilir

### ai-chat, video-transcribe, auto-caption (P1 — key bekliyor)
- **Koşul:** `OPENAI_API_KEY` Supabase secret olarak ayarlanmalı
- `ai-chat` için ayrıca `ai_chat_logs` tablo (P0-002) oluşturulmalı
- **Secret ayarlama:**
  ```bash
  npx supabase secrets set OPENAI_API_KEY=sk-... --project-ref ufljsnqxvqzichwlpfgy
  ```

### moderate-content (P2 — key bekliyor)
- **Koşul:** `GOOGLE_API_KEY` (Cloud Vision) gerekli
- `moderation_logs` tablo P0-002'de oluşturulacak
- **Secret:**
  ```bash
  npx supabase secrets set GOOGLE_API_KEY=... --project-ref ufljsnqxvqzichwlpfgy
  ```

### send-weekly-digest (P2 — key bekliyor)
- **Koşul:** `RESEND_API_KEY` gerekli + pg_cron weekly schedule
- **Secret:**
  ```bash
  npx supabase secrets set RESEND_API_KEY=re_... --project-ref ufljsnqxvqzichwlpfgy
  ```

### upload-validate (P2 — bucket fix sonrası)
- **Problem:** Fonksiyon `media` bucket adına signed URL üretiyor
- **Mevcut bucket'lar:** post-images, videos, avatars, covers, stories
- **Çözüm:** Fonksiyon kodu `media` → doğru bucket adıyla düzeltilmeli (WEB write-gate açıldıktan sonra)

### send-gift (P2 — RPC önce)
- **Problem:** `send_gift_transaction` RPC DB'de yok
- **Koşul:** RPC oluşturulmalı → sonra deploy
- **Risk seviyesi:** 🔴 — coins_balance kesintisi yapıyor, atomik işlem

### delete-account (P3 — test ortamı önce)
- **Risk:** cascade delete — 12 tablodan silme + `auth.admin.deleteUser`
- **Koşul:** Production'a deploy öncesi isolated test ortamında tam test
- **Onay gerekiyor:** Her deploy için ayrı kullanıcı onayı

---

## SECRET DURUMU

| Secret | Hangi Fonksiyon | Dashboard'da Var mı | Durum |
|---|---|:--:|---|
| `SUPABASE_URL` | Tümü | ✅ (otomatik inject) | Hazır |
| `SUPABASE_ANON_KEY` | Tümü | ✅ (otomatik inject) | Hazır |
| `SUPABASE_SERVICE_ROLE_KEY` | ai-chat, moderate, digest, publish, delete, pnl, news | ✅ (otomatik inject) | Hazır |
| `AGORA_APP_ID` | agora-token | ❓ Bilinmiyor | Opsiyonel — test modu açık |
| `AGORA_APP_CERTIFICATE` | agora-token | ❓ Bilinmiyor | Opsiyonel — cert yoksa empty token |
| `OPENAI_API_KEY` | ai-chat, video-transcribe, auto-caption | ❌ Eksik | P1'de gerekli |
| `GOOGLE_API_KEY` | moderate-content | ❌ Eksik | P2'de gerekli |
| `NEWS_API_KEY` | fetch-market-news | ❌ Eksik | Opsiyonel (RSS fallback) |
| `ALPHA_VANTAGE_KEY` | fetch-market-news | ❌ Eksik | Opsiyonel |
| `RESEND_API_KEY` | send-weekly-digest | ❌ Eksik | P2'de gerekli |

---

## APP → EDGE FONKSİYON KULLANIM HARİTASI

| Hook/Dosya | Çağırdığı Edge Fn | Yöntem |
|---|---|---|
| `hooks/useAgoraLive.ts` | `agora-token` | `supabase.functions.invoke` |
| `hooks/useAIChat.ts` | `ai-chat` | `supabase.functions.invoke` |
| `hooks/useMarketNews.ts` | `fetch-market-news` | `fetch(SUPABASE_URL/functions/v1/...)` |
| `hooks/usePnLDashboard.ts` | `calculate-daily-pnl` | `fetch(SUPABASE_URL/functions/v1/...)` |
| `hooks/useVideoCaptions.ts` | `video-transcribe` | `fetch(SUPABASE_URL/functions/v1/...)` |
| `screens/LiveWatchScreen.tsx` | `send-gift` | `fetch` (dolaylı) |
| `screens/SettingsScreen.tsx` | `delete-account` | `fetch` |

---

## WEB → EDGE FONKSİYON KULLANIM HARİTASI

| Dosya | Çağırdığı Edge Fn | Durum |
|---|---|---|
| `web/features/live/fetch-agora-token.ts` | `agora-token` | ✅ Implement var, deploy sonrası çalışır |

---

## DEPLOY SONRASI BEKLENEN DAVRANIŞLAR

| Fonksiyon | Deploy sonrası APP değişimi |
|---|---|
| `agora-token` | Canlı yayın başlatabilecek (AGORA_APP_ID secret gerekli) |
| `fetch-market-news` | `market_news` tablosuna veri yazılmaya başlar |
| `check-price-alerts` | Fiyat alarmları tetiklenmeye başlar (asset_prices bayat = yanlış tetikleme riski) |
| `calculate-daily-pnl` | portfolio_snapshots günlük oluşur |
| `feed` / `search` | APP'te direkt kullanılmıyor; WEB için opsiyonel |
