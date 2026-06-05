# MARKETS CATEGORY REGRESSION AUDIT REPORT

**Sprint:** Markets Category Page Regression Audit  
**Tarih:** 5 Haziran 2026  
**Canlı URL:** https://web-iota-three-b9kxiudy28.vercel.app  
**Kapsam:** Analiz only — kod/deploy/commit yok

---

## Executive Summary

Production'da tüm kategori rotaları (`/markets/category/*`) **aynı genel piyasa layout'unu** (`MarketsPageClient` → `markets-fluid-scope`) render ediyor. Özel kategori canvas'ları (`crypto-canvas`, `forex-canvas`, vb.) **canlıda hiç mount edilmiyor**.

**Kök neden (kesin, iki katmanlı):**

1. **Veri katmanı:** `SupabaseMarketsRepository.get*CategoryDashboard()` her kategori için **her zaman `null`** döner (`supabase-markets-repository.ts:139–157`). Canlı modda özel layout'un render koşulu (`if (data)`) hiçbir zaman sağlanmaz.

2. **UI katmanı (regression trigger):** Launch Preparation sprint'inde eklenen branch: `if (!data && !mockOn) return <MarketsPageClient initialSegment="…" />` — beş kategori client'ında (`*-category-page-client.tsx:24–26`). Bu branch, `data === null` iken özel tasarım yerine genel sayfayı gösterir.

**Production HTML kanıtı:** `/markets/category/crypto`, `/forex`, `/bist` → `markets-fluid-scope=True`, `crypto-canvas=False`, `forex-canvas=False`, `bist-canvas=False`, response boyutu ~76 KB (neredeyse identik).

**Önemli nüans:** Özel kategori tasarımları **production'da hiçbir zaman** (Launch Prep öncesi de) görünmemişti — mock repo dashboard döndürmediği için. Kullanıcının gördüğü “ayrı sayfalar” büyük olasılıkla **local dev + `NEXT_PUBLIC_USE_MOCK=true`**. Launch Prep sonrası fark: boş/teknik empty state yerine **canlı verili genel Markets sayfası** geliyor; bu da “hepsi aynı” algısını güçlendiriyor.

**Sorumlu değişiklik:** Commit `9c73ed4` (Launch Preparation Mega Sprint) — `web/` ilk commit'inde bu fallback zaten mevcut; `git log` bu dosyalarda yalnızca bu commit'i gösteriyor.

**Geri getirilebilir mi?** Evet — özel component'ler silinmedi. **WEB live mapper + eksik widget gizleme** ile mock false modda özel layout restore edilebilir; tam parity için bazı widget'lar backend gerektirir.

---

## Route Inventory

| Route | Page (`app/`) | Client | Mock True Component | Mock False Component | Current Behavior (Production) |
|-------|---------------|--------|---------------------|----------------------|-------------------------------|
| `/markets` | `markets/page.tsx` | — (redirect) | — | — | `redirect("/markets/category/crypto")` |
| `/markets/category/crypto` | `category/[category]/page.tsx` | `CryptoCategoryPageClient` | Özel `crypto-canvas` + 8 zone widget | `MarketsPageClient initialSegment="crypto"` | **Genel Markets** (`markets-fluid-scope`) |
| `/markets/category/forex` | aynı | `ForexCategoryPageClient` | Özel `forex-canvas` + 7 zone | `MarketsPageClient initialSegment="forex"` | **Genel Markets** (forex segment) |
| `/markets/category/bist` | aynı | `BistCategoryPageClient` | Özel `bist-canvas` + 7 zone | `MarketsPageClient initialSegment="stocks"` | **Genel Markets** (stocks segment) |
| `/markets/category/nasdaq` | aynı | `NasdaqCategoryPageClient` | Özel `nasdaq-canvas` + 7 zone | `MarketsPageClient initialSegment="stocks"` | **Genel Markets** (stocks segment) — **BIST ile aynı** |
| `/markets/category/commodities` | aynı | `CommoditiesCategoryPageClient` | Özel `commodities-canvas` + 7 zone | `MarketsPageClient initialSegment="commodity"` | **Genel Markets** (commodity segment) |
| `/markets/[symbol]` | `markets/[symbol]/page.tsx` | `MarketSymbolPageClient` | Tam mock bundle | `emptyAssetIntelligenceBundle` + live fiyat merge | **Özel asset detail** (`ad-canvas`) — kategori regression'dan **etkilenmiyor** |

