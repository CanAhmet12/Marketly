# WEB REPOSITORY IMPLEMENTATION READINESS REPORT

**Tarih:** 5 Haziran 2026  
**Kapsam:** BE-REP-001…004 — Kod değişikliği YOK, sadece doğrulama  
**Yöntem:** REST API sorguları + SQL taraması + kod incelemesi

---

## Executive Summary

| Feature | Backend Hazır | Repository Hazır | UI Hazır | Write-gate | Sonuç |
|---------|:---:|:---:|:---:|:---:|:---:|
| BE-REP-001 Notification Avatar | ⚠️ Kısmi | ❌ | ✅ | Etkilemiyor | **PARTIAL** |
| BE-REP-002 Signal Upload | ✅ | ❌ | ⚠️ | Etkilemiyor (açık) | **PARTIAL** |
| BE-REP-003 Studio Content Edit | ✅ | ❌ | ❌ | Etkilemiyor (açık) | **PARTIAL** |
| BE-REP-004 Settings Persistence | ✅ | ❌ | ❌ | Etkilemiyor (açık) | **PARTIAL** |

**Hepsi PARTIAL** — Backend'in 4'ü de hazır, eksik olan WEB repository/fetch implementasyonu.  
⚠️ **Ek güvenlik tespiti:** `profiles` tablosu anon UPDATE'e açık (HTTP 204 doğrulandı) — BE-REP-004'ten önce RLS düzeltilmeli.

---

## Notification Avatar Readiness (BE-REP-001)

### Durum: PARTIAL

### Bulgular

**Backend (DB):**

`notifications` tablosu `sender_id UUID REFERENCES auth.users(id)` kolonu var (FINAL_SQL `ALTER TABLE` ile eklendi, üretimde mevcut olmalı). Ancak `sender_id` → `auth.users` referansı; `profiles` tablosuna **doğrudan FK yok**.

**PostgREST JOIN Deneyi:**
```
GET /rest/v1/notifications?select=id,sender_id,profiles!notifications_sender_id_fkey(...)
→ HTTP 400 — PGRST200: Foreign key not found between 'notifications' and 'profiles'
```

`notifications.sender_id` → `auth.users(id)` FK'i var, ama `profiles(id)` ile doğrudan FK yok. PostgREST tek sorguda JOIN yapamıyor.

**Mevcut fetch kodu (`fetch-notifications.ts:30`):**
```typescript
actor_avatar_url: null,  // ← hardcoded null
```

**Çözüm yolu:** İki sorgu yaklaşımı:
1. `notifications` çek (mevcut)
2. `sender_id` UUID'lerini toplayıp `profiles` tablosuna ayrı sorgu at
3. Map ile birleştir

Bu yalnızca `fetch-notifications.ts`'de değişiklik gerektirir — backend migration yok.

**Write-gate:** Etkilemiyor (okuma işlemi).

**RLS:** `notifications` tablosu `FOR ALL USING (auth.uid() = user_id)` policy'si var — kullanıcı kendi bildirimlerini okuyabilir ✅

**Gerekli değişiklik:** `fetch-notifications.ts` — `sender_id`'leri toplayıp `profiles` tablosuna ikinci query.

**Engeller:** Yok.

---

## Signal Upload Readiness (BE-REP-002)

### Durum: PARTIAL

### Bulgular

**Backend (DB):**

`signals` tablosu kolonları doğrulandı:
```
asset_id, closed_at, confidence, copies_count, created_at, creator_id,
direction, entry_price, id, is_active, likes_count, rationale, result,
stop_loss, target_price, timeframe
```
Tüm gerekli kolonlar mevcut ✅

**RLS Policy:**
```sql
CREATE POLICY "Giris yapan sinyal olusturabilir" ON signals
FOR INSERT WITH CHECK (auth.uid() = creator_id);
```
INSERT policy var ✅

**Write-gate:** `NEXT_PUBLIC_WEB_WRITE_ENABLED=true` — açık ✅

**Sorun — Upload Page Live Akışı:**

Mock modda `kind === "signal"` → `addMockCreatedSignal()` doğru çalışıyor.

Canlı modda ne olduğuna bakıldığında:
- `insert-upload-post.ts` tipi: `export type UploadKind = "post" | "video" | "short"` — `signal` dahil değil
- Upload sayfasında live path `shouldInterceptMockUpload() === false` → gerçek Supabase'e gider
- Ama `insertUploadPost` signal'ı desteklemiyor — `posts` tablosuna yazar

