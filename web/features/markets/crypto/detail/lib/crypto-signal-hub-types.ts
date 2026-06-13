import type { AssetSignalConfidenceBins, AssetSignalHubDetail, AssetSignalSummary, AssetTopAnalyst } from "@/features/markets/types/asset-intelligence";
import type { SymbolConsensusIntel } from "@/features/signals/intelligence/types";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

export type CryptoSignalHubCommandMetric = {
  key: string;
  label: string;
  value: string;
  tone?: "default" | "bull" | "bear" | "gold" | "muted";
  hint?: string;
};

export type CryptoSignalHubRow = {
  id: string;
  href: string;
  analystDisplay: string;
  analystAvatar: string | null;
  analystVerified: boolean;
  direction: SignalsFeedRow["direction"];
  entryLabel: string;
  targetLabel: string;
  stopLabel: string;
  rrLabel: string;
  confidence: number;
  thesisGrade: SignalsFeedRow["thesis_grade"];
  timeframe: string;
  strategy: string;
  sparkline: number[];
  isActive: boolean;
  copies24h: number;
};

export type CryptoSignalHubPayload = {
  symbol: string;
  bullPct: number;
  bearPct: number;
  agreementPct: number;
  confidenceAvg: number;
  activeAnalysts: number;
  conflictingGroups: number;
  splitSentiment: boolean;
  thesisVarianceLabel: string;
  commandMetrics: CryptoSignalHubCommandMetric[];
  confidenceBins: AssetSignalConfidenceBins;
  topAnalysts: AssetTopAnalyst[];
  rows: CryptoSignalHubRow[];
  signalHub: AssetSignalHubDetail;
  signalSummary: AssetSignalSummary;
  symbolConsensus: SymbolConsensusIntel;
};