### Route → page.tsx kanıtı

```22:35:web/app/(dashboard)/markets/category/[category]/page.tsx
  const client =
    category === "crypto" ? (
      <CryptoCategoryPageClient />
    ) : category === "bist" ? (
      <BistCategoryPageClient />
    ) : category === "forex" ? (
      <ForexCategoryPageClient />
    ) : category === "commodities" ? (
      <CommoditiesCategoryPageClient />
    ) : category === "nasdaq" ? (
      <NasdaqCategoryPageClient />
    ) : (
      <MarketsCategoryPageClient categorySlug={category} />
    );
```

Route dispatch doğru — sorun client içi conditional branch'te.

---

## Regression Source

### Birincil branch (Launch Prep — tüm kategoriler)

| Dosya | Satır | Branch | Canlıda çalışan path |
|-------|-------|--------|----------------------|
| `crypto-category-page-client.tsx` | 25–26 | `if (!data) { if (!mockOn) return <MarketsPageClient initialSegment="crypto" />` | `!data` true → fallback |
| `forex-category-page-client.tsx` | 24–25 | `initialSegment="forex"` | aynı |
| `bist-category-page-client.tsx` | 24–25 | `initialSegment="stocks"` | aynı |
| `nasdaq-category-page-client.tsx` | 24–25 | `initialSegment="stocks"` | aynı |
| `commodities-category-page-client.tsx` | 24–25 | `initialSegment="commodity"` | aynı |

Örnek (crypto):

```20:41:web/features/markets/crypto/crypto-category-page-client.tsx
export function CryptoCategoryPageClient() {
  const mockOn = isMockDataEnabled();
  const repo   = useMemo(() => getMarketsRepository(), []);
  const data   = useMemo(() => repo.getCryptoCategoryDashboard(), [repo]);

  if (!data) {
    if (!mockOn) return <MarketsPageClient initialSegment="crypto" />;
    // ... mock-only EmptyState ...
  }

  return (
    <div className="crypto-canvas min-h-screen w-full overflow-x-hidden">
```

### İkincil kök neden — veri her zaman null (canlı)

```139:157:web/features/markets/repository/supabase-markets-repository.ts
  getCryptoCategoryDashboard() {
    return null;
  }
  getBistCategoryDashboard() {
    return null;
  }
  getForexCategoryDashboard() {
    return null;
  }
  getCommoditiesCategoryDashboard() {
    return null;
  }
  getNasdaqCategoryDashboard() {
    return null;
  }
```

Mock karşılığı dolu dashboard döndürür (`mock-markets-repository.ts:149–204`).

### Repository seçimi (mock false)

```26:32:web/features/markets/repository/index.ts
export function getMarketsRepository(): MarketsRepository {
  if (isMockDataEnabled()) {
    mockSingleton ??= new MockMarketsRepository();
    return mockSingleton;
  }
  supabaseSingleton ??= new SupabaseMarketsRepository();
  return supabaseSingleton;
}
```

### Mock production'da kapalı

```24:27:web/mock/config.ts
export function isMockDataEnabled(): boolean {
  if (!isMockAllowedInCurrentEnv()) return false;
  return readMockEnvFlag();
}
```

`isMockAllowedInCurrentEnv()` → `NODE_ENV !== "production"` → Vercel'de **her zaman false**.

### MarketsPageClient fallback ne render eder?

```127:128:web/features/markets/markets-page-client.tsx
  return (
    <div className="markets-fluid-scope ms-page-wrapper min-w-0 overflow-x-hidden">
```

`initialSegment` yalnızca filtre state'ini etkiler; layout/hero/ticker/grid **tüm kategorilerde aynı shell**.

### Launch Prep öncesi davranış (canlı)

