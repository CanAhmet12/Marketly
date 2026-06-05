/** R/R etiketinden normalize risk/ödül yüzdeleri (ör. "1 : 2.5"). */
export function parseRiskRewardBar(label: string | null): { riskPct: number; rewardPct: number } | null {
  if (!label) return null;
  const m = label.match(/1\s*:\s*([\d.]+)/);
  if (!m) return null;
  const reward = Number(m[1]);
  if (!Number.isFinite(reward) || reward <= 0) return null;
  const total = 1 + reward;
  return { riskPct: (1 / total) * 100, rewardPct: (reward / total) * 100 };
}
