# WEB SECURITY & WRITE-GATE FIX SPRINT REPORT

**Sprint:** 2.6  
**Tarih:** 5 Haziran 2026  
**Kapsam:** comments RLS doğrulama + WG-001/002/003 write-gate

---

## Executive Summary

Sprint 2.6 tamamlandı. `comments` tablosundaki `UPDATE USING(true)` politikası **CRITICAL** olarak doğrulandı; idempotent SQL düzeltmesi hazırlandı (`P0_002_COMMENTS_RLS_FIX.sql`). WEB tarafında üç eksik write-gate guard eklendi (Studio Edit, Settings, Messages). TypeScript kontrolü geçti; lint'te değiştirilen dosyalarda yeni hata yok.

**RPC Sprint kararı:** `READY_FOR_RPC_SPRINT` — P0-002 SQL production'da uygulandı (5 Haziran 2026, kullanıcı onayı).

---

## Comments Policy Validation

### Karar: **CRITICAL**

### Kanıt

| Kaynak | Bulgu |
|--------|-------|
| `FINAL_SQL.sql:1116-1118` | `CREATE POLICY "Yorum begeni guncellenebilir" ON comments FOR UPDATE USING (true);` |
| `ADD_TABLES.sql:1062-1064` | Aynı policy — override yok |
| `P0_*.sql` dosyaları | comments UPDATE policy düzeltmesi **yok** |
| Repo geneli | Policy override eden migration **bulunamadı** |

### Davranış Analizi

- Policy adı "Yorum begeni guncellenebilir" — beğeni sayacı güncellemesi için yazılmış.
- **Gerçek beğeni akışı** (`hooks/useComments.ts`, `web/features/post/post-detail-client.tsx`) `comment_likes` tablosu kullanıyor; `comments` satırına doğrudan UPDATE yapmıyor.
- Ancak `USING(true)` ile **authenticated herhangi bir kullanıcı** PostgREST üzerinden herhangi bir yorumun `content`, `user_id`, `likes` alanlarını güncelleyebilir.
- Bu, eski migration kalıntısı değil; aktif production şema referansında (`FINAL_SQL`) tanımlı ve uygulanmış kabul edilmeli.

### Uygulanan Düzeltme

Dosya: `P0_002_COMMENTS_RLS_FIX.sql`

