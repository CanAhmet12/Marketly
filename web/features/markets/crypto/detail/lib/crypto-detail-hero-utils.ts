import type { AssetHeroIntel, AssetSignalSummary } from "@/features/markets/types/asset-intelligence";

export function formatCryptoDetailPrice(price: number): string {
  if (price >= 1_000_000) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: price >= 100 ? 2 : 4 });
  }
  if (price >= 0.0001) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }
  return price.toLocaleString("en-US", { maximumSignificantDigits: 4 });
}

export function consensusLabelTr(direction: AssetHeroIntel["consensusDirection"]): string {
  if (direction === "bullish") return "Yükseliş konsensüsü";
  if (direction === "bearish") return "Düşüş konsensüsü";
  return "Nötr konsensüs";
}

export type CryptoHeroIntelPill = {
  id: string;
  label: string;
  tone?: "default" | "bull" | "bear" | "gold" | "muted";
};

export function buildCryptoHeroIntelPills(
  heroIntel: AssetHeroIntel,
  signalSummary: AssetSignalSummary,
): CryptoHeroIntelPill[] {
  const pills: CryptoHeroIntelPill[] = [
    { id: "sentiment", label: heroIntel.sentimentPulse, tone: "gold" },
    {
      id: "consensus",
      label: consensusLabelTr(heroIntel.consensusDirection),
      tone:
        heroIntel.consensusDirection === "bullish"
          ? "bull"
          : heroIntel.consensusDirection === "bearish"
            ? "bear"
            : "muted",
    },
    { id: "volatility", label: heroIntel.volatilityLabel, tone: "default" },
    { id: "momentum", label: heroIntel.momentumLabel, tone: "default" },
    { id: "signals", label: heroIntel.signalActivityLabel, tone: "gold" },
  ];

  if (signalSummary.activeTotal > 0) {
    pills.push({
      id: "confidence",
      label: `Ort. güven %${signalSummary.avgConfidenceActive}`,
      tone: signalSummary.bullSharePct >= 55 ? "bull" : signalSummary.bullSharePct <= 45 ? "bear" : "muted",
    });
  }

  return pills.slice(0, 6);
}

export type CryptoHeroMetric = {
  key: string;
  label: string;
  value: string;
  tone?: "up" | "down" | "neutral" | "gold";
};

export function buildCryptoHeroMetrics(input: {
  marketCapLabel?: string | null;
  volume?: string | null;
  changePercent: number;
  signalSummary: AssetSignalSummary;
  formatChange: (v: number) => string;
}): CryptoHeroMetric[] {
  const { marketCapLabel, volume, changePercent, signalSummary, formatChange } = input;
  const changeTone = changePercent > 0 ? "up" : changePercent < 0 ? "down" : "neutral";

  return [
    { key: "mcap", label: "Piyasa Değeri", value: marketCapLabel ?? "—" },
    { key: "vol", label: "24s Hacim", value: volume ?? "—" },
    { key: "chg", label: "24s Değişim", value: formatChange(changePercent), tone: changeTone },
    {
      key: "sig",
      label: "Aktif Sinyal",
      value: String(signalSummary.activeTotal),
      tone: signalSummary.activeTotal > 0 ? "gold" : "neutral",
    },
    {
      key: "bull",
      label: "Bull Payı",
      value: `%${signalSummary.bullSharePct}`,
      tone: signalSummary.bullSharePct >= 55 ? "up" : signalSummary.bullSharePct <= 45 ? "down" : "neutral",
    },
    {
      key: "conf",
      label: "Ort. Güven",
      value: signalSummary.activeTotal > 0 ? `%${signalSummary.avgConfidenceActive}` : "—",
      tone: "gold",
    },
  ];
}
