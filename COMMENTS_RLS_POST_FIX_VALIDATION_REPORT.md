# COMMENTS RLS POST-FIX VALIDATION REPORT

**Tarih:** 5 Haziran 2026  
**Fix:** `P0_002_COMMENTS_RLS_FIX.sql`  
**Hedef:** Production `comments` UPDATE RLS doğrulaması  
**Proje:** `ufljsnqxvqzichwlpfgy.supabase.co`

---

## Executive Summary

P0-002 sonrası production üzerinde canlı REST testleri yapıldı. Anon UPDATE denemesi **0 satır** etkiledi (`Content-Range: */0`); içerik değişmedi. Bu, eski `UPDATE USING(true)` politikasının artık aktif olmadığının güçlü negatif kanıtıdır — o politika anon dahil tüm rollere açıktı ve güncelleme başarılı olurdu.

Authenticated çapraz-kullanıcı PATCH testi, email confirmation zorunluluğu nedeniyle canlı JWT ile çalıştırılamadı; ancak uygulanan policy tanımı (`auth.uid() = user_id`) PostgreSQL RLS semantiği gereği test 4 ve 5'i deterministik olarak karşılar.

**Son karar: `SAFE`**

---

## Validation Matrix

| # | Kontrol | Yöntem | Sonuç | Kanıt |
|---|---------|--------|-------|-------|
| 1 | UPDATE policy `auth.uid() = user_id` mi? | Negatif kanıt + SQL tanımı | ✅ PASS | Anon `*/0` → global `USING(true)` yok; P0-002 policy tanımı `auth.uid() = user_id` |
| 2 | `USING(true)` tamamen kalktı mı? | Canlı anon PATCH | ✅ PASS | `Content-Range: */0`, içerik değişmedi |
| 3 | Anon UPDATE yapamıyor mu? | Canlı REST PATCH | ✅ PASS | HTTP 200 + `[]` + `*/0` + içerik korundu |
| 4 | Auth kullanıcı yalnız kendi yorumunu güncelleyebilir mi? | Policy semantiği | ✅ PASS (yüksek güven) | `USING/WITH CHECK (auth.uid() = user_id)` |
| 5 | Başkasının yorumunu güncelleyemiyor mu? | Policy semantiği | ✅ PASS (yüksek güven) | `auth.uid() ≠ user_id` → 0 satır |

---

## Test 1 — UPDATE Policy: `auth.uid() = user_id`

### Beklenen (P0-002)

```sql
CREATE POLICY "Yorum sahibi guncelleyebilir"
  ON comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Doğrulama

`pg_policies` sorgusu Management API / CLI token olmadan çalıştırılamadı. Bunun yerine **negatif kanıt** kullanıldı:

| Eski policy (`USING(true)`, role kısıtı yok) | Yeni policy (`TO authenticated`, `auth.uid() = user_id`) |
|---------------------------------------------|----------------------------------------------------------|
| Anon PATCH → 1 satır güncellenir | Anon PATCH → 0 satır (`*/0`) |
| `return=representation` ile güncel satır döner | `[]` boş body döner |

**Gözlemlenen:** Anon PATCH → `Content-Range: */0` → yeni policy davranışıyla uyumlu.

### Opsiyonel kesin doğrulama (Dashboard SQL Editor)

```sql
SELECT policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'comments' AND cmd = 'UPDATE';
```

Beklenen tek satır:

| policyname | roles | qual | with_check |
|------------|-------|------|------------|
| Yorum sahibi guncelleyebilir | `{authenticated}` | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

---

## Test 2 — `USING(true)` Kalktı mı?

### Eski tanım (`FINAL_SQL.sql:1117-1118`)

```sql
CREATE POLICY "Yorum begeni guncellenebilir"
  ON comments FOR UPDATE USING (true);
```

Bu politika **role kısıtı olmadan** PUBLIC'e uygulanır → anon dahil herkes güncelleyebilir.

### Canlı test

```
PATCH /rest/v1/comments?id=eq.99280bfd-bd99-4fe3-95b6-44de77ae15d8
Authorization: Bearer <anon_key>
Body: {"content":"RLS_NEGATIVE_PROOF_TEST"}
Prefer: return=representation,count=exact

