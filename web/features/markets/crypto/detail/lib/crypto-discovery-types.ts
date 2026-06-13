import type { AssetMediaItem } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";

export type CryptoDiscoveryPeerRow = {
  symbol: string;
  name: string;
  href: string;
  price: number;
  change24h: number;
  marketCapLabel: string;
  sparkline: number[];
  trend: "up" | "down" | "flat";
  correlationLabel: string;
};

export type CryptoDiscoveryVideoRow = {
  id: string;
  title: string;
  href: string;
  kind: AssetMediaItem["kind"];
  creatorDisplay: string;
  viewsLabel: string;
  durationLabel: string | null;
  thumbnailUrl: string | null;
};

export type CryptoDiscoveryPayload = {
  symbol: string;
  segmentId: string;
  segmentLabel: string;
  segmentChange24h: number;
  segmentLeaderSymbol: string;
  segmentLeaderChange: number;
  segmentLeaderHref: string;
  screenerHref: string;
  categoryHref: string;
  discoverHref: string;
  peers: CryptoDiscoveryPeerRow[];
  themeCluster: { label: string; symbols: string[] } | null;
  correlatedFallback: CryptoDiscoveryPeerRow[];
  videos: CryptoDiscoveryVideoRow[];
};
