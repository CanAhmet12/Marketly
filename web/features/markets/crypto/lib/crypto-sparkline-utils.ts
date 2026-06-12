/** Kripto canvas — sparkline ve momentum yardımcıları */

export function trendFromSeries(series: number[]): "up" | "down" | "flat" {
  if (series.length < 2) return "flat";
  const last = series[series.length - 1]!;
  const first = series[0]!;
  if (last > first) return "up";
  if (last < first) return "down";
  return "flat";
}

/** Veri yokken 24s değişimden basit eğilim üret */
export function sparkFromChange(change24h: number, points = 7): number[] {
  const end = 100 + change24h;
  const start = 100;
  if (points < 2) return [start, end];
  return Array.from({ length: points }, (_, i) => start + ((end - start) * i) / (points - 1));
}

export function resolveSegmentSparkline(change24h: number, sparkline?: number[]): number[] {
  if (sparkline && sparkline.length > 1) return sparkline;
  return sparkFromChange(change24h);
}

type MomentumCopy = { label: string; sub: string };

export function regimeMomentum(
  regime: "bull" | "bear" | "chop",
  riskBias: number,
  momentumLabel?: string,
  momentumSubLabel?: string,
): MomentumCopy {
  if (momentumLabel) {
    return { label: momentumLabel, sub: momentumSubLabel ?? "—" };
  }
  if (regime === "bull") {
    return riskBias >= 58
      ? { label: "Güçlü", sub: "Yükseliş" }
      : { label: "Ilımlı", sub: "Yükseliş" };
  }
  if (regime === "bear") {
    return riskBias <= 42
      ? { label: "Güçlü", sub: "Düşüş" }
      : { label: "Ilımlı", sub: "Düşüş" };
  }
  return { label: "Nötr", sub: "Yatay" };
}

export function signedPct(v: number): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}
