/** Günlük getiri serisi üzerinden beta (vs benchmark). */
export function pearsonCorrelation(a: number[], b: number[]): number | null {
  if (a.length !== b.length || a.length < 5) return null;
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i]! - meanA;
    const db = b[i]! - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  if (den <= 0) return null;
  return num / den;
}

export function dailyReturns(closes: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1]!;
    const cur = closes[i]!;
    if (prev > 0) out.push((cur - prev) / prev);
  }
  return out;
}

export function computeBeta(stockCloses: number[], benchmarkCloses: number[]): number | null {
  const stockRet = dailyReturns(stockCloses);
  const benchRet = dailyReturns(benchmarkCloses);
  const len = Math.min(stockRet.length, benchRet.length);
  if (len < 10) return null;
  const s = stockRet.slice(-len);
  const b = benchRet.slice(-len);
  const corr = pearsonCorrelation(s, b);
  if (corr == null) return null;
  const stdS = Math.sqrt(s.reduce((acc, v) => acc + v * v, 0) / len);
  const stdB = Math.sqrt(b.reduce((acc, v) => acc + v * v, 0) / len);
  if (stdB <= 0) return null;
  return (corr * stdS) / stdB;
}

export function betaLabel(beta: number): string {
  if (beta >= 1.35) return "Yüksek beta";
  if (beta >= 0.85) return "Piyasa beta";
  return "Düşük beta";
}

export function correlationStrength(corr: number): "weak" | "moderate" | "strong" {
  const abs = Math.abs(corr);
  if (abs >= 0.55) return "strong";
  if (abs >= 0.3) return "moderate";
  return "weak";
}

export function spxCorrelationLabel(corr: number): string {
  if (corr >= 0.75) return "SPX ile güçlü pozitif";
  if (corr >= 0.45) return "SPX ile pozitif";
  if (corr <= -0.25) return "SPX ile negatif";
  return "SPX ile zayıf";
}

export function defaultSpxCorrelationForSymbol(symbol: string, isIndex: boolean): number {
  if (isIndex) return 0.92;
  const sym = symbol.trim().toUpperCase();
  if (["NVDA", "AMD", "TSLA"].includes(sym)) return 0.68;
  if (["COST", "PEP"].includes(sym)) return 0.42;
  return 0.58;
}
