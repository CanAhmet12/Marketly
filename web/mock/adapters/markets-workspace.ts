import type { MarketAssetView, MarketHeroPayload } from "@/features/markets/types";
import type { EconomicCalendarRow, MarketNewsRow, PortfolioStripRow } from "@/features/markets/repository/markets-repository";
import type { MarketSignalIntelligence } from "@/features/signals/intelligence/types";
import { parseVolumeRough } from "@/features/markets/lib/filter-assets";
import { buildSparklineSeries } from "@/features/markets/lib/sparkline-series";
import { inferMarketAssetCategory } from "@/lib/market-category";
import { getMockSignalsForAssetSymbol } from "@/mock/adapters/signals-source";
import { MOCK_PROFILE_BY_ID } from "@/mock/fixtures/profiles";

import { MOCK_TREND_MARKETS } from "../fixtures/markets";

const MARKET_CAP: Record<string, string> = {
  BTC: "2.05T",
  ETH: "298B",
  SOL: "68B",
  XU100: "820B TRY",
  THYAO: "182B TRY",
  ASELS: "64B TRY",
  GARAN: "412B TRY",
  USDTRY: "—",
  XAUUSD: "—",
  NDX: "—",
  SPX: "—",
  AAPL: "3.0T",
};

function moodFromAvgChange(avg: number): Pick<MarketHeroPayload, "headlineMood" | "moodLabel" | "moodDetail"> {
  if (avg > 0.35) {
    return {
      headlineMood: "risk_on",
      moodLabel: "Risk iştahı yüksek",
      moodDetail: "Genişleyen varlıklarda pozitif fiyatlama baskın.",
    };
  }
  if (avg < -0.2) {
    return {
      headlineMood: "risk_off",
      moodLabel: "Temkinli seans",
      moodDetail: "Kâr realizasyonu ve seçici alım profili.",
    };
  }
  return {
    headlineMood: "mixed",
    moodLabel: "Karışık tablo",
    moodDetail: "Sektörler arası ayrışma; volatilite kontrollü.",
  };
}

function fearGreedLabel(v: number): string {
  if (v <= 24) return "Aşırı korku";
  if (v <= 44) return "Korku";
  if (v <= 55) return "Nötr";
  if (v <= 74) return "Açgözlülük";
  return "Aşırı açgözlülük";
}

function stdev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = nums.reduce((a, b) => a + b, 0) / nums.length;
  return Math.sqrt(nums.reduce((s, x) => s + (x - m) ** 2, 0) / nums.length);
}

const THEME_BY_CATEGORY: Record<MarketAssetView["category"], string> = {
  crypto: "Kripto çağrı yoğunluğu",
  stocks: "BIST / hisse akışı",
  forex: "Kur koridoru",
  commodity: "Emtia defansı",
  index: "Endeks taşıyıcıları",
};

function signalIntelForSymbol(symbol: string): Pick<MarketAssetView, "signal_active_count" | "signal_bull_pct" | "signal_top_analyst"> {
  const sigs = getMockSignalsForAssetSymbol(symbol).filter((s) => s.is_active);
  if (sigs.length === 0) {
    return { signal_active_count: 0, signal_bull_pct: 50, signal_top_analyst: null };
  }
  const buy = sigs.filter((s) => s.direction === "BUY").length;
  const sell = sigs.filter((s) => s.direction === "SELL").length;
  const denom = Math.max(1, buy + sell);
  const bullPct = Math.round((buy / denom) * 100);
  const top = [...sigs].sort((a, b) => b.likes_count - a.likes_count)[0];
  const prof = top ? MOCK_PROFILE_BY_ID[top.creator_id] : undefined;
  const analyst = prof?.full_name ?? prof?.username ?? null;
  return { signal_active_count: sigs.length, signal_bull_pct: bullPct, signal_top_analyst: analyst };
}

