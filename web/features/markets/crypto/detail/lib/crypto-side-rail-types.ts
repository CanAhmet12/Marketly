import type { AssetRelatedCreator, AssetUserContextHints } from "@/features/markets/types/asset-intelligence";

export type CryptoSideRailQuickLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type CryptoSideRailPeer = {
  symbol: string;
  correlationLabel: string;
  href: string;
};

export type CryptoSideRailSignalChip = {
  id: string;
  href: string;
  direction: string;
  analyst: string;
  confidence: number;
};

export type CryptoSideRailPayload = {
  symbol: string;
  segmentLabel: string;
  segmentHref: string;
  bullPct: number;
  bearPct: number;
  analystBullPct: number;
  analystBearPct: number;
  communityBullPct: number;
  communityBearPct: number;
  communityVotes: number;
  activeSignals: number;
  agreementPct: number;
  signalChips: CryptoSideRailSignalChip[];
  creators: AssetRelatedCreator[];
  peers: CryptoSideRailPeer[];
  macroThemes: string[];
  userHints: AssetUserContextHints;
  quickLinks: CryptoSideRailQuickLink[];
};
