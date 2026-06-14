import type {
  NasdaqFundamentalsInsight,
  NasdaqFundamentalsResponse,
  NasdaqFundamentalsSlice,
} from "@/features/markets/nasdaq/lib/nasdaq-detail-types";
import { formatNasdaqTickerPrice } from "@/features/markets/nasdaq/lib/map-nasdaq-tickers";
import {
  nasdaqNameFor,
  nasdaqSectorLabel,
  resolveNasdaqSector,
  yahooTickerFor,
} from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";

type FundamentalsTemplate = {
  peRatio: string;
  peSub: string;
  eps: string;
  epsSub: string;
  marketCap: string;
  marketCapSub: string;
  revenueGrowth: string;
  revenueSub: string;
  slices: NasdaqFundamentalsSlice[];
  stats: NasdaqFundamentalsResponse["stats"];
  insights: NasdaqFundamentalsInsight[];
};

const TECH: FundamentalsTemplate = {
  peRatio: "28.4x",
  peSub: "Sektör ort. 26x",
  eps: "$6.84",
  epsSub: "TTM EPS",
  marketCap: "$2.8T",
  marketCapSub: "Mega-cap",
  revenueGrowth: "+12%",
  revenueSub: "Yıllık gelir",
  slices: [
    { key: "stock", label: "Değerleme", pct: 38 },
    { key: "production", label: "Büyüme", pct: 42 },
    { key: "seasonal", label: "Sektör payı", pct: 20 },
  ],
  stats: {
    fiftyTwoWeekHigh: "—",
    fiftyTwoWeekLow: "—",
    dividendYield: "0.4%",
    analystTarget: "+8%",
  },
  insights: [
    {
      id: "tech-earnings",
      title: "Kazanç sezonu",
      detail: "Mega-cap teknoloji hisseleri NDX ağırlığının büyük kısmını oluşturur.",
      metricLabel: "NDX payı",
      metricValue: "Yüksek",
      severity: "medium",
    },
    {
      id: "tech-ai",
      title: "AI yatırım döngüsü",
      detail: "Veri merkezi CAPEX büyümesi yarı iletken ve bulut gelirini destekliyor.",
      metricLabel: "Tema",
      metricValue: "AI",
      severity: "low",
    },
  ],
};

const SEMICONDUCTOR: FundamentalsTemplate = {
  peRatio: "42.6x",
  peSub: "Döngüsel prim",
  eps: "$4.12",
  epsSub: "TTM EPS",
  marketCap: "$1.1T",
  marketCapSub: "Lider çip",
  revenueGrowth: "+22%",
  revenueSub: "Yıllık gelir",
  slices: [
    { key: "stock", label: "Değerleme", pct: 34 },
    { key: "production", label: "Büyüme", pct: 46 },
    { key: "seasonal", label: "Sektör payı", pct: 20 },
  ],
  stats: {
    fiftyTwoWeekHigh: "—",
    fiftyTwoWeekLow: "—",
    dividendYield: "0.2%",
    analystTarget: "+12%",
  },
  insights: [
    {
      id: "semi-cycle",
      title: "Yarı iletken döngüsü",
      detail: "GPU talebi AI altyapısı ile döngüsel dip riskini hafifletiyor.",
      metricLabel: "Talep",
      metricValue: "Güçlü",
      severity: "medium",
    },
  ],
};

const INDEX: FundamentalsTemplate = {
  peRatio: "32.1x",
  peSub: "NDX ağırlıklı F/K",
  eps: "—",
  epsSub: "Endeks birimi",
  marketCap: "—",
  marketCapSub: "Endeks",
  revenueGrowth: "+14%",
  revenueSub: "Bileşen ort.",
  slices: [
    { key: "stock", label: "Teknoloji", pct: 52 },
    { key: "production", label: "Büyüme", pct: 32 },
    { key: "seasonal", label: "Diğer", pct: 16 },
  ],
  stats: {
    fiftyTwoWeekHigh: "—",
    fiftyTwoWeekLow: "—",
    dividendYield: "0.6%",
    analystTarget: "—",
  },
  insights: [
    {
      id: "ndx-weight",
      title: "Mega-cap yoğunlaşma",
      detail: "Top 7 hisse NDX ağırlığının büyük bölümünü taşır.",
      metricLabel: "Konsantrasyon",
      metricValue: "Yüksek",
      severity: "high",
    },
    {
      id: "fed-beta",
      title: "Faiz duyarlılığı",
      detail: "Büyüme ağırlıklı endeksler faiz beklentisine duyarlı kalır.",
      metricLabel: "Makro",
      metricValue: "Faiz",
      severity: "medium",
    },
  ],
};

function templateFor(sector: string): FundamentalsTemplate {
  if (sector === "index") return INDEX;
  if (sector === "semiconductor") return SEMICONDUCTOR;
  return TECH;
}

export async function buildNasdaqFundamentals(
  symbol: string,
  name?: string,
): Promise<NasdaqFundamentalsResponse> {
  const sym = symbol.trim().toUpperCase();
  const sector = resolveNasdaqSector(sym);
  const tpl = templateFor(sector);
  const stats = { ...tpl.stats };

  const ticker = yahooTickerFor(sym);
  if (ticker) {
    const daily = await fetchYahooChart(ticker, "1d", "1y");
    if (daily?.length) {
      const high = Math.max(...daily.map((k) => k.high));
      const low = Math.min(...daily.map((k) => k.low));
      stats.fiftyTwoWeekHigh = formatNasdaqTickerPrice(high, sym);
      stats.fiftyTwoWeekLow = formatNasdaqTickerPrice(low, sym);
    }
  }

  return {
    symbol: sym,
    name: nasdaqNameFor(sym, name),
    sector,
    sectorLabel: nasdaqSectorLabel(sym),
    source: stats.fiftyTwoWeekHigh !== "—" ? "yahoo" : "reference",
    updatedAt: Date.now(),
    peRatio: tpl.peRatio,
    peSub: tpl.peSub,
    eps: tpl.eps,
    epsSub: tpl.epsSub,
    marketCap: tpl.marketCap,
    marketCapSub: tpl.marketCapSub,
    revenueGrowth: tpl.revenueGrowth,
    revenueSub: tpl.revenueSub,
    slices: tpl.slices,
    stats,
    insights: tpl.insights,
  };
}