export function buildMarketAssetViews(): MarketAssetView[] {
  return MOCK_TREND_MARKETS.map((m) => {
    const intel = signalIntelForSymbol(m.symbol);
    return {
      id: `mock-asset-${m.symbol.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      symbol: m.symbol,
      name: m.name,
      price: m.price,
      change_percent: m.change_percent,
      volume: m.volume,
      trend: m.trend,
      category: inferMarketAssetCategory(m.symbol),
      marketCapLabel: MARKET_CAP[m.symbol] ?? "—",
      sparkline: buildSparklineSeries(m.symbol, m.trend),
      ...intel,
    };
  });
}

/** Mock kahraman özeti — SSR ile hidrasyon aynı metni üretir (`Date.now()` kullanılmaz). */
const MOCK_MARKET_HERO_UPDATED_AT_ISO = "2026-05-16T12:00:00.000Z";

function totalVolumeLabel(assets: MarketAssetView[]): string {
  let sum = 0;
  for (const a of assets) {
    sum += parseVolumeRough(a.volume);
  }
  if (sum >= 1e9) return `${(sum / 1e9).toFixed(1)}B`;
  if (sum >= 1e6) return `${(sum / 1e6).toFixed(1)}M`;
  if (sum >= 1e3) return `${(sum / 1e3).toFixed(0)}K`;
  return sum.toFixed(0);
}

export function computeMarketHero(assets: MarketAssetView[], signalMarket?: MarketSignalIntelligence | null): MarketHeroPayload {
  const avg = assets.reduce((s, a) => s + a.change_percent, 0) / Math.max(1, assets.length);
  const mood = moodFromAvgChange(avg);
  const sorted = [...assets].sort((a, b) => b.change_percent - a.change_percent);
  const gainers = sorted.slice(0, 3).map((a) => ({ symbol: a.symbol, change_percent: a.change_percent, name: a.name }));
  const losers = [...assets].sort((a, b) => a.change_percent - b.change_percent).slice(0, 3).map((a) => ({
    symbol: a.symbol,
    change_percent: a.change_percent,
    name: a.name,
  }));
  const fg = 52 + Math.round(avg * 8);
  const clamped = Math.max(8, Math.min(92, fg));
  const adv = assets.filter((a) => a.change_percent > 0).length;
  const dec = assets.filter((a) => a.change_percent < 0).length;

  const sigma = stdev(assets.map((a) => a.change_percent));
  const volatilityBand: MarketHeroPayload["volatilityBand"] =
    sigma < 0.75 ? "low" : sigma < 1.35 ? "medium" : "high";
  const volatilityLabel =
    volatilityBand === "low" ? "Sıkı bant" : volatilityBand === "medium" ? "Normal volatilite" : "Genişleyen volatilite";

  const regimeSummary =
    mood.headlineMood === "risk_on" ? "Genişleme rejimi" : mood.headlineMood === "risk_off" ? "Defansif rejim" : "Seçici rejim";

  const signalActivityCount = assets.reduce((s, a) => s + a.signal_active_count, 0);
  const analysts = new Set(assets.map((a) => a.signal_top_analyst).filter((x): x is string => Boolean(x)));
  const activeAnalystCount = analysts.size || Math.min(12, Math.max(3, Math.round(assets.length * 0.55)));

  const catWeight = new Map<MarketAssetView["category"], number>();
  for (const a of assets) {
    catWeight.set(a.category, (catWeight.get(a.category) ?? 0) + a.signal_active_count + Math.abs(a.change_percent));
  }
  let bestCat: MarketAssetView["category"] = "crypto";
  let bestW = -1;
  for (const [c, w] of catWeight) {
    if (w > bestW) {
      bestW = w;
      bestCat = c;
    }
  }
  const strongestAssetTheme = assets.length === 0 ? "—" : THEME_BY_CATEGORY[bestCat] ?? "Çok kutup";

  const bias = signalMarket?.marketBias ?? "neutral";
  const biasWord = bias === "bullish" ? "alıcı" : bias === "bearish" ? "satıcı" : "dengeli";
  const sentimentPulseLabel = `${fearGreedLabel(clamped)} · Sinyal tarafı ${biasWord}`;

  return {
    ...mood,
    regimeSummary,
    btcDominance: "58.2%",
    fearGreed: { value: clamped, label: fearGreedLabel(clamped) },
    openMarketsLabel: "Kripto · Hisseler · Endeks · Döviz · Emtia",
    topGainers: gainers,
    topLosers: losers,
    totalVolumeLabel: totalVolumeLabel(assets),
    advancers: adv,
    decliners: dec,
    volatilityBand,
    volatilityLabel,
    signalActivityCount,
    activeAnalystCount,
    strongestAssetTheme,
    sentimentPulseLabel,
    updatedAt: MOCK_MARKET_HERO_UPDATED_AT_ISO,
  };
}

export function getMockEconomicCalendarExtra(): EconomicCalendarRow[] {
  return [
    { id: "ec-5",  at: "2026-05-12T09:00:00Z", country: "EU", title: "ZEW Ekonomik Güven",          impact: 2, affectedSymbols: ["EURUSD"] },
    { id: "ec-6",  at: "2026-05-12T12:30:00Z", country: "US", title: "Çekirdek CPI (Aylık)",         impact: 3, affectedSymbols: ["SPX","NDX","DXY","BTC"] },
    { id: "ec-7",  at: "2026-05-13T07:00:00Z", country: "TR", title: "TÜFE Enflasyon (Yıllık)",      impact: 3, affectedSymbols: ["XU100","USDTRY","THYAO"] },
    { id: "ec-8",  at: "2026-05-13T09:00:00Z", country: "EU", title: "Sanayi Üretimi (Yıllık)",      impact: 2, affectedSymbols: ["EURUSD"] },
    { id: "ec-9",  at: "2026-05-13T15:00:00Z", country: "US", title: "Fed Başkanı Powell Konuşması", impact: 3, affectedSymbols: ["SPX","DXY","BTC","XAUUSD"] },
    { id: "ec-10", at: "2026-05-14T15:30:00Z", country: "US", title: "Perakende Satışlar (Aylık)",   impact: 2, affectedSymbols: ["SPX","USDTRY"] },
    { id: "ec-11", at: "2026-05-15T07:00:00Z", country: "UK", title: "GSYİH Büyüme (Çeyreklik)",     impact: 3, affectedSymbols: ["GBPUSD"] },
    { id: "ec-12", at: "2026-05-15T12:30:00Z", country: "US", title: "İşsizlik Talepleri",           impact: 2, affectedSymbols: ["SPX","NDX"] },
    { id: "ec-13", at: "2026-05-16T09:00:00Z", country: "EU", title: "Çekirdek HICP Enflasyon",      impact: 3, affectedSymbols: ["EURUSD","XAUUSD"] },
    { id: "ec-14", at: "2026-05-16T12:30:00Z", country: "CA", title: "İstihdam Değişimi",            impact: 2, affectedSymbols: ["USDCAD"] },
    { id: "ec-15", at: "2026-05-16T18:00:00Z", country: "US", title: "FOMC Faiz Kararı",             impact: 3, affectedSymbols: ["SPX","NDX","DXY","BTC","XAUUSD","XU100"] },
  ];
}

export function getMockEconomicCalendar(): EconomicCalendarRow[] {
  return [
    {
      id: "ec-1",
      at: "2026-05-14T13:30:00.000Z",
      country: "US",
      title: "ÜFE (Üretici Fiyat Endeksi)",
      impact: 3,
      affectedSymbols: ["NDX", "SPX", "BTC"],
      volatilityHint: "Endeks + risk varlıklarında geniş bant",
    },
    {
      id: "ec-2",
      at: "2026-05-14T15:00:00.000Z",
      country: "EU",
      title: "ECB konuşması",
      impact: 2,
      affectedSymbols: ["USDTRY", "XAUUSD"],
      volatilityHint: "Kur ve emtiada kısa süreli ivme",
    },
    {
      id: "ec-3",
      at: "2026-05-15T12:30:00.000Z",
      country: "TR",
      title: "İşsizlik oranı",
      impact: 2,
      affectedSymbols: ["XU100", "USDTRY", "THYAO"],
      volatilityHint: "BIST bankacılık + USDTRY hassas",
    },
    {
      id: "ec-4",
      at: "2026-05-15T16:00:00.000Z",
      country: "US",
      title: "Michigan güven",
      impact: 1,
      affectedSymbols: ["SPX", "NDX"],
      volatilityHint: "Hafif risk iştahı kayması",
    },
  ];
}

export function getMockMarketNews(): MarketNewsRow[] {
  return [
    /* --- YÜKSEK ETKİ (3) --- */
    {
      id: "nw-f1",
      symbol: "XU100",
      headline: "Fed Faiz Kararı: Piyasalar Çalkantılı Seyrediyor",
      source: "Reuters",
      minutesAgo: 12,
      impactTier: 3,
      affectedSymbols: ["XU100", "USDTRY", "BTC"],
    },
    {
      id: "nw-f2",
      symbol: "USDTRY",
      headline: "Dolar Endeksi 5 Yılın En Yüksek Seviyesinde",
      source: "Bloomberg",
      minutesAgo: 38,
      impactTier: 3,
      affectedSymbols: ["USDTRY", "XU100", "THYAO"],
    },
    {
      id: "nw-f3",
      symbol: "XU100",
      headline: "Küresel Piyasalar Jeopolitik Gerginlikle Sert Düştü",
      source: "AA",
      minutesAgo: 94,
      impactTier: 3,
      affectedSymbols: ["XU100", "THYAO", "GARAN"],
    },
    /* --- ORTA ETKİ (2) --- */
    {
      id: "nw-1",
      symbol: "BTC",
      headline: "Bitcoin ETF Net Girişleri Rekor Kırdı",
      source: "CoinDesk",
      minutesAgo: 28,
      impactTier: 2,
      affectedSymbols: ["BTC", "ETH", "SOL"],
    },
    {
      id: "nw-2",
      symbol: "GARAN",
      headline: "GARAN Güçlü Bilanço ile Beklentileri Aştı",
      source: "Bloomberg HT",
      minutesAgo: 45,
      impactTier: 2,
      affectedSymbols: ["GARAN", "XU100"],
    },
    {
      id: "nw-5",
      symbol: "THYAO",
      headline: "THYAO Güçlü Yolcu Rakamlarıyla Tahminleri Geçti",
      source: "AA",
      minutesAgo: 66,
      impactTier: 2,
      affectedSymbols: ["THYAO", "XU100"],
    },
    {
      id: "nw-6",
      symbol: "XU100",
      headline: "Enflasyon Verisi Beklentilerin Üzerinde Geldi",
      source: "Bloomberg",
      minutesAgo: 110,
      impactTier: 2,
      affectedSymbols: ["XU100", "USDTRY"],
    },
    {
      id: "nw-7",
      symbol: "BRENT",
      headline: "Petrol Fiyatları Orta Doğu'daki Gerilimle Yükseliyor",
      source: "Energy Monitor",
      minutesAgo: 52,
      impactTier: 2,
      affectedSymbols: ["BRENT"],
    },
    /* --- DÜŞÜK ETKİ (1) --- */
    {
      id: "nw-3",
      symbol: "ETH",
      headline: "Ethereum Layer-2 Çözümlerinde TVL Yeni Zirvede",
      source: "The Block",
      minutesAgo: 75,
      impactTier: 1,
      affectedSymbols: ["ETH", "SOL"],
    },
    {
      id: "nw-4",
      symbol: "SOL",
      headline: "Solana Günlük İşlem Hacmi 50 Milyonu Aştı",
      source: "CoinGecko",
      minutesAgo: 88,
      impactTier: 1,
      affectedSymbols: ["SOL", "ETH"],
    },
    {
      id: "nw-8",
      symbol: "AKBNK",
      headline: "AKBNK Net Kâr Beklentileri Revize Edildi",
      source: "Bloomberg HT",
      minutesAgo: 135,
      impactTier: 1,
      affectedSymbols: ["AKBNK", "XU100"],
    },
    {
      id: "nw-9",
      symbol: "AVAX",
      headline: "Avalanche Ağı Yeni Zincir Güncellemesini Duyurdu",
      source: "CoinDesk",
      minutesAgo: 155,
      impactTier: 1,
      affectedSymbols: ["AVAX", "BTC"],
    },
    {
      id: "nw-10",
      symbol: "AAPL",
      headline: "Apple Yeni AI Özelliklerini WWDC'de Tanıttı",
      source: "CNBC",
      minutesAgo: 180,
      impactTier: 1,
      affectedSymbols: ["AAPL"],
    },
    {
      id: "nw-11",
      symbol: "XU100",
      headline: "Merkez Bankası PPK Öncesi Piyasalar Temkinli",
      source: "AA",
      minutesAgo: 210,
      impactTier: 2,
      affectedSymbols: ["XU100", "USDTRY"],
    },
    {
      id: "nw-12",
      symbol: "BNB",
      headline: "BNB Zinciri Yükseltme Sonrası Rekor İşlem Hacmi",
      source: "The Block",
      minutesAgo: 240,
      impactTier: 1,
      affectedSymbols: ["BNB", "BTC"],
    },
  ];
}

export function getMockPortfolioStrip(): PortfolioStripRow[] {
  return [
    { label: "Gün PnL", value: "+0.42%", hint: "mock" },
    { label: "Açık pozisyon", value: "6", hint: "kağıt portföy" },
    { label: "Beta (60g)", value: "1.08", hint: "BTC korelasyonu" },
  ];
}
