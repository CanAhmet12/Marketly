export function dailyReturns(closes: readonly number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1]!;
    const curr = closes[i]!;
    if (prev > 0 && Number.isFinite(curr)) {
      out.push((curr - prev) / prev);
    }
  }
  return out;
}

export function pearsonCorrelation(a: readonly number[], b: readonly number[]): number | null {
  const len = Math.min(a.length, b.length);
  if (len < 5) return null;

  const xs = a.slice(-len);
  const ys = b.slice(-len);
  const meanX = xs.reduce((sum, v) => sum + v, 0) / len;
  const meanY = ys.reduce((sum, v) => sum + v, 0) / len;

  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < len; i++) {
    const dx = xs[i]! - meanX;
    const dy = ys[i]! - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  if (!Number.isFinite(den) || den === 0) return null;
  return num / den;
}

export function correlationStrength(value: number): "weak" | "moderate" | "strong" {
  const abs = Math.abs(value);
  if (abs >= 0.55) return "strong";
  if (abs >= 0.3) return "moderate";
  return "weak";
}

export function dxyCorrelationLabel(value: number, category: string): string {
  const metal = category === "degerli-metal";
  if (value <= -0.45) return metal ? "Klasik ters (USD↑)" : "Ters korelasyon";
  if (value >= 0.35) return "Pozitif korelasyon";
  if (value <= -0.15) return "Zayıf ters";
  return "Karışık / zayıf";
}

export function defaultDxyCorrelationForSymbol(symbol: string, category: string): number {
  const sym = symbol.trim().toUpperCase();
  if (sym.includes("XAU") || sym.includes("XAG")) return -0.54;
  if (category === "degerli-metal") return -0.48;
  if (category === "enerji") return -0.26;
  if (category === "tarim") return -0.12;
  return -0.2;
}
