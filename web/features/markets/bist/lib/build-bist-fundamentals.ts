import type {
  BistFundamentalsInsight,
  BistFundamentalsResponse,
  BistFundamentalsSlice,
} from "@/features/markets/bist/lib/bist-detail-types";
import { formatBistTickerPrice } from "@/features/markets/bist/lib/map-bist-tickers";
import {
  bistDisplayLabel,
  bistSectorLabel,
  isBistIndexSymbol,
  normalizeBistSymbol,
  yahooTickerFor,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { resolveBistScreenerSector } from "@/features/markets/bist/lib/bist-regime-utils";
import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";

type FundamentalsTemplate = {
  peRatio: string;
  peSub: string;
  pbRatio: string;
  pbSub: string;
  marketCap: string;
  marketCapSub: string;
  revenueGrowth: string;
  revenueSub: string;
  slices: BistFundamentalsSlice[];
  stats: BistFundamentalsResponse["stats"];
  insights: BistFundamentalsInsight[];
};

const BANK: FundamentalsTemplate = {
  peRatio: "5.8x",
  peSub: "Sektör ort. 6.2x",
  pbRatio: "0.92x",
  pbSub: "Defter değeri",
  marketCap: "—",
  marketCapSub: "Bankacılık",
  revenueGrowth: "+8%",
  revenueSub: "Net faiz marjı",
  slices: [
    { key: "stock", label: "Değerleme", pct: 34 },
    { key: "production", label: "Karlılık", pct: 44 },
    { key: "seasonal", label: "Sektör payı", pct: 22 },
  ],
  stats: {
    fiftyTwoWeekHigh: "—",
    fiftyTwoWeekLow: "—",
    dividendYield: "4.2%",
    analystTarget: "+6%",
  },
  insights: [
    {
      id: "bank-nim",
      title: "Net faiz marjı",
      detail: "Bankacılık hisseleri faiz döngüsü ve mevduat maliyetine duyarlı kalır.",
      metricLabel: "Tema",
      metricValue: "NIM",
      severity: "medium",
    },
  ],
};

const HOLDING: FundamentalsTemplate = {
  peRatio: "11.4x",
  peSub: "Holding ort.",
  pbRatio: "1.35x",
  pbSub: "Defter değeri",
  marketCap: "—",
  marketCapSub: "Çeşitlendirilmiş",
  revenueGrowth: "+11%",
  revenueSub: "Konsolide gelir",
  slices: [
    { key: "stock", label: "Değerleme", pct: 36 },
    { key: "production", label: "Büyüme", pct: 38 },
    { key: "seasonal", label: "Varlık karması", pct: 26 },
  ],
  stats: {
    fiftyTwoWeekHigh: "—",
    fiftyTwoWeekLow: "—",
    dividendYield: "2.8%",
    analystTarget: "+9%",
  },
  insights: [
    {
      id: "holding-nav",
      title: "NAV primi",
      detail: "Holding iskontosu ve iştirak değerlemeleri fiyatlamayı etkiler.",
      metricLabel: "NAV",
      metricValue: "İzleniyor",
      severity: "low",
    },
  ],
};

const INDEX: FundamentalsTemplate = {
  peRatio: "9.6x",
  peSub: "BIST 100 ağırlıklı F/K",
  pbRatio: "1.48x",
  pbSub: "Endeks PD/DD",
  marketCap: "—",
  marketCapSub: "Endeks",
  revenueGrowth: "+7%",
  revenueSub: "Bileşen ort.",
  slices: [
    { key: "stock", label: "Bankacılık", pct: 38 },
    { key: "production", label: "Sanayi", pct: 34 },
    { key: "seasonal", label: "Diğer", pct: 28 },
  ],
  stats: {
    fiftyTwoWeekHigh: "—",
    fiftyTwoWeekLow: "—",
    dividendYield: "2.1%",
    analystTarget: "—",
  },
  insights: [
    {
      id: "index-breadth",
      title: "Piyasa genişliği",
      detail: "BIST 100 bileşenlerinin çoğu endeks yönünü belirler.",
      metricLabel: "Genişlik",
      metricValue: "Orta",
      severity: "medium",
    },
    {
      id: "index-fx",
      title: "Kur duyarlılığı",
      detail: "İhracatçı sanayi ve bankacılık USD/TRY hareketlerine duyarlıdır.",
      metricLabel: "Makro",
      metricValue: "USD/TRY",
      severity: "high",
    },
  ],
};

const DEFAULT: FundamentalsTemplate = {
  peRatio: "14.2x",
  peSub: "BIST ort.",
  pbRatio: "1.72x",
  pbSub: "Defter değeri",
  marketCap: "—",
  marketCapSub: "Orta ölçek",
  revenueGrowth: "+10%",
  revenueSub: "Yıllık satış",
  slices: [
    { key: "stock", label: "Değerleme", pct: 40 },
    { key: "production", label: "Büyüme", pct: 36 },
    { key: "seasonal", label: "Sektör payı", pct: 24 },
  ],
  stats: {
    fiftyTwoWeekHigh: "—",
    fiftyTwoWeekLow: "—",
    dividendYield: "1.8%",
    analystTarget: "+7%",
  },
  insights: [
    {
      id: "stock-earnings",
      title: "Kazanç sezonu",
      detail: "BIST hisseleri çeyreklik sonuçlara ve kur beklentisine duyarlıdır.",
      metricLabel: "Sezon",
      metricValue: "Aktif",
      severity: "low",
    },
  ],
};

function templateFor(symbol: string): FundamentalsTemplate {
  if (isBistIndexSymbol(symbol)) return INDEX;
  const sector = resolveBistScreenerSector(symbol);
  if (sector === "bankacilik") return BANK;
  if (sector === "holding") return HOLDING;
  return DEFAULT;
}

export async function buildBistFundamentals(
  symbol: string,
  name?: string,
): Promise<BistFundamentalsResponse> {
  const sym = normalizeBistSymbol(symbol);
  const sector = resolveBistScreenerSector(sym);
  const tpl = templateFor(sym);
  const stats = { ...tpl.stats };

  const ticker = yahooTickerFor(sym);
  const daily = await fetchYahooChart(ticker, "1d", "1y");
  if (daily?.length) {
    const high = Math.max(...daily.map((k) => k.high));
    const low = Math.min(...daily.map((k) => k.low));
    stats.fiftyTwoWeekHigh = formatBistTickerPrice(high, sym);
    stats.fiftyTwoWeekLow = formatBistTickerPrice(low, sym);
  }

  return {
    symbol: sym,
    name: bistDisplayLabel(sym, name),
    sector,
    sectorLabel: bistSectorLabel(sym),
    source: stats.fiftyTwoWeekHigh !== "—" ? "yahoo" : "reference",
    updatedAt: Date.now(),
    peRatio: tpl.peRatio,
    peSub: tpl.peSub,
    pbRatio: tpl.pbRatio,
    pbSub: tpl.pbSub,
    marketCap: tpl.marketCap,
    marketCapSub: tpl.marketCapSub,
    revenueGrowth: tpl.revenueGrowth,
    revenueSub: tpl.revenueSub,
    slices: tpl.slices,
    stats,
    insights: tpl.insights,
  };
}