Aynı `!data` koşulunda (Supabase null) **EmptyState** gösteriliyordu — `NEXT_PUBLIC_USE_MOCK` mesajlı. Özel tasarım yine render edilmiyordu; yalnızca `crypto-canvas` wrapper içinde boş state vardı.

### İlgili ama kategori regression kaynağı olmayan dosyalar

| Dosya | Rol |
|-------|-----|
| `use-market-assets.ts` | `MarketsPageClient` fallback'in live asset kaynağı — kategori dashboard'a bağlı değil |
| `fetch-market-assets.ts` | `asset_prices` → `MarketAssetView[]` — mapper henüz category dashboard'a yok |
| `build-market-strip-items.ts` | Home editorial strip — kategori sayfalarıyla ilgisiz |
| `market-symbol-page-client.tsx` | Asset detail — `ad-canvas`; canlıda çalışıyor (production probe: `ad-canvas=True`) |

---

## Category-by-Category Findings

### Sınıflandırma özeti

| Kategori | Özel tasarım kodda? | Live bypass? | Mock-only data? | Live mapper mümkün? |
|----------|---------------------|--------------|-----------------|---------------------|
| Crypto | ✅ Var | ✅ Evet | Kısmen | **Kısmen** (A+B) |
| Forex | ✅ Var | ✅ Evet | Kısmen | **Kısmen** |
| BIST | ✅ Var | ✅ Evet | Çoğunlukla | **Kısmen** (sector/index backend) |
| Nasdaq | ✅ Var | ✅ Evet | Çoğunlukla | **Kısmen** (BIST ile aynı segment) |
| Commodities | ✅ Var | ✅ Evet | Kısmen | **Kısmen** |

### Crypto — özel widget envanteri (kodda mevcut)

| Zone | Component | Mock kaynak |
|------|-----------|-------------|
| Pulse | `CryptoPulseBar` | `CRYPTO_MOCK_PHASE1.pulse` |
| Regime + dominance | `CryptoRegimeDominance` | `phase1.regime` |
| Segment heatmap | `CryptoSegmentHeatmap` | `CRYPTO_MOCK_SEGMENTS` |
| BTC/ETH panels | `CryptoBtcEthPanels` | `phase1.btc/eth` |
| Movers | `CryptoTopMovers` | `CRYPTO_MOCK_MOVERS` |
| Bottom strip | `CryptoBottomStrip` | `CRYPTO_MOCK_BOTTOM_STRIP` |
| Signals | `CryptoSignalStrip` | `CRYPTO_MOCK_SIGNALS` |
| Screener | `CryptoScreenerBoard` | `CRYPTO_MOCK_SCREENER` |

**Durum:** Sınıf **1** — tasarım var, live bypass. Sınıf **3** — dashboard mock-only (`crypto/data/crypto-mock.ts`).

### Forex

| Zone | Component |
|------|-----------|
| Pulse | `ForexPulseBar` |
| Regime | `ForexMarketRegime` |
| Currency heatmap | `ForexCurrencyHeatmap` |
| Pair panels | `ForexPairPanels` (EUR/USD, GBP/USD) |
| Movers | `ForexTopMovers` |
| Bottom | `ForexBottomStrip` |
| Screener | `ForexScreener` |

**Durum:** Sınıf 1 + 3. Pair panels live'da EURUSD/GBPUSD varsa mapper ile mümkün; currency strength heatmap backend veya türetilmiş hesap gerekir.

### BIST

| Zone | Component |
|------|-----------|
| Pulse | `BistPulseBar` |
| Market state | `BistMarketState` |
| Sectors | `BistSectorPerformance` |
| Index panels | `BistIndexPanels` (XU100, BIST30) |
| Movers | `BistTopMovers` |
| Bottom | `BistBottomStrip` |
| Screener | `BistScreener` |

**Durum:** Sınıf 1 + 3 + 5. `mapMarketsCategorySlugToSegment("bist")` → `"stocks"` (`markets-category-slugs.ts:29–30`) — BIST ve NASDAQ fallback **aynı segment**.

### Nasdaq

