/**
 * Loughran-McDonald tarzı finans sözlüğü — Aşama 1 başlık sentiment
 * Aşama 2: Edge Function + FinBERT (gelecek sprint)
 */

const POSITIVE_FINANCE_WORDS = new Set([
  "rally", "surge", "gain", "bull", "record", "growth", "beat", "outperform", "rebound",
  "soar", "jump", "rise", "upgrade", "profit", "strong", "boom", "recovery", "breakout",
  "yukselis", "yukseldi", "artis", "rekor", "guclu", "pozitif", "kazanc",
]);

const NEGATIVE_FINANCE_WORDS = new Set([
  "crash", "fall", "drop", "bear", "loss", "plunge", "selloff", "miss", "underperform",
  "slump", "decline", "downgrade", "weak", "fear", "risk", "crisis", "default", "cut",
  "dusus", "dustu", "cokus", "kayip", "negatif", "zayif", "kriz", "baskı",
]);

const NEGATORS = new Set(["not", "no", "degil", "yok"]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöçâîû\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** -1 … +1 aralığında başlık sentiment skoru */
export function scoreFinanceHeadline(headline: string): number {
  const tokens = tokenize(headline);
  if (!tokens.length) return 0;

  let pos = 0;
  let neg = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    const prev = tokens[i - 1];
    const negated = prev != null && NEGATORS.has(prev);

    if (POSITIVE_FINANCE_WORDS.has(t)) pos += negated ? -0.6 : 1;
    if (NEGATIVE_FINANCE_WORDS.has(t)) neg += negated ? -0.6 : 1;
  }

  const raw = pos - neg;
  if (raw === 0) return 0;
  return Math.max(-1, Math.min(1, raw / Math.max(pos + neg, 1)));
}

export function sentimentLabel(score: number): "bullish" | "bearish" | "neutral" {
  if (score >= 0.25) return "bullish";
  if (score <= -0.25) return "bearish";
  return "neutral";
}
