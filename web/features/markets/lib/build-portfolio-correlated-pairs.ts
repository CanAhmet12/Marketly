export type PortfolioCorrelatedPair = { a: string; b: string; note: string };

type CorrInput = {
  symbol: string;
  weightPct: number;
  category: string;
  changePct: number;
};

/** Canlı portföy — kategori + günlük hareket + ağırlık heuristiği */
export function buildPortfolioCorrelatedPairs(
  rows: readonly CorrInput[],
  maxPairs = 4,
): PortfolioCorrelatedPair[] {
  if (rows.length < 2) return [];

  const scored: (PortfolioCorrelatedPair & { score: number })[] = [];

  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i]!;
      const b = rows[j]!;
      let score = 0;
      const notes: string[] = [];

      if (a.category === b.category) {
        score += 2;
        const sameDir = (a.changePct >= 0) === (b.changePct >= 0);
        notes.push(sameDir ? "Aynı kategori · aynı yön" : "Aynı kategori · ayrışan");
        if (sameDir) score += 1;
      }

      const weightSum = a.weightPct + b.weightPct;
      if (weightSum >= 30) {
        score += 1.5;
        notes.push(`Yoğunluk %${weightSum}`);
      }

      if (Math.abs(a.changePct) >= 1.2 && Math.abs(b.changePct) >= 1.2) {
        score += 1;
        if (!notes.length) notes.push("Yüksek günlük hareket");
      }

      if (score >= 2) {
        scored.push({
          a: a.symbol,
          b: b.symbol,
          note: notes.join(" · ") || "Korelasyon ipucu",
          score,
        });
      }
    }
  }

  return scored
    .sort((x, y) => y.score - x.score)
    .slice(0, maxPairs)
    .map(({ a, b, note }) => ({ a, b, note }));
}

/** Pearson RPC çiftlerini heuristik sonuçla birleştir */
export function mergePortfolioCorrelatedPairs(
  heuristic: readonly PortfolioCorrelatedPair[],
  pearson: readonly PortfolioCorrelatedPair[],
  maxPairs = 4,
): PortfolioCorrelatedPair[] {
  const seen = new Set<string>();
  const out: PortfolioCorrelatedPair[] = [];
  const key = (p: PortfolioCorrelatedPair) => [p.a, p.b].sort().join("|");

  for (const p of pearson) {
    const k = key(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  for (const p of heuristic) {
    if (out.length >= maxPairs) break;
    const k = key(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out.slice(0, maxPairs);
}