Forex/BIST ile aynı pattern; `NasdaqIndexPanels` (NDX, SP500), `NasdaqSectorPerformance`, vb.

**Ek sorun:** BIST ile `initialSegment="stocks"` paylaşımı → production'da **iki URL identik filtre**.

### Commodities

`CommodityClassPayload`, altın/petrol panels, regime, screener — mock `commodities/data/`.

**Durum:** XAU/XAG gibi semboller `asset_prices`'ta varsa panel/screener kısmen restore edilebilir.

---

## Data Dependency Matrix

| Category | Needed Data (dashboard type) | Available Live Data | Missing | Live Mapper? |
|----------|------------------------------|---------------------|---------|--------------|
| **Crypto** | `CryptoCategoryDashboard`: dominance, fear/greed, altcoin index, segments, signals | `asset_prices` + `assets.category=crypto`, spark, change% | Dominance, F&G, stablecoin flow, segment taxonomy, signal strip | **Kısmen** — movers/screener/BTC-ETH panels evet; pulse/regime/signals hayır veya gizlenir |
| **Forex** | `ForexCategoryDashboard`: currency strength matrix, regime | Forex pairs in `asset_prices` (EURUSD, USDTRY, …) | Aggregated currency strength, session regime | **Kısmen** — pair panels + movers; heatmap/regime backend |
| **BIST** | `BistCategoryDashboard`: sector perf, XU100/BIST30 indices | `stocks` category assets (THYAO vb. — VPS kapsamına bağlı) | Sector grouping, official index levels, market open state | **Kısmen** — screener/movers; sectors/indices backend |
| **Nasdaq** | `NasdaqCategoryDashboard`: NDX/SPX panels, sector rotation | US stocks in DB (sınırlı) | Index composites, GICS sectors | **Kısmen** — BIST ile aynı kısıt |
| **Commodities** | `CommoditiesCategoryDashboard`: class breakdown, gold/oil panels | XAU, XAG, WTI vb. (bazı stale) | Class aggregates, regime narrative | **Kısmen** — anchor panels + screener |

### `fetch-market-assets.ts` shape vs dashboard shape

Live mapper `MarketAssetView[]` üretir:

```33:47:web/features/markets/fetch-market-assets.ts
      return {
        id, symbol, name, price, change_percent, volume, trend,
        category, marketCapLabel, sparkline,
        signal_active_count: 0, ...
      };
```

Category dashboard'lar **çok daha zengin** nested tipler bekler (`CryptoPulseMetrics`, `ForexCurrencyHeatmapPayload`, … — `markets-repository.ts:95–146`). Doğrudan drop-in değil; **`build*CategoryDashboardFromAssets()`** gibi dönüştürücü gerekir.

---

## Restore Strategy

### Genel prensip

Mock false modda:
- **Özel `*-canvas` layout her zaman render edilsin**
- İçerik: live mapper varsa gerçek veri; yoksa widget **gizlensin** veya minimal empty — mock fixture **asla** production'a sızmasın
- `MarketsPageClient` fallback yalnızca **Supabase yapılandırılmamış + asset listesi tamamen boş** edge case'te (Strateji D)

### Kategori önerileri

| Category | Strateji | Detay |
|----------|----------|-------|
| **Crypto** | **A + B** | Layout koru; `useMarketAssetsLive` + category filter → movers, screener, BTC/ETH panels; pulse/regime/F&G → hide veya “yakında” |
| **Forex** | **A + B** | Layout koru; pair panels + screener from live pairs; currency heatmap → hide until backend |
| **BIST** | **A + B + C** | Layout koru; ayrı `bist` segment filtresi (exchange/region metadata TODO — `markets-category-slugs.ts:15–17`); sector/index widgets hide |
| **Nasdaq** | **A + B + C** | BIST'ten ayrı segment veya US-only filter; NDX/SPX panels hide until index feed |
| **Commodities** | **A + B** | Layout koru; XAU/WTI panels from live; stale price UI filter (runbook STALE-001) |

### Strateji seçenekleri özeti

