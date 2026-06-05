# HOME & PERSONALIZATION RICHNESS RESTORE REPORT

## Executive Summary

Sprint B, mock-true zenginliğini mock-false modda mevcut Supabase verilerinden türeterek home ve kişiselleştirme katmanına geri yükledi. Yeni tablo, RPC, Edge Function veya SQL eklenmedi; APP dokunulmadı.

**Karar:** `DEPLOYED`

| Alan | Önce (live) | Sonra (live) |
|------|-------------|--------------|
| Home editorial rail | today/trending dolu; interests boş | interests + pulse summary türetildi |
| Home ambient rail | Sana özel / Topluluk gizli | Live öneri + piyasa özeti |
| Recommendations | `return null` (mock only) | watchlist/saved/signals/creators mapper |
| Saved | Düz liste | Kategori/üretici dağılımı + trend özeti |
| Memberships | Tüm intel `—` | posts/signals/followers türetilmiş intel |
| Settings | `live_sparse` boş satırlar | Profil doluluk, takip, kayıt, izleme özeti |

---

## Home Restore

### Current Live Gap (pre-sprint)
- `buildEditorialRailBundle`: interests yalnızca `EMPTY_INTEL` personalization'dan; live'da boş
- `HomeAmbientRail`: `if (!mockOn) return null` — Sana özel ve Topluluk tamamen gizli
- Market pulse statik semboller (`STATIC_MARKET_PULSE`)

### Restore Strategy
- `build-home-live-intelligence.ts`: interests, ambient summary, live pulse
- `fetch-home-editorial-chips.ts`: assets + signals + `market_news` → interests + pulseSummary
- `build-editorial-rail.ts`: intel boşken `liveChips.interests` fallback
- `use-home-live-context.ts` + `home-ambient-rail.tsx`: live summary, pulse, recommendations

### Restored Widgets
| Widget | Kaynak veri |
|--------|-------------|
| İlgi alanların (rail) | asset kategorileri, movers, trending signals |
| Bugün (ambient) | pulse summary (movers + sinyal dengesi + haber) |
| Kısayol (ambient) | en hareketli 6 varlık |
| Sana özel (ambient) | `buildLiveRecommendations` |
| Topluluk (ambient) | trending signals + creators |

### Gizlenen / Değişmeyen
- Mock-only rails (`HomeForYouIntelligenceRails`, `RecommendationNetworkRails`) mock'ta aynı
- Personalization `EMPTY_INTEL` server engine değişmedi — sadece derived fallback

---

## Recommendation Restore

### Mapper
`build-live-recommendations.ts`:
- İzleme listesi sembolleri → sinyal eşleşmeleri
- Kayıtlı post `asset_tag` → tema çıkarımı (Kripto, Borsa, Döviz)
- `get_leaderboard_analysts` (mevcut RPC) → creator önerileri
- `get_top_signals` (mevcut RPC) → topluluk sinyalleri

### Wire
- `use-home-live-context.ts` — watchlist, saved, follows, signals batch
- `HomeLivePersonalizationRail` — compact live UI
- `home-ambient-rail.tsx` — mock false Sana özel + Topluluk

### Empty State
- Union boş + takip yok → "Akışını şekillendir" + Keşfet CTA
- Sahte öneri üretilmez

---

## Saved Restore

### Mapper
`build-saved-intelligence.ts`:
- Kategori dağılımı (`asset_tag` → Kripto/Borsa/Döviz/Genel)
- Üretici dağılımı
- Son 7 gün kayıt sayısı
- Video payı %
- Trend summary satırı

