# MARKETS CATEGORY LIVE RESTORE REPORT

**Sprint:** Markets Category Live Restore Mega Sprint  
**Tarih:** 5 Haziran 2026  
**Önceki:** `MARKETS_CATEGORY_REGRESSION_AUDIT_REPORT.md`

---

## Executive Summary

Launch Preparation sprint'inde eklenen `MarketsPageClient` fallback kaldırıldı; yerine **canlı `asset_prices` + `assets` mapper katmanı** eklendi. Mock false modda beş kategori de kendi **özel canvas**'ını (`crypto-canvas`, `forex-canvas`, vb.) render ediyor.

Mock true davranışı değişmedi (repository mock dashboard). Mock veri production mapper'a **bağlanmadı**.

| Kontrol | Sonuç |
|---------|-------|
| `npx tsc --noEmit` | ✅ |
| `npm run build` | ✅ |
| Yeni RPC/tablo/SQL | ❌ Yok |
| Mock production sızıntısı | ✅ Yok |

# Final Decision: `DEPLOYED`

Production deploy tamamlandı. Canvas smoke test geçti.

---

## Live Mapper Implementation

### Yeni dosyalar

| Dosya | Rol |
|-------|-----|
| `lib/live-category/live-category-shared.ts` | Filtreler, BIST/NASDAQ ayrımı, yardımcılar |
| `lib/live-category/live-category-zones.ts` | Widget görünürlük bayrakları |
| `lib/live-category/build-crypto-dashboard-from-assets.ts` | Crypto mapper |
| `lib/live-category/build-forex-dashboard-from-assets.ts` | Forex mapper |
| `lib/live-category/build-bist-dashboard-from-assets.ts` | BIST mapper |
| `lib/live-category/build-nasdaq-dashboard-from-assets.ts` | NASDAQ mapper |
| `lib/live-category/build-commodities-dashboard-from-assets.ts` | Commodities mapper |
| `hooks/use-category-dashboard.ts` | Mock/live birleşik hook |

### Live field envanteri

| Field | Live Available | Source |
|-------|----------------|--------|
| symbol | ✅ | `assets.symbol` / `asset_id` |
| name | ✅ | `assets.name` |
| price | ✅ | `asset_prices.price` |
| change_percent | ✅ | `asset_prices.change_percent` |
| volume | ✅ | `asset_prices.volume` |
| sparkline | ✅ | `asset_prices.spark` |
| category | ✅ | `assets.category` |
| marketCapLabel | ✅ | `asset_prices.market_cap` |
| signal_active_count | ✅ (çoğunlukla 0) | mapper default |
| exchange/region | ❌ | `assets` tablosunda yok — sembol kümesi |

---

## Category Restore Results

| Kategori | Canvas (live) | Fallback koşulu |
|----------|---------------|-----------------|
| Crypto | `crypto-canvas` ✅ | Global asset yok / fetch hata |
| Forex | `forex-canvas` ✅ | Aynı |
| BIST | `bist-canvas` ✅ | Aynı |
| Nasdaq | `nasdaq-canvas` ✅ | Aynı |
| Commodities | `commodities-canvas` ✅ | Aynı |

**MarketsPageClient** yalnızca:
- `fetchError === true`, veya
- `hasGlobalAssets === false` (tüm `asset_prices` boş)

**Kategori özel empty state:** Global veri var ama kategori filtresi 0 sembol.

---

## Widget Restore Matrix

| Widget | Crypto | Forex | BIST | Nasdaq | Commodities | Karar |
|--------|--------|-------|------|--------|-------------|-------|
| Pulse bar | ✅ restore | ✅ | ✅ | ✅ | ✅ | Live fiyat |
| Regime / market state | ✅ derived | ✅ derived | ✅ derived | ✅ derived | ✅ derived | Ort. değişimden |
| Segment / sector heatmap | ❌ hide | ❌ hide | ❌ hide | ❌ hide | ❌ hide | Backend yok |
| Anchor / pair panels | ✅ | ✅ | ✅ | ✅ | ✅ | BTC/ETH, EUR/GBP, XU100, NDX, XAU/WTI |
| Movers | ✅ | ✅ | ✅ | ✅ | ✅ | Sıralı change% |
| Screener | ✅ | ✅ | ✅ | ✅ | ✅ | Filtrelenmiş liste |
| Signal strip | ✅ if count>0 | ❌ hide | ❌ hide | ❌ hide | ❌ hide | Live signal count |
| Bottom strip | ✅ partial | ❌ hide | ❌ hide | ❌ hide | ❌ hide | Watchlist only; news/calendar boş |

---

## BIST vs Nasdaq Separation

`assets` tablosunda `exchange` / `region` alanı **yok**.

Geçici strateji (`live-category-shared.ts`):
- **BIST:** `BIST_SYMBOLS` kümesi + `*.IS` suffix + `index` XU/BIST
- **NASDAQ:** `NASDAQ_SYMBOLS` kümesi + US ticker regex — **BIST kümesi hariç**

Sonuç: Aynı `stocks` kategorisinde olsa bile filtreler farklı sembol setleri döndürür. DB'de yalnızca crypto varsa BIST/NASDAQ empty state gösterir (genel fallback değil).

---

## Production Validation

| Kontrol | Sonuç |
|---------|-------|
| Local `tsc --noEmit` | ✅ |
| Local `npm run build` | ✅ |
| Vercel deploy | ✅ `web-4vzz2kve2` |
| Production URL | https://web-iota-three-b9kxiudy28.vercel.app |

Deploy sonrası HTML marker grep (5 Haziran 2026):

| Route | Canvas | markets-fluid-scope |
|-------|--------|---------------------|
| `/markets/category/crypto` | `crypto-canvas=True` | `False` |
| `/markets/category/forex` | `forex-canvas=True` | `False` |
| `/markets/category/bist` | `bist-canvas=True` | `False` |
| `/markets/category/nasdaq` | `nasdaq-canvas=True` | `False` |
| `/markets/category/commodities` | `commodities-canvas=True` | `False` |

Regression giderildi: kategori sayfaları artık genel `MarketsPageClient` fallback'ine düşmüyor.

---

## Risk Assessment

| Risk | Seviye | Mitigasyon |
|------|--------|------------|
| Eksik widget (heatmap, bottom news) | P1 | Zone hide |
| BIST/NASDAQ sembol kümesi eksik | P1 | Küme genişletilebilir |
| Derived regime metinleri basit | P2 | Backend feed sonrası zenginleşir |
| Stale XAG/XAU fiyat | P2 | Mevcut runbook |

---

## Değişen Dosyalar

**Yeni (8):** `live-category/*` (7), `use-category-dashboard.ts`

**Güncellenen (5):**
- `crypto-category-page-client.tsx`
- `forex-category-page-client.tsx`
- `bist-category-page-client.tsx`
- `nasdaq-category-page-client.tsx`
- `commodities-category-page-client.tsx`

**Dokunulmayan:** APP, Supabase schema, RPC, Edge, mock fixtures, `MarketsPageClient`, home, signals, creators.

---

## MarketsPageClient Fallback (yeni davranış)

| Koşul | Sonuç |
|-------|-------|
| Mock true + no dashboard | Mock EmptyState |
| Mock false + loading | Category skeleton |
| Mock false + dashboard built | Özel canvas |
| Mock false + category empty, global OK | Kategori EmptyState |
| Mock false + global assets empty veya fetch error | `MarketsPageClient` |

---

*Deploy: `cd web && npx vercel deploy --prod --yes` — tamamlandı.*
