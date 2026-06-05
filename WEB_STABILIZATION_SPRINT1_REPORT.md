# WEB STABILIZATION SPRINT 1 REPORT

**Tarih:** 5 Haziran 2026  
**Kapsam:** Phase 1 (MC-001…004) + Phase 2 (ES-001…004)  
**Sonuç:** 8/8 görev tamamlandı · `tsc --noEmit` exit 0 · lint temiz

---

## Değişen Dosyalar

| Dosya | Değişiklik | Görev |
|-------|-----------|-------|
| `web/features/discover/visual-reference/discover-view-model-adapter.ts` | `buildDiscoverViewModel(posts, isMock=true)` — isMock false'da VR fallback, topicEcosystems, marketTickers boş | MC-001 + MC-002 |
| `web/features/discover/hooks/use-discover-view-model.ts` | `buildDiscoverViewModel(postsForVm, mockOn)` çağrısı güncellendi | MC-001 |
| `web/features/markets/lib/market-news-shared.ts` | `getMarketNewsPhoto` — mock false'da gerçek image_url, yoksa neutral SVG; mock true'da eski Unsplash | MC-003 |
| `web/features/signals/hooks/use-mock-signal-subscriber.ts` | `isMockDataEnabled()` guard — mock false'da `false` döner | MC-004 |
| `web/features/signals/hooks/use-signals-catalog.ts` | `rails` — mock false'da `[]` döner (mock fn bağımlılığı kaldırıldı) | ES-003 |
| `web/features/studio/studio-dashboard-client.tsx` | `hasRealContent` kontrolü — sıfır metrikler yerine "Henüz içerik yok" empty state | ES-001 |
| `web/features/studio/studio-live-client.tsx` | "Programlı Yayınlar" empty state iyileştirildi (ikon + açıklama metni) | ES-002 |

---

## Yapılan Değişikliklerin Detayı

### MC-001 + MC-002 — Discover VR Fallback Fix

**Problem:** `buildDiscoverViewModel` feed boşken her bölümü `VR_LIVE_ITEMS`, `VR_PULSE_ITEMS` vb. statik VR dizileriyle dolduruyordu. `topicEcosystems` ve `marketTickers` her zaman static'ti.

**Çözüm:** `buildDiscoverViewModel(posts, isMock = true)` imzasına `isMock` parametresi eklendi.
- `isMock = false` → `orCopy` ikinci parametreyi yoksayar, boş bölümler boş kalır
- `isMock = false` → `topicEcosystems: []`, `marketTickers: []`
- `DISCOVER_STATIC_VIEW_MODEL` geriye dönük uyumlu (`isMock=true` hardcoded)
- `useDiscoverViewModel` → `buildDiscoverViewModel(postsForVm, isMockDataEnabled())` çağrısı güncellendi

**Mock True:** Önceki gibi çalışır — VR data doldurur.  
**Mock False:** Gerçek feed posts'tan üretilen içerik, boşlarda boş section.

### MC-003 — Market News Unsplash Fix

**Problem:** `getMarketNewsPhoto` her zaman Unsplash URL haritasına düşüyordu. Gerçek haberler mock görseli gösteriyordu.

**Çözüm:**
- `NEWS_PHOTOS` ve `CAT_PHOTOS` — `export` kaldırıldı, dosya-private
- `neutralPlaceholder(category)` — kategori rengine göre SVG data URL
- `getMarketNewsPhoto` imzasına `imageUrl?: string | null` eklendi
- Mock false → `item.imageUrl` varsa kullan, yoksa neutral SVG
- Mock true → eski Unsplash davranışı korunur

**Rollback:** `isMockDataEnabled()` false → false çağrısı otomatik korunur.

### MC-004 — Signal Subscriber Guard

**Problem:** `useMockSignalSubscriber` `isMockDataEnabled()` kontrolü olmadan her zaman localStorage'ı okuyor, dev araçlarıyla mock false'da tetiklenebiliyordu.