| Kod | Açıklama | Öneri |
|-----|----------|-------|
| A | Layout + live mapper | ✅ Birincil |
| B | Eksik widget gizle | ✅ Birincil |
| C | Bazı widget kaldır, ana layout kal | BIST/Nasdaq için |
| D | Fallback yalnızca veri yoksa | Mevcut fallback'i daralt |
| E | Mock-only işaretle | Fear/greed, sector indices için |

### Önerilen fix sprint (kod yok — plan)

1. `build-crypto-dashboard-from-assets.ts` (+ forex, bist, nasdaq, commodities)
2. `SupabaseMarketsRepository.get*CategoryDashboard()` → mapper çağrısı (veya client'ta hook)
3. Kategori client'lardan `MarketsPageClient` fallback kaldır / Daralt (Strateji D)
4. BIST/Nasdaq segment ayrımı (`exchange` veya symbol prefix)
5. Production smoke: `crypto-canvas` HTML marker + segment farkı

---

## Risk Assessment

| Risk | Seviye | Not |
|------|--------|-----|
| Kullanıcı yanlış sayfa görüyor (tüm kategoriler aynı) | **P0** | Mevcut production durumu |
| Mock data sızıntısı restore sırasında | **P0** | Mapper'da mock import yasak; `isMockDataEnabled` guard |
| BIST = NASDAQ aynı içerik | **P0** | `initialSegment="stocks"` paylaşımı |
| Yanlış live mapping (fiyat/change) | **P1** | Mapper unit test + spot check |
| Eksik widget → boş zone | **P1** | B+C ile kabul edilebilir |
| Performans (çift query) | **P1** | `market-assets-live` cache paylaşımı |
| Mobile layout özel canvas | **P2** | Mevcut CSS korunur |
| SEO/route değişmez | **P2** | URL aynı kalır |

---

## Recommended Fix Sprint

**Ad:** `MARKETS_CATEGORY_LIVE_RESTORE_SPRINT`

**Kapsam:** WEB only, ~5–8 dosya, yeni RPC/tablo yok

**Sıra:**
1. Live dashboard mapper'lar (crypto önce — en çok asset)
2. Supabase repo veya client hook entegrasyonu
3. Fallback branch revizyonu (D)
4. BIST/Nasdaq segment split
5. Vercel smoke: canvas class + içerik farkı
6. `LAUNCH_PREPARATION_MEGA_REPORT.md` CAT-001 maddesi güncelle

---

## Kesin Kararlar

### Neden tüm piyasa kategorileri tek genel sayfa gibi görünüyor?

1. `get*CategoryDashboard()` canlıda **null** → özel layout branch'ine girilmiyor.
2. Launch Prep **`MarketsPageClient` fallback** bu null durumda devreye giriyor.
3. `MarketsPageClient` tüm kategorilerde **aynı `markets-fluid-scope` shell** kullanıyor; yalnızca segment filtresi değişiyor.
4. BIST ve NASDAQ **aynı `stocks` segment** → production'da **bit-identical** deneyim.

### Hangi commit/sprint sebep oldu?

- **Doğrudan UI regression:** Launch Preparation Mega Sprint → commit **`9c73ed4`** (`feat(web): prepare Marketly web for closed beta launch`)
- **Yapısal kök neden (önceden de vardı):** `SupabaseMarketsRepository` category dashboard stub'ları — RPC Closure / WEB repository sprint; özel tasarım hiç live'a bağlanmadı

### Özel sayfalar mock false modda güvenli geri getirilebilir mi?

**Evet** — özel component'ler silinmedi (`crypto/components/*`, `forex/components/*`, vb.). Mock fixture'ları production path'ine bağlamadan, **live asset mapper + widget hide** ile restore mümkün.

### Backend gerekir mi, WEB mapper yeterli mi?

| Seviye | Yeterlilik |
|--------|------------|
| **MVP restore** (özel layout + screener/movers/anchor panels) | **WEB mapper yeterli** (`asset_prices` + `assets.category`) |
| **Full parity** (F&G, dominance, sector perf, currency heatmap, index composites) | **Backend veya ek feed gerekir** |

---

*Analiz tamamlandı — kod değişikliği yapılmadı.*