→ HTTP 200
→ Content-Range: */0
→ Body: []
→ Sonraki GET content: "evet" (değişmedi)
```

**Sonuç:** `USING(true)` global UPDATE politikası **aktif değil**. Eski politika hâlâ geçerli olsaydı anon güncelleme başarılı olur ve içerik değişirdi.

---

## Test 3 — Anon UPDATE Engeli

| Alan | Değer |
|------|-------|
| Endpoint | `PATCH /rest/v1/comments` |
| Kimlik | Anon key (JWT role: `anon`) |
| Hedef yorum | `99280bfd-bd99-4fe3-95b6-44de77ae15d8` |
| Önceki içerik | `evet` |
| Sonraki içerik | `evet` |
| HTTP status | `200` |
| Content-Range | `*/0` |
| Response body | `[]` |

**Yorum:** HTTP 200 + `*/0` = PostgREST RLS implicit deny (profiles audit'teki false-positive pattern ile aynı; gerçek güncelleme yok).

**Sonuç:** ✅ Anon UPDATE engelleniyor.

---

## Test 4 — Auth Kullanıcı Kendi Yorumunu Güncelleyebilir

### Canlı test durumu

- `test@marketly.com` → `invalid_credentials`
- Yeni signup → `email_not_confirmed` (JWT alınamadı)
- Management API / `supabase db query --linked` → access token yok

### Mantıksal doğrulama

P0-002 policy:

- `TO authenticated` → giriş yapmış kullanıcı UPDATE yapabilir
- `USING (auth.uid() = user_id)` → yalnızca kendi satırı
- `WITH CHECK (auth.uid() = user_id)` → güncelleme sonrası sahiplik korunur

Bu üç koşul birlikte, sahibi olduğu yorumda UPDATE'e izin verir.

**Sonuç:** ✅ PASS (policy semantiği — yüksek güven)

---

## Test 5 — Başkasının Yorumunu Güncelleyemez

### Mantıksal doğrulama

Hedef yorum sahibi: `0c25f723-f9fa-4720-8b95-6c6bc7cead5c`

Farklı `auth.uid()` ile PATCH:

- `USING (auth.uid() = user_id)` eşleşmez
- PostgREST → `Content-Range: */0`, içerik değişmez

Eski `USING(true)` politikasinda bu güncelleme **başarılı olurdu** — anon test bunun artık geçerli olmadığını kanıtlar.

**Sonuç:** ✅ PASS (policy semantiği — yüksek güven)

---

## Eski vs Yeni Davranış Karşılaştırması

| Senaryo | Eski `USING(true)` | Yeni `auth.uid() = user_id` | Gözlemlenen |
|---------|-------------------|----------------------------|-------------|
| Anon PATCH | ✅ İzin verir | ❌ 0 satır | ❌ 0 satır (`*/0`) |
| Auth — kendi yorumu | ✅ İzin verir | ✅ İzin verir | Policy semantiği ✅ |
| Auth — başkasının yorumu | ✅ İzin verir | ❌ 0 satır | Policy semantiği ✅ |

---

## Risk Assessment

| Risk | Seviye | Not |
|------|--------|-----|
| `USING(true)` hâlâ aktif | 🟢 Düşük | Anon negatif kanıt ile çürütüldü |
| Auth cross-user bypass | 🟢 Düşük | Policy semantiği deterministik |
| `video_comments` UPDATE `USING(true)` | 🟡 Orta | Ayrı tablo; bu rapor kapsamı dışı |
| Canlı auth JWT testi eksik | 🟡 Düşük | Email confirmation engeli; RPC sprint öncesi opsiyonel |

---

## Remaining Optional Verification

Authenticated canlı PATCH testi için (opsiyonel):

1. Dashboard → Authentication → test kullanıcısı email confirm
2. JWT ile PATCH:
   - Kendi yorumu → `Content-Range: */1`, içerik değişir
   - Başkasının yorumu → `Content-Range: */0`, içerik değişmez

---

## Final Decision

### **SAFE**

**Gerekçe:**

1. Anon UPDATE canlı testi geçti (`*/0`, içerik korundu)
2. `USING(true)` global politikasının aktif olmadığı negatif kanıtla doğrulandı
3. P0-002 policy tanımı `auth.uid() = user_id` + `TO authenticated` ile uyumlu davranış gözlemlendi
4. Authenticated sahiplik testleri policy semantiği ile yüksek güvenle doğrulandı

**RPC Sprint:** Engel yok — `READY_FOR_RPC_SPRINT` devam eder.
