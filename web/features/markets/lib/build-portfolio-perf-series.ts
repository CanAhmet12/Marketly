export type PortfolioPerfMode = "live_snapshot" | "mock_demo";

export type PortfolioPerfChart = {
  series: number[];
  mode: PortfolioPerfMode;
  caption: string;
};

function expandAnchors(anchors: number[], pointCount = 12): number[] {
  if (anchors.length < 2) return anchors.length ? Array(pointCount).fill(anchors[0]!) : [];
  if (anchors.length === pointCount) return anchors;
  const out: number[] = [];
  const segments = anchors.length - 1;
  for (let i = 0; i < pointCount; i++) {
    const t = i / (pointCount - 1);
    const segFloat = t * segments;
    const segIdx = Math.min(segments - 1, Math.floor(segFloat));
    const localT = segFloat - segIdx;
    const a = anchors[segIdx]!;
    const b = anchors[segIdx + 1]!;
    out.push(a + (b - a) * localT);
  }
  return out;
}

/**
 * Canlı mod — dürüst anlık görünüm:
 * maliyet bazı → dünkü tahmini (günlük %) → güncel değer
 */
export function buildLivePortfolioPerfChart(
  investedCost: number,
  totalValue: number,
  weightedDailyChangePct: number,
): PortfolioPerfChart {
  const safeInvested = Math.max(0, investedCost);
  const safeCurrent = Math.max(0, totalValue);
  const yesterdayEstimate =
    weightedDailyChangePct !== 0
      ? safeCurrent / (1 + weightedDailyChangePct / 100)
      : safeCurrent;

  const anchors =
    Math.abs(safeInvested - safeCurrent) < 0.01
      ? [safeCurrent, safeCurrent]
      : [safeInvested, yesterdayEstimate, safeCurrent];

  const caption =
    weightedDailyChangePct !== 0
      ? `Maliyet bazından bugüne · dün → bugün tahmini ${weightedDailyChangePct >= 0 ? "+" : ""}${weightedDailyChangePct.toFixed(2)}% (ağırlıklı)`
      : "Maliyet bazından güncel değere — canlı anlık görünüm (geçmiş seri API bekliyor)";

  return {
    series: expandAnchors(anchors),
    mode: "live_snapshot",
    caption,
  };
}

/** Mock kağıt portföy — demo seri (etiketli) */
export function buildMockPortfolioPerfChart(demoSeries: number[]): PortfolioPerfChart {
  return {
    series: demoSeries,
    mode: "mock_demo",
    caption: "Kağıt portföy demo serisi — gerçek geçmiş performans değil",
  };
}
