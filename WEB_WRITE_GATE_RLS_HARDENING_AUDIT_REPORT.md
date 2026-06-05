# WEB WRITE-GATE & RLS HARDENING AUDIT REPORT

**Tarih:** 5 Haziran 2026  
**Kapsam:** WEB write path envanteri, write-gate tutarlılığı, RLS policy analizi  
**Yöntem:** Kod taraması + SQL dosyaları. Hiçbir dosya değiştirilmedi.

---

## Executive Summary

| Bulgu | Sayı |
|-------|:---:|
| Write-gate kullanan WEB write path | **13** çağrı noktası (9 dosya) |
| Write-gate KULLANMAYAN canlı write | **8 dosya** (bazı `liveMode` korumalı) |
| Kasıtlı write-gate istisnası | 2 (auth profile RPCs) |
| RLS tam politikası olan tablolar | ~12 tablo |
| Kritik RLS açığı | 1 (**`comments` UPDATE USING(true)**) |
| Çakışan policy (FOR ALL + individual) | 3 tablo |

**En kritik:** `comments` tablosunda `UPDATE USING(true)` var — authenticated herhangi biri herhangi bir yorumu düzenleyebilir.  
**İkincil:** Sprint 2'de eklenen 3 write path (studio edit, settings, notifications mark-read) write-gate kullanmıyor.

---

## Write-Gate Utility Map

**Dosya:** `web/lib/supabase/write-guard.ts`

```typescript
export function isWebWriteEnabled(): boolean {
  if (isMockDataEnabled()) return false;       // mock → her zaman false
  if (typeof process === "undefined") return false;
  return truthyEnv(process.env.NEXT_PUBLIC_WEB_WRITE_ENABLED);  // env kontrolü
}
export const WEB_WRITE_BLOCKED_MESSAGE = "WEB salt-okuma modu...";
```

**Mevcut env durumu:** `NEXT_PUBLIC_WEB_WRITE_ENABLED=true` → write-gate **açık**

**Standart kullanım pattern'leri:**

| Pattern | Kullanım |
|---------|---------|
| `if (!isWebWriteEnabled()) return { error: WEB_WRITE_BLOCKED_MESSAGE }` | insertSignal, insertUploadPost, insertPostComment, insertVideoComment, insertFollow/deleteFollow, insertStoryRow, sendLiveMessage |
| `if (!isWebWriteEnabled()) return` (sessiz no-op) | togglePostLike, toggleSavedPost, incrementPostCommentCount, incrementLiveViewers |
| `if (!isWebWriteEnabled()) throw new Error(...)` | uploadToBucket |

---

## Write Path Inventory