### UI
- `saved-page-client.tsx` — intel panel (alan + üretici chip'leri)
- `saved-page.css` — `.sv-intel*` stilleri
- Empty: ürün dili CTA ("Keşfet üzerinden…")

---

## Membership Restore

### Mapper
`enrich-membership-intel.ts`:
- `posts` + `signals` + `follows` batch count
- `buildCreatorEconomyIntel` — yalnızca gerçek sayılardan label
- `fetchCreatorDetailEnrichment` — signal/post previews + activity timeline

### Güncellenen akış
- `fetchMembershipCatalog` → enrich per card
- `fetchMembershipDetail` → previews + intel + strategy_summary
- `buildSubscriptionsHubPayload` → affinity_line, platform_intel canlı copy

### Gizlenen
- Boş intel alanları kartlarda gösterilmez (`—` kaldırıldı)
- Sahte abone sayısı üretilmez — yalnızca gerçek `follows` count

### Hâlâ backend ister
- Ödeme / aktif üyelik satın alma
- Oda önizlemeleri (rooms tablosu bağlantısı yok)
- Kurumsal güven / oda katılımı skorları

---

## Settings Restore

### Mapper + Hook
- `build-settings-hub-from-live.ts` — profil doluluk, takip, kayıt, izleme, içerik hazırlığı
- `use-settings-hub-live.ts` — live stats fetch (follows, saved, watchlist, posts)

### UI
- Kişiselleştirme: `—` satırlar → türetilmiş değerler + intel tablosu
- İlgi profili: live'da artık erişilebilir; intel_lines gösterimi
- "Sunucudan beslenecek" metinleri kaldırıldı

### Hâlâ backend ister
- Login history, session cihaz özeti
- Server-side personalization confidence band

---

## Empty State Improvements

| Alan | Eski | Yeni |
|------|------|------|
| Settings kişiselleştirme | "Canlı modda ilgi özeti sunucudan beslenecek" | "İzleme listesi ve kayıtlarınla ilgi profilin oluşuyor" |
| Settings ilgi | "sunucu verisiyle oluşturulacak" | intel tablosu veya "Sembol izle, üretici takip et…" |
| Saved boş | Generic | Keşfet CTA + trend summary |
| Membership intel | `—` grid | Boş alan gizlenir; veri varsa gösterilir |
| Subscriptions hub | "Kişiselleştirme sunucu tarafında…" | Aktif üretici / sinyal odaklı özet |

---

## Changed Files

### Yeni
- `web/features/home/lib/build-home-live-intelligence.ts`
- `web/features/home/hooks/use-home-live-context.ts`
- `web/features/personalization/lib/build-live-recommendations.ts`
- `web/features/personalization/components/home-live-personalization-rail.tsx`
- `web/features/social/lib/build-saved-intelligence.ts`
- `web/features/subscriptions/lib/enrich-membership-intel.ts`
- `web/features/settings/lib/build-settings-hub-from-live.ts`
- `web/features/settings/hooks/use-settings-hub-live.ts`

### Güncellenen
- `web/features/home/fetch-home-editorial-chips.ts`
- `web/features/home/hooks/use-home-editorial-chips.ts`
- `web/features/home/editorial/build-editorial-rail.ts`
- `web/features/feed/home-ambient-rail.tsx`
- `web/features/social/saved-page-client.tsx`
- `web/styles/saved-page.css`
- `web/features/subscriptions/fetch-membership-catalog.ts`
- `web/features/subscriptions/subscriptions-hub-client.tsx`
- `web/features/subscriptions/membership-detail-client.tsx`
- `web/features/social/settings-page-client.tsx`

---

## Validation Results

| Check | Sonuç |
|-------|-------|
| `npx tsc --noEmit` | ✅ Pass |
| `npm run build` | ✅ Pass (Next.js 16.2.6) |
| Lint (değişen dosyalar) | ⚠️ Yalnızca mevcut Tailwind alias uyarıları |
| Mock import in live mappers | ✅ Yok |
| APP değişikliği | ✅ Yok |
| SQL/RPC/Edge yeni | ✅ Yok (mevcut `get_leaderboard_analysts`, `get_top_signals` kullanıldı) |

---

## Mock True / Mock False Behavior

### Mock true
- Değişmedi: `EDITORIAL_MOCK_*`, mock personalization rails, mock settings hub
- `isMockDataEnabled()` guard'ları korundu

### Mock false
- Home editorial: interests fallback from live chips
- Home ambient: live summary, pulse, Sana özel + Topluluk
- Saved: intelligence panel
- Subscriptions: derived creator intel
- Settings: enriched hub from live counts

### Mock production sızıntısı
- Live mapper'larda mock fixture import yok
- `build-editorial-rail.ts` mock fallback yalnızca `isMockDataEnabled()` içinde

---

## Risk Assessment

| Risk | Seviye | Not |
|------|--------|-----|
| Membership batch queries (posts/signals) | Düşük | limit 400; katalog max 24 |
| Home live context extra fetches | Düşük | staleTime 120s; parallel |
| Settings hub flash (base → enriched) | Düşük | baseHub anında; enrich async |
| Follower count undercount | Orta | follows limit 2000; büyük creator'da eksik olabilir — sahte sayı üretilmez |

---

## Remaining Gaps

| Alan | Durum | Gerek |
|------|-------|-------|
| Server personalization engine | `EMPTY_INTEL` | Backend sprint |
| Discussion personalized rails | mock only | RPC / server graph |
| Onboarding catalog | `EMPTY_CATALOG` | Backend |
| Close-friends hub | `live_sparse` | Backend |
| Membership ödeme / active subs | Boş | Payment integration |
| Room previews | Boş | rooms tablosu wire |
| Home feed ranking (for_you) | Local repo only | Server rank RPC (opsiyonel) |

---

## Final Decision

### Restore edilen widgetlar
- Home: interests rail, ambient summary, live pulse, Sana özel, Topluluk
- Recommendations: signal/creator/discover derived picks
- Saved: kategori + üretici dağılımı, trend summary
- Membership: içerik yoğunluğu, takipçi, aktivite, previews, timeline
- Settings: profil doluluk, takip/kayıt/izleme intel, ilgi profili live görünüm

### Gizlenen widgetlar
- Membership intel satırları veri yoksa (boş string)
- Kurumsal güven, oda katılımı (veri yok — gösterilmiyor)

### Tamamen canlı veriyle çözülen
- Home interests fallback
- Home ambient live sections
- Saved intelligence
- Membership catalog/detail derived intel
- Settings account/personalization summary

### Backend hâlâ isteyen
- Server personalization confidence/exploration engine
- Active paid subscriptions
- Room/desk intelligence
- Onboarding + close-friends

### Deploy gerekli mi?
**Evet** — web-only değişiklikler; Vercel deploy ile production'a alınmalı.

---

**READY_FOR_DEPLOY**
