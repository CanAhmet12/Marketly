import { formatCryptoDetailPrice } from "@/features/markets/crypto/detail/lib/crypto-detail-hero-utils";
import { resolveAnalystBullBear } from "@/features/markets/crypto/detail/lib/resolve-analyst-bull-bear";
import type {
  CryptoSignalHubCommandMetric,
  CryptoSignalHubPayload,
  CryptoSignalHubRow,
} from "@/features/markets/crypto/detail/lib/crypto-signal-hub-types";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { SignalStrategy, SignalsFeedRow } from "@/features/signals/repository/types";

function strategyLabel(s: SignalStrategy): string {
  const m: Record<SignalStrategy, string> = { scalp: "Scalp", swing: "Swing", long: "Uzun vade" };
  return m[s];
}

function formatPrice(n: number | null): string {
  if (n == null) return "—";
  return formatCryptoDetailPrice(n);
}

function mapRow(row: SignalsFeedRow): CryptoSignalHubRow {
  const rr =
    row.riskRewardLabel ??
    (row.risk_reward_ratio != null ? `${row.risk_reward_ratio.toFixed(1)}R` : "—");

  return {
    id: row.id,
    href: row.detail_href || `/signals?signal=${encodeURIComponent(row.id)}`,
    analystDisplay: row.analyst.display,
    analystAvatar: row.analyst.avatar_url,
    analystVerified: row.analyst.verified,
    direction: row.direction,
    entryLabel: formatPrice(row.entry_price),
    targetLabel: formatPrice(row.target_price),
    stopLabel: formatPrice(row.stop_loss),
    rrLabel: rr,
    confidence: row.confidence,
    thesisGrade: row.thesis_grade,
    timeframe: row.timeframe_category || "—",
    strategy: strategyLabel(row.strategy),
    sparkline: row.sparkline ?? [],
    isActive: row.is_active,
    copies24h: row.community_copies_24h,
  };
}

function buildCommandMetrics(bundle: AssetIntelligenceBundle): CryptoSignalHubCommandMetric[] {
  const { signalSummary, signalHub, symbolConsensus } = bundle;
  return [
    { key: "active", label: "Aktif", value: String(signalSummary.activeTotal), tone: "gold" },
    { key: "buy", label: "BUY", value: String(signalSummary.activeBuy), tone: "bull" },
    { key: "sell", label: "SELL", value: String(signalSummary.activeSell), tone: "bear" },
    {
      key: "agree",
      label: "Analist uyumu",
      value: `%${symbolConsensus.agreementPct}`,
      tone: symbolConsensus.agreementPct >= 70 ? "gold" : "default",
    },
    {
      key: "conf",
      label: "Ort. güven",
      value: signalSummary.activeTotal > 0 ? `%${signalSummary.avgConfidenceActive}` : "—",
    },
    {
      key: "debate",
      label: "Tartışma",
      value: String(signalHub.discussionIntensity),
      hint: `${signalHub.debateThreads} thread`,
      tone: signalHub.discussionIntensity >= 60 ? "gold" : "muted",
    },
  ];
}

export function buildCryptoSignalHub(bundle: AssetIntelligenceBundle): CryptoSignalHubPayload {
  const { bullPct, bearPct } = resolveAnalystBullBear(bundle);
  const activeFirst = [...bundle.signals].sort(
    (a, b) => Number(b.is_active) - Number(a.is_active) || b.confidence - a.confidence,
  );

  return {
    symbol: bundle.asset.symbol,
    bullPct,
    bearPct,
    agreementPct: bundle.symbolConsensus.agreementPct,
    confidenceAvg: bundle.symbolConsensus.confidenceAvg,
    activeAnalysts: bundle.symbolConsensus.activeAnalysts,
    conflictingGroups: bundle.symbolConsensus.conflictingThesisGroups,
    splitSentiment: bundle.symbolConsensus.splitSentiment,
    thesisVarianceLabel: bundle.signalHub.thesisVarianceLabel,
    commandMetrics: buildCommandMetrics(bundle),
    confidenceBins: bundle.confidenceBins,
    topAnalysts: bundle.topAnalysts.slice(0, 4),
    rows: activeFirst.slice(0, 8).map(mapRow),
    signalHub: bundle.signalHub,
    signalSummary: bundle.signalSummary,
    symbolConsensus: bundle.symbolConsensus,
  };
}