**Çözüm:** Hook sonuna `return isMockDataEnabled() ? liveValue : false;` eklendi.  
**Mock False:** Daima `false`, localStorage'a hiç bakılmaz.  
**Mock True:** Önceki gibi çalışır.

### ES-001 — Studio Dashboard Empty State

**Problem:** Mock false + gerçek içerik yokken `totalViews: 0`, `publishedCount: 0` gösteren yanıltıcı metrik dashboard.

**Çözüm:** `hasRealContent` kontrolü — `mockOn || publishedCount > 0 || totalViews > 0 || followerGrowth7d !== 0` false ise "Henüz içerik yok" + "İlk İçeriği Yükle" CTA gösterilir.  
**Mock True:** Dashboard önceki gibi çalışır.  
**Mock False + içerik var:** Dashboard normal gösterilir.  
**Mock False + içerik yok:** Temiz empty state.

### ES-002 — Studio Live Empty State

**Problem:** `streams.length === 0` iken tek satır metin vardı; UX zayıftı.

**Çözüm:** Programlı Yayınlar bölümüne ikon + başlık + açıklama içeren belirgin empty state eklendi.

### ES-003 — Signals Marketplace Rails

**Problem:** `buildSignalsMarketplaceRails` mock helper fonksiyonlara (`buildMockSignalThreadPack`) bağlıydı. Mock false'da gerçek `rows` ile de çağrılıyordu.

**Çözüm:** `use-signals-catalog.ts` — `if (!mockOn) return []`. Marketplace rails live modda boş; `signals-page-client.tsx` zaten `rails.length > 0` kontrolü yapıyor → section gizlenir.  
**Mock True:** Önceki gibi çalışır.  
**Mock False:** Marketplace section gizlenir (backend rails API gelince açılacak).

### ES-004 — Home Editorial Rail

**Tespit:** `HomeSectionRenderer` bileşeni hiçbir yerde import edilmiyor; `getHomeSections → []` live modda zaten hiç render edilmiyor. Değişiklik gerekmedi.

---

## Risk Analizi

| Değişiklik | Risk | Açıklama |
|-----------|:---:|---------|
| MC-001/002 VR fallback | 🟢 Düşük | `isMock=true` default → geriye dönük uyumlu; `DISCOVER_STATIC_VIEW_MODEL` bozulmadı |
| MC-003 Unsplash | 🟢 Düşük | `getMarketNewsPhoto` imzasına optional `imageUrl` eklendi; mevcut çağrılar tip-uyumlu |
| MC-004 subscriber | 🟢 Düşük | `useSyncExternalStore` çağrısı korundu; yalnızca return değeri conditional |
| ES-001 dashboard | 🟡 Orta | `publishedCount/totalViews` 0 iken yeni branch; mock true'da bypass |
| ES-002 live | 🟢 Düşük | Sadece empty state görünümü değişti |
| ES-003 rails | 🟢 Düşük | `rails = []` live modda → mevcut `null` dönüşüne eşdeğer |

---

## Build Sonucu

```
tsc --noEmit     → exit 0 (tip hatası yok)
ReadLints        → 0 linter hatası (7 dosya)
```

---

## Kalan İşler (Phase 3+)

| ID | İş | Tür | Öncelik |
|----|-----|-----|---------|
| BE-REP-001 | Notification actor_avatar_url fetch | WEB fetch | P1 |
| BE-REP-002 | Signal upload → `signals` tablosu | WEB + backend | P1 |
| BE-REP-003 | Studio content edit fetch | WEB | P2 |
| BE-REP-004 | Settings persistence | WEB + backend | P2 |
| P4-001 | Home sections gerçek data | Backend RPC | P2 |
| P4-002 | Creators directory RPC | Backend RPC | P2 |
| P4-003 | Signals leaderboard sections | Backend hook | P1 |
| P4-004 | Studio analytics RPC | Backend RPC | P3 |
| P4-007 | Market news cron aktif + images | Backend cron | P1 |

---

*Sprint 1 tamamlandı. 8/8 görev. Hiçbir APP/backend/write-gate değişikliği yapılmadı.*
