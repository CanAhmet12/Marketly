import type { PortfolioHoldingLive } from "@/features/markets/fetch-portfolio-holdings";
import type { MarketAssetView } from "@/features/markets/types";
import type { PortfolioIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import { marketAssetCategoryLabelTr } from "@/features/markets/types/asset-intelligence";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

export type PortfolioLiveStats = {
  totalValue: number;
  investedCost: number;
  totalPnL: number;
  totalPnLPct: number;
  todayPnLPct: number;
  riskScore: number;
  riskLabel: string;
  perfSeries: number[];
};

function findAssetForHolding(h: PortfolioHoldingLive, assets: readonly MarketAssetView[]): MarketAssetView | undefined {
  const key = h.asset_id.trim().toUpperCase();
  return assets.find((a) => a.symbol.toUpperCase() === key || String(a.id).toUpperCase() === key);
}

function categoryLabel(cat: MarketAssetView["category"]): string {
  const m: Record<MarketAssetView["category"], string> = {
    crypto: "crypto",
    stocks: "stocks",
    forex: "forex",
    commodity: "commodity",
    index: "index",
  };
  return m[cat];
}

/** Live holdings + assets + signals → portföy zenginlik paketi. */
export function buildPortfolioIntelligenceFromLive(
  holdings: readonly PortfolioHoldingLive[],
  assets: readonly MarketAssetView[],
  signals: readonly SignalsFeedRow[],
): { bundle: PortfolioIntelligenceBundle; stats: PortfolioLiveStats } {
  const totalValue = holdings.reduce((s, h) => s + h.total_value, 0);
  const investedCost = holdings.reduce((s, h) => s + h.avg_cost * h.quantity, 0);
  const totalPnL = holdings.reduce((s, h) => s + h.pnl, 0);
  const totalPnLPct = investedCost > 0 ? (totalPnL / investedCost) * 100 : 0;

  const holdingRows = holdings.map((h) => {
    const asset = findAssetForHolding(h, assets);
    const weightPct = totalValue > 0 ? Math.round((h.total_value / totalValue) * 100) : 0;
    const sym = asset?.symbol ?? h.asset_id;
    const cat = asset?.category ?? "crypto";
    return {
      symbol: sym,
      name: asset?.name ?? sym,
      weightPct,
      category: categoryLabel(cat),
      contributionLabel: `${h.pnl >= 0 ? "+" : ""}${h.pnl_percent.toFixed(1)}%`,
      href: `/markets/${encodeURIComponent(sym)}`,
      _pnlPct: h.pnl_percent,
      _changePct: asset?.change_percent ?? 0,
      _price: h.current_price,
      _catEnum: cat,
    };
  });

  const sorted = [...holdingRows].sort((a, b) => b.weightPct - a.weightPct);
  const topWeight = sorted[0]?.weightPct ?? 0;

  const catWeights = new Map<string, number>();
  for (const h of holdingRows) {
    catWeights.set(h.category, (catWeights.get(h.category) ?? 0) + h.weightPct);
  }
  const sectorTop = [...catWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, pct]) => ({ label, pct }));

  const avgAbsChg =
    holdingRows.length > 0
      ? holdingRows.reduce((s, h) => s + Math.abs(h._changePct), 0) / holdingRows.length
      : 0;

  const riskScore = Math.min(100, Math.round(topWeight * 0.6 + avgAbsChg * 8));
  const riskLabel = riskScore > 70 ? "Yüksek" : riskScore > 45 ? "Orta" : "Düşük";

  const portfolioSymbols = holdingRows.map((h) => h.symbol);
  const portSet = new Set(portfolioSymbols.map((s) => s.toUpperCase()));
  const portSignals = signals.filter((r) => portSet.has(r.symbol.toUpperCase()) && r.is_active);

  const analystMap = new Map<string, { display: string; href: string; count: number }>();
  for (const r of portSignals) {
    const cur = analystMap.get(r.analyst.id) ?? {
      display: r.analyst.display,
      href: `/channel/${r.analyst.id}`,
      count: 0,
    };
    cur.count++;
    analystMap.set(r.analyst.id, cur);
  }

  const strategyMix = sectorTop.length
    ? sectorTop.map((s) => ({ label: marketAssetCategoryLabelTr(s.label as MarketAssetView["category"]), pct: s.pct }))
    : [{ label: "Dağılım", pct: 100 }];

  const headlineSentiment =
    totalPnLPct >= 5 ? "Pozitif momentum" : totalPnLPct <= -5 ? "Koruma modu" : "Dengeli portföy";

  const baseVal = totalValue - totalPnL;
  const perfSeries = Array.from({ length: 12 }, (_, i) => {
    const t = (i + 1) / 12;
    return baseVal + totalPnL * t;
  });

  const bundle: PortfolioIntelligenceBundle = {
    headlineSentiment,
    strategyMix,
    holdings: sorted.map(({ symbol, name, weightPct, category, contributionLabel, href }) => ({
      symbol,
      name,
      weightPct,
      category,
      contributionLabel,
      href,
    })),
    risk: {
      concentrationLabel: topWeight >= 40 ? "Yoğun" : topWeight >= 25 ? "Orta" : "Dağınık",
      topWeightPct: topWeight,
      sectorTop,
      macroSensitivity: avgAbsChg >= 1.5 ? "Yüksek" : "Orta",
      correlatedPairs: [],
      volCluster: avgAbsChg >= 2 ? "Genişleyen" : "Sakin",
      regimeAlignment: totalPnLPct >= 0 ? "Risk-on" : "Risk-off",
      momentumVsDefense: sectorTop[0]?.label === "crypto" ? "Momentum" : "Dengeli",
    },
    overlaps: {
      creatorConcentration: portSignals.length > 0 ? `${new Set(portSignals.map((r) => r.analyst.id)).size} analist` : "—",
      signalThemeTop: portSignals[0]?.symbol ?? "—",
      overlappingAnalysts: [...analystMap.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    },
    portfolioSymbols,
  };

  const stats: PortfolioLiveStats = {
    totalValue,
    investedCost,
    totalPnL,
    totalPnLPct,
    todayPnLPct: holdingRows.reduce((s, h) => s + h._changePct, 0) / (holdingRows.length || 1),
    riskScore,
    riskLabel,
    perfSeries,
  };

  return { bundle, stats };
}