| Risk | Dosya | Op | Tablo/Bucket | Write-gate | Güvenlik | Öneri |
|------|-------|----|-------------|:----------:|----------|-------|
| 🟢 | `upload/insert-signal.ts` | INSERT | `signals` | ✅ | RLS: creator_id | OK |
| 🟢 | `upload/insert-upload-post.ts` | INSERT | `posts` | ✅ | RLS: user_id | OK |
| 🟢 | `upload/storage-upload.ts` | upload | buckets | ✅ (throw) | Bucket policy | OK |
| 🟢 | `channel/fetch-follow.ts` | INSERT/DELETE | `follows` | ✅ | RLS: follower_id | OK |
| 🟢 | `engagement/post-like-save.ts` | INSERT/DELETE | `post_likes`, `saved_posts` | ✅ (sessiz) | RLS: user_id | OK — guard davranışı sessiz ama güvenli |
| 🟢 | `post/fetch-post-comments.ts` | INSERT + RPC | `comments`, `posts` | ✅ | RLS: user_id | OK |
| 🟢 | `watch/fetch-video-comments.ts` | INSERT | `video_comments` | ✅ | RLS: user_id | OK |
| 🟢 | `stories/upload-story.ts` | INSERT + upload | `stories`, `stories` bucket | ✅ | RLS: user_id | OK |
| 🟢 | `live/fetch-live-messages.ts` | INSERT + RPC | `live_messages` | ✅ | RLS | OK |
| 🟡 | `studio/studio-content-edit-client.tsx` | UPDATE | `posts` | ❌ | `liveMode` + `.eq("user_id")` + RLS | **GUARD EKLENMELİ** |
| 🟡 | `social/hooks/use-settings-preferences.ts` | UPDATE | `profiles` | ❌ | `liveMode` + `.eq("id")` + RLS | **GUARD EKLENMELİ** |
| 🟡 | `notifications/fetch-notifications.ts` | UPDATE | `notifications` | ❌ | `liveMode` + `.eq("user_id")` | Guard veya özel istisna? |
| 🟡 | `messages/fetch-conversations.ts` | INSERT | `dm_messages` | ❌ | `liveMode` + trim | **GUARD EKLENMELİ** |
| 🟡 | `markets/fetch-watchlist.ts` | INSERT/DELETE | `watchlists` | ❌ | `liveMode` + `.eq("user_id")` | Guard önerilir |
| 🟡 | `markets/fetch-price-alerts.ts` | DELETE | `price_alerts` | ❌ | `liveMode` varsayımı | Guard önerilir |
| 🔴 | `post/post-detail-client.tsx` | upsert/DELETE | `comment_likes`(?) | ❌ | Inline Supabase, mock check | **GUARD EKLENMELİ** |
| 🔵 | `stories/fetch-stories.ts` | INSERT | `story_views` | ❌ (sadece mock) | Düşük risk (view kaydı) | P2 |
| 🔵 | `auth/profile.ts` | RPC | `create_profile_if_not_exists` | ❌ (kasıtlı) | Auth temel akış | İstisna — değiştirme |
| 🔵 | `auth/profile.ts` | RPC | `update_user_streak` | ❌ (kasıtlı) | Auth temel akış | İstisna — değiştirme |

---

## Missing Write-Gate Guards

Öncelikli eksikler:

| Dosya | Fonksiyon | Write Op | Neden Önemli |
|-------|-----------|----------|--------------|
| `studio/studio-content-edit-client.tsx` | `onSave` | `posts.update` | Sprint 2'de eklendi; write-gate standardına uymuyor |
| `social/hooks/use-settings-preferences.ts` | `saveProfileSettings` | `profiles.update` | Sprint 2'de eklendi; guard yok |
| `messages/fetch-conversations.ts` | `sendMessageRemote` | `dm_messages.insert` | Sprint 1'de eklendi; guard yok |
| `post/post-detail-client.tsx` | `commentLikeMutation.mutationFn` | `comment_likes` upsert/delete | Inline Supabase; guard yok |
| `markets/fetch-watchlist.ts` | `addToWatchlistDb`, `removeFromWatchlistDb` | `watchlists` insert/delete | Sprint 1'de eklendi; guard yok |
| `notifications/fetch-notifications.ts` | `markNotificationReadRemote`, `markAllNotificationsReadRemote` | `notifications.update` | Sprint 1'de eklendi |
| `markets/fetch-price-alerts.ts` | `deletePriceAlert` | `price_alerts.delete` | Guard yok; `liveMode` var mı? belirsiz |

**Kasıtlı istisnalar (değiştirme):**
- `auth/profile.ts` — P0-005 gerekçesiyle write-gate dışı
- `auth/auth-provider.tsx` — Supabase Auth API (session, signUp vb.)

---

## RLS Policy Matrix

FINAL_SQL.sql + ADD_TABLES.sql + CREATE_GROUP_TABLES_ONLY.sql + doğrulama testleri temel alındı.