Yani **signal upload live modda `posts` tablosuna yanlış tipte kayıt oluşturuyor** veya hata veriyor.

**Gerekli değişiklik:**
1. `insertSignal(client, args)` fonksiyonu yaz — `signals` tablosuna INSERT
2. Upload page live path'te `kind === "signal"` → `insertSignal` çağır
3. `storage-upload.ts` write-gate guard `throw Error` — signal için storage bucket gerekmeyebilir

**Engeller:** Yok — sadece WEB kodu.

---

## Studio Content Edit Readiness (BE-REP-003)

### Durum: PARTIAL

### Bulgular

**Backend (DB):**

`posts` UPDATE policy mevcut (FINAL_SQL'de `ON posts FOR UPDATE` onaylandı) ✅

**Write-gate:** Açık (`isWebWriteEnabled() = true`) ✅

**UI Sorunları (2 adet):**

**Sorun 1 — Item yükleme:**
```typescript
// studio-content-edit-client.tsx:52-53
const items = getStudioRepository().getContentItems(ownerId, mutations) ?? [];
return items.find((i) => i.id === contentId) ?? null;
```
`SupabaseStudioRepository.getContentItems` → `[]` döner (stub). `fetchStudioContent` ile `posts` gerçek veri çekiliyor ama edit client bunu kullanmıyor.

`baseItem === null` → `notFound: true` → "İçerik bulunamadı" empty state.

**Sorun 2 — Kaydetme:**
```typescript
// studio-content-edit-client.tsx:78
saveContentEdit(contentId, { title, preview, visibility });
```
`saveContentEdit` → localStorage'a yazar. Supabase'e hiç yazılmıyor.

**Gerekli değişiklik:**
1. Edit client'ta post'u `posts` tablosundan UUID ile çek (`fetchPostById`)
2. `onSave` → Supabase `posts` UPDATE (title, content) + localStorage sync

**Engeller:** Yok — sadece WEB fetch + save implementasyonu.

---

## Settings Persistence Readiness (BE-REP-004)

### Durum: PARTIAL

### ⚠️ KRİTİK GÜVENLİK TESPİTİ

**Anon key ile `profiles` UPDATE testi:**
```
PATCH /rest/v1/profiles?id=eq.{id}  (body: {"bio":"test"})
→ HTTP 204 ✅ (GEÇERLİ — Anon herhangi bir profili güncelleyebilir!)
```

**BU KRİTİK GÜVENLİK AÇIĞIDIR.** `FIX_PROFILES_RLS.sql` çalıştırılmamış olabilir veya production'da authenticated-only UPDATE policy yok. BE-REP-004'ten önce bu düzeltilmeli.

**Backend (DB):**

`profiles` tablosundaki mevcut kolonlar (üretimde doğrulandı):
```
avatar_url, bio, cover_url, email_digest_frequency, email_notifications,
full_name, last_digest_sent_at, subscription_price, tier, updated_at,
username, verified, marketcoin, signal_accuracy, ...
```
Ayarlar için gerekli kolonlar mevcut: `bio`, `username`, `full_name`, `avatar_url`, `email_notifications`, `email_digest_frequency` ✅

**Write-gate:** Açık ✅

**Repository Sorunu:**

`supabase-settings-repository.ts`: in-memory Map (`settingsSession`) kullanıyor.  
`getSettings` → mock default veya in-memory session döner.  
`updateSettings` → sadece Map günceller, Supabase'e yazmaz.

**Settings page (social repo → `getSettings`):** profile seed in-memory'e gidiyor.

**Gerekli değişiklik:**
1. **Önce:** `FIX_PROFILES_RLS.sql` çalıştır — `FOR UPDATE TO authenticated USING (auth.uid() = id)` policy'si eklensin
2. **Sonra:** `updateSettings` → `profiles` tablosuna UPDATE yaz
3. `getSettings` → `profiles` tablosundan fetch et (bio, username, email prefs)

**Engeller:** `FIX_PROFILES_RLS.sql` önce çalıştırılmalı.

---

## Write-Gate Impact Matrix

| Feature | Write-Gate Durumu | Etki | Not |
|---------|:---:|:---:|---|
| BE-REP-001 Notification Avatar | `true` (açık) | Etkilemiyor | Okuma işlemi |
| BE-REP-002 Signal Upload | `true` (açık) | Etkilemiyor | `insertUploadPost` guard var ama signal kendi pathinde |
| BE-REP-003 Studio Content Edit | `true` (açık) | Etkilemiyor | Supabase yazma için guard yok (özel fonksiyon yazılacak) |
| BE-REP-004 Settings Persistence | `true` (açık) | Etkilemiyor | `profiles` UPDATE — yeni fetch fonksiyon yazılacak |

**Write-gate'in hiçbiri için engel yok.** `NEXT_PUBLIC_WEB_WRITE_ENABLED=true` aktif.

---

## Backend Dependency Matrix

| Feature | Backend Hazır | Tablo/Policy | Repository | UI | Bloker |
|---------|:---:|---|:---:|:---:|---|
| **BE-REP-001** | ⚠️ | `notifications` var, `sender_id` var; profiles JOIN FK yok | ❌ fetch-notif ikinci sorgu | ✅ | Yok — iki sorgu gerek |
| **BE-REP-002** | ✅ | `signals` var, INSERT policy var | ❌ `insertSignal` yok | ⚠️ Mock path OK, live path yanlış | Yok |
| **BE-REP-003** | ✅ | `posts` var, UPDATE policy var | ❌ edit load + save | ❌ localStorage-only save | Yok |
| **BE-REP-004** | ✅ | `profiles` var, kolonlar var | ❌ in-memory only | ❌ profile prefs fetch | `FIX_PROFILES_RLS.sql` önce çalıştır |

---

## Risk Assessment

| Risk | Seviye | Açıklama |
|------|:---:|---------|
| Profiles anon UPDATE açığı | 🔴 KRİTİK | Herhangi biri başkasının profilini güncelleyebilir. `FIX_PROFILES_RLS.sql` çalıştırılmalı |
| Signal live path yanlış tablo | 🟡 ORTA | Canlı sinyal upload `posts` tablosuna yazıyor — veri kirliliği riski |
| Studio edit localStorage-only | 🟢 DÜŞÜK | Kayıt kalıcı değil, veri kaybı yok ama kullanıcı deneyimi bozuk |
| Notification avatar null | 🟢 DÜŞÜK | Görsel eksik, fonksiyon bozuk değil |

---

## Recommended Next Sprint

### Öncelik 0 — Güvenlik (SQL, hemen)

```
FIX_PROFILES_RLS.sql çalıştır
Supabase Dashboard → SQL Editor:

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

**Bu olmadan BE-REP-004 başlanmamalı.**

### Phase A — Hemen Yapılabilir (WEB only)

| Task | Dosya | İş |
|------|-------|-----|
| BE-REP-001 | `fetch-notifications.ts` | `sender_id` → `profiles` ikinci sorgu, `actor_avatar_url` doldur |
| BE-REP-002 | `insert-upload-post.ts` + upload page | `insertSignal()` fonksiyonu + live path routing |
| BE-REP-003 | `studio-content-edit-client.tsx` | Supabase'den post yükle + `posts` UPDATE save |

### Phase B — Küçük Backend Doğrulaması Sonrası

| Task | Dosya | Önkoşul |
|------|-------|---------|
| BE-REP-004 | `supabase-settings-repository.ts` + settings page | `FIX_PROFILES_RLS.sql` çalıştırılmış olmalı |

### Phase C — Migration/RPC Gerektiren

Yok (bu 4 feature için migration gerekmiyor).

### Phase D — Write-Gate Bağımlı

Yok (write-gate açık).

---

## Kesin Kararlar

**BE-REP-001 — PARTIAL**
- Backend kısmi hazır (`notifications.sender_id` var ama `profiles` FK yok)
- Fix: `fetch-notifications.ts` ikinci sorgu (sadece WEB kodu)
- Engel: Yok → Implementasyona geçilebilir

**BE-REP-002 — PARTIAL**
- Backend hazır (`signals` tablosu + INSERT policy)
- Fix: `insertSignal` fonksiyonu + upload page live path
- Engel: Yok → Implementasyona geçilebilir

**BE-REP-003 — PARTIAL**
- Backend hazır (`posts` tablosu + UPDATE policy)
- Fix: Edit client item yükleme + Supabase save
- Engel: Yok → Implementasyona geçilebilir

**BE-REP-004 — PARTIAL (önkoşul var)**
- Backend hazır (profiles kolonlar mevcut)
- 🔴 Önce: `FIX_PROFILES_RLS.sql` çalıştır (güvenlik açığı var)
- Sonra: `supabase-settings-repository` Supabase save implementasyonu
- Engel: RLS güvenlik açığı kapatılmalı → Önce SQL çalıştır, sonra implementasyon