```sql
DROP POLICY IF EXISTS "Yorum begeni guncellenebilir" ON comments;
CREATE POLICY "Yorum sahibi guncelleyebilir"
  ON comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Durum:** ✅ Production'da uygulandı (kullanıcı onayı — 5 Haziran 2026).

### Yan Not (Bu Sprint Kapsamı Dışı)

`video_comments` tablosunda da `UPDATE USING(true) WITH CHECK(true)` mevcut (`FINAL_SQL.sql:1349-1353`). RPC sprint öncesi ayrı P0 görevi olarak ele alınmalı.

---

## WG-001 Studio Edit

**Dosya:** `web/features/studio/studio-content-edit-client.tsx`

| Özellik | Detay |
|---------|-------|
| Guard | `isWebWriteEnabled()` — live save path başında |
| Write kapalı | Supabase UPDATE çalışmaz, `saveError` state ile mesaj gösterilir, `saving` düzgün kapanır |
| Mock true | localStorage path değişmedi |
| Hata mesajı | `WEB_WRITE_BLOCKED_MESSAGE` |

---

## WG-002 Settings

**Dosya:** `web/features/social/hooks/use-settings-preferences.ts`

| Özellik | Detay |
|---------|-------|
| Guard | `isWebWriteEnabled()` — `saveProfileSettings()` başında |
| Write kapalı | `profiles` UPDATE atlanır; local repo state güncellemesi devam eder |
| Mock true | `liveMode=false` → Supabase çağrısı zaten yapılmıyor |

---

## WG-003 Messages

**Dosya:** `web/features/messages/fetch-conversations.ts`

| Özellik | Detay |
|---------|-------|
| Guard | `isWebWriteEnabled()` — `sendMessageRemote()` başında |
| Write kapalı | `dm_messages` INSERT yapılmaz, `{ ok: false, error }` döner |
| Return type | `Promise<void>` → `Promise<{ ok: boolean; error?: string }>` (TypeScript uyumlu) |
| UX | `use-message-inbox.ts` değişmedi; bloke durumda mesaj gönderilmez, liste yenilenmez |

---

## Changed Files

| Dosya | Değişiklik |
|-------|-----------|
| `P0_002_COMMENTS_RLS_FIX.sql` | **YENİ** — comments UPDATE RLS düzeltmesi |
| `web/features/studio/studio-content-edit-client.tsx` | WG-001 write-gate + `saveError` UI |
| `web/features/social/hooks/use-settings-preferences.ts` | WG-002 write-gate |
| `web/features/messages/fetch-conversations.ts` | WG-003 write-gate + typed return |
| `WEB_SECURITY_WRITE_GATE_FIX_SPRINT_REPORT.md` | **YENİ** — bu rapor |

**Dokunulmayan:** APP, backend schema, RPC, Edge Functions, write-gate env.

---

## Validation Results

### TypeScript

```
npx tsc --noEmit → EXIT 0 (hata yok)
```

### Lint

```
npm run lint → 198 mevcut problem (122 error, 76 warning)
```

Değiştirilen dosyalarda **yeni lint hatası yok**. Mevcut hatalar önceden var (`fetch-conversations.ts` any tipleri, `use-settings-preferences.ts` any — Sprint 2'den).

### Davranış Matrisi

| Mod | Write-gate | Studio Edit | Settings | Messages |
|-----|-----------|-------------|----------|----------|
| Mock true | — | localStorage save ✅ | repo only ✅ | repo send ✅ |
| Mock false + write OFF | kapalı | UPDATE bloke, hata mesajı ✅ | UPDATE atlanır ✅ | INSERT bloke ✅ |
| Mock false + write ON | açık | Supabase UPDATE ✅ | profiles UPDATE ✅ | dm_messages INSERT ✅ |

---

## Risk Assessment

| Risk | Seviye | Not |
|------|--------|-----|
| comments UPDATE açığı production'da | 🔴 KRİTİK | SQL çalıştırılana kadar açık |
| Write-gate tutarsızlığı | 🟢 DÜŞÜK | Sprint 2.6 ile kapatıldı |
| Studio edit liveMode UI bug (`baseItem` null) | 🟡 ORTA | Önceden var; bu sprint kapsamı dışı |
| video_comments UPDATE USING(true) | 🟡 ORTA | Ayrı P0 görevi |
| Mock/settings optimistic update | 🟢 DÜŞÜK | Write kapalıyken UI güncellenir, DB yazılmaz — beklenen |

---

## Remaining Work Before RPC Sprint

1. ~~**P0 — Zorunlu:** `P0_002_COMMENTS_RLS_FIX.sql`~~ ✅ Uygulandı

2. **P0 — Önerilen:** `video_comments` UPDATE policy explicit düzeltme (`USING(true)` — `FINAL_SQL.sql:1349-1353`)

3. **P1 — RPC Sprint:** `RPC_IMPLEMENTATION_PLAN.md` P0-RPC görevleri

4. **P2 — WEB:** Studio edit liveMode `baseItem` null UI bug (BE-REP-003 kalıntısı)

---

## Final Decision

### **READY_FOR_RPC_SPRINT**

**Gerekçe:**
- `comments` UPDATE RLS düzeltmesi production'da uygulandı (`P0_002_COMMENTS_RLS_FIX.sql`)
- WEB write-gate tutarlılığı tamamlandı (WG-001, WG-002, WG-003)
- TypeScript kontrolü geçti

**Sonraki adım:** `RPC_IMPLEMENTATION_PLAN.md` P0-RPC görevleri (önerilen sıra: `toggle_signal_like` → `copy_signal_once` → kalan P0 RPC'ler)

**Opsiyonel doğrulama sorgusu** (Dashboard SQL Editor):
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies WHERE tablename = 'comments' AND cmd = 'UPDATE';
```
Beklenen: `"Yorum sahibi guncelleyebilir"` + `auth.uid() = user_id`