| Tablo | SELECT | INSERT | UPDATE | DELETE | Durum | Kritik Not |
|-------|:------:|:------:|:------:|:------:|-------|-----------|
| `profiles` | ✅ public | ✅ authenticated | ⚠️ implicit deny | ⚠️ implicit | `FIX_PROFILES_RLS.sql` çalıştırılmamış; implicit deny SAFE (test doğrulandı) | Explicit `FOR UPDATE TO authenticated` önerilir |
| `posts` | ✅ public | ✅ `auth.uid() = user_id` | ✅ `auth.uid() = user_id` | ✅ `auth.uid() = user_id` | GOOD | — |
| `signals` | ✅ public | ✅ `auth.uid() = creator_id` | ✅ `auth.uid() = creator_id` | ✅ `auth.uid() = creator_id` | GOOD | — |
| `comments` | ✅ public | ✅ `auth.uid() = user_id` | 🔴 `USING(true)` | ✅ `auth.uid() = user_id` | **KRİTİK AÇIK** | UPDATE USING(true) — herhangi biri herhangi bir yorumu düzenleyebilir! |
| `video_comments` | ✅ public | ✅ `auth.uid() = user_id` | ⚠️ politika yok | ✅ `auth.uid() = user_id` | Kısmi | Implicit deny UPDATE — OK ama explicit olmalı |
| `saved_posts` | ⚠️ FOR ALL | ⚠️ FOR ALL | ⚠️ FOR ALL | ⚠️ FOR ALL | Çakışma riski | `FOR ALL USING(auth.uid() = user_id)` var — select herkese açık olmalı ama FOR ALL kısıtlıyor |
| `follows` | ✅ public + FOR ALL çakışma | ✅ `auth.uid() = follower_id` | ⚠️ FOR ALL ile çakışma | ✅ `auth.uid() = follower_id` | Çakışma riski | FINAL_SQL'de iki farklı bölümde çakışan policy DROP/CREATE var |
| `post_likes` | ⚠️ Önce `USING(true)`, P0-001 fix yapıldı | ✅ `auth.uid() = user_id` | — | ✅ `auth.uid() = user_id` | P0-001 sonrası düzeldi | P0-001 drop edildi, "Users can view own likes" var |
| `notifications` | ✅ FOR ALL `auth.uid() = user_id` | ✅ | ✅ | ✅ | GOOD | Çift policy tanımı var (L285 + L539) — ikincisi birincinin üzerine yazar |
| `stories` | ✅ public | ✅ own | — | ✅ own | İyi | UPDATE policy yok — insert/delete var |
| `dm_messages` | ✅ `party_access` | ✅ | ✅ | ✅ | GOOD | Çift tanım (L981 + L1632) — idempotent DROP sonrası ok |
| `portfolio_holdings` | ✅ own + public read | ✅ own | ✅ own | ✅ own | GOOD | Çift tanım ama DROP IF EXISTS ile handle edilmiş |
| `price_alerts` | ✅ FOR ALL own | ✅ | ✅ | ✅ | GOOD | — |
| `group_chats` | ✅ member check | ✅ creator | ✅ admin | — | GOOD (P0) | Sprint'te eklendi |
| `group_members` | ✅ own | ✅ admin | ✅ admin | ✅ admin | GOOD (P0) | Recursion fix yapıldı |
| `group_messages` | ✅ member | ✅ member | ✅ own | ✅ own | GOOD (P0) | — |

---

## Risk Assessment

