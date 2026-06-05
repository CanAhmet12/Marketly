export type SignalDirectionFilter = "all" | "buy" | "sell" | "hold";
export type SignalSortId = "latest" | "trending" | "confidence";

export type SignalFilterChipId =
  | "high_conf"
  | "premium_catalog"
  | "scalp"
  | "swing"
  | "long"
  | "crypto"
  | "stocks"
  | "forex"
  | "commodity"
  | "index";

export type SignalsHeroPayload = {
  activeCount: number;
  buyCount: number;
  sellCount: number;
  holdCount: number;
  successRate: number | null;
  avgConfidence: number;
  lastStrong: { symbol: string; confidence: number; direction: string } | null;
  pulseLabel: string;
  updatedAt: string;
};