| Önem | Risk | Tablo/Dosya | Açıklama |
|------|------|-------------|---------|
| 🔴 KRİTİK | `comments` UPDATE USING(true) | `comments` | Authenticated herhangi biri başkasının yorumunu düzenleyebilir. `USING(auth.uid() = user_id)` olmalı. |
| 🟡 YÜKSEK | Write-gate eksik (yeni path'ler) | studio edit, settings, messages | `NEXT_PUBLIC_WEB_WRITE_ENABLED=false` yapılınca bu path'ler bloke olmaz |
| 🟡 ORTA | `saved_posts` FOR ALL | `saved_posts` | FOR ALL USING(auth.uid() = user_id) — SELECT de kısıtlıyor; public erişim yok |
| 🟡 ORTA | `follows` çakışan policy | `follows` | FINAL_SQL'de L209 FOR ALL + L478-488 individual; son DROP/CREATE kazanır ama kafa karıştırıcı |
| 🟢 DÜŞÜK | `video_comments` UPDATE yok | `video_comments` | Implicit deny — güvenli ama explicit olmalı |
| 🟢 DÜŞÜK | `profiles` explicit UPDATE yok | `profiles` | Implicit deny SAFE (test doğrulandı); FIX_PROFILES_RLS.sql çalıştırılabilir |

---

## Recommended Fix Sprint

### P0 — Hemen SQL düzeltmesi (production güvenliği)

```sql
-- KRITIK: comments UPDATE düzelt
DROP POLICY IF EXISTS "Yorum begeni guncellenebilir" ON comments;
CREATE POLICY "Yorum sahibi guncelleyebilir" ON comments
FOR UPDATE TO authenticated USING (auth.uid() = user_id);
```

**Etki:** Mevcut yorum düzenleme (şu an yok ama ileride eklenecekse) doğru kişiye kısıtlanır; comment_likes update başka tablo → bu policy farklı amaçlı zaten.

### P0 — Hemen write-gate eklenmeli (tutarlılık)

Sprint 2'de eklenen 3 yeni path:

| Dosya | Fonksiyon | Eklenecek guard |
|-------|-----------|----------------|
| `studio/studio-content-edit-client.tsx` | `onSave` (live path) | `if (!isWebWriteEnabled()) { setSaving(false); return; }` |
| `social/hooks/use-settings-preferences.ts` | `saveProfileSettings` | `if (!isWebWriteEnabled()) return;` |
| `messages/fetch-conversations.ts` | `sendMessageRemote` | `if (!isWebWriteEnabled()) return;` |

### P1 — Önerilen write-gate eklemeleri

| Dosya | Fonksiyon | Öneri |
|-------|-----------|-------|
| `post/post-detail-client.tsx` | `commentLikeMutation.mutationFn` | write-gate veya ayrı fetch dosyasına taşı |
| `markets/fetch-watchlist.ts` | `addToWatchlistDb`, `removeFromWatchlistDb` | `if (!isWebWriteEnabled()) return` |
| `markets/fetch-price-alerts.ts` | `deletePriceAlert` | write-gate guard |
| `notifications/fetch-notifications.ts` | `markNotificationReadRemote` | write-gate veya özel istisna belgesi |

### P1 — Explicit RLS policy eklemeleri

| Tablo | Eksik Policy | SQL Özeti |
|-------|-------------|---------|
| `profiles` | UPDATE explicit | `FIX_PROFILES_RLS.sql` çalıştır |
| `video_comments` | UPDATE explicit | `FOR UPDATE TO authenticated USING (auth.uid() = user_id)` |

### P2 — Cleanup / İsteğe bağlı

| İş | Açıklama |
|----|---------|
| `saved_posts` FOR ALL → individual policies | SELECT public; INSERT/UPDATE/DELETE authenticated |
| `follows` çakışan policy temizle | Tek tutarlı policy seti |
| `notifications` çift tanım temizle | L285 veya L539 — biri kalsın |
| `portfolio_holdings` çift tanım temizle | DROP IF EXISTS ile zaten safe ama temizlenmeli |
| `stories/fetch-stories.ts` story view guard | `markStoryViewed` — `isMockDataEnabled()` veya write-gate |

---

## Kesin Karar

### Hangi dosyalara write-gate guard eklenmeli?

**P0 (Sprint 3 başında):**
1. `studio/studio-content-edit-client.tsx` → `onSave` live path
2. `social/hooks/use-settings-preferences.ts` → `saveProfileSettings`
3. `messages/fetch-conversations.ts` → `sendMessageRemote`

**P1:**
4. `post/post-detail-client.tsx` → comment like mutation
5. `markets/fetch-watchlist.ts` → add/remove
6. `markets/fetch-price-alerts.ts` → delete
7. `notifications/fetch-notifications.ts` → mark read (veya istisna belgele)

### Hangi RLS policy'ler explicit hale getirilmeli?

**P0 (SQL, kritik):**
1. `comments` UPDATE USING(true) → `USING (auth.uid() = user_id)`

**P1 (SQL, güvenlik iyileştirme):**
2. `profiles` UPDATE explicit (`FIX_PROFILES_RLS.sql`)
3. `video_comments` UPDATE explicit

### Hangi işler RPC sprintinden önce yapılmalı?

1. `comments` UPDATE policy düzeltmesi (SQL — P0)
2. Sprint 2 write-gate eksiklerini tamamla (3 dosya — P0)
3. `profiles` FIX_PROFILES_RLS.sql (SQL — P1)

RPC sprint başlamadan bu 3 iş tamamlanmalı — özellikle `comments` açığı sinyaller/içerik düzenleme RPC'lerinden önce kapatılmalı.
