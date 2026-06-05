import type { AffinityContext } from "@/features/personalization/domain/personalization-types";
import { personalizedTrendScore } from "@/features/personalization/domain/personalization-engine";
import type { SignalDirectionFilter, SignalFilterChipId, SignalSortId } from "@/features/signals/types";
import { signalMarketplaceTrendScore } from "@/features/signals/lib/signals-ranking";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

const ASSET_FILTER_IDS: SignalFilterChipId[] = ["crypto", "stocks", "forex", "commodity", "index"];

export function filterSignalFeed(
  rows: SignalsFeedRow[],
  chips: Set<SignalFilterChipId>,
  analystId: string | "all",
  minConfidence: number,
  focusAssetSymbol: string | null,
  direction: SignalDirectionFilter,
  sort: SignalSortId = "latest",
  affinity: AffinityContext | null = null,
): SignalsFeedRow[] {
  let out = [...rows];
  if (focusAssetSymbol?.trim()) {
    const u = focusAssetSymbol.trim().toUpperCase();
    out = out.filter((r) => r.symbol.toUpperCase() === u);
  }

  if (direction === "buy") {
    out = out.filter((r) => r.direction === "BUY");
  } else if (direction === "sell") {
    out = out.filter((r) => r.direction === "SELL");
  } else if (direction === "hold") {
    out = out.filter((r) => r.direction === "HOLD");
  }

  if (chips.has("high_conf")) {
    out = out.filter((r) => r.confidence >= 70);
  }

  if (chips.has("premium_catalog")) {
    out = out.filter((r) => r.signal_access !== "public");
  }

  const stratSel = (["scalp", "swing", "long"] as const).filter((s) => chips.has(s));
  if (stratSel.length) {
    out = out.filter((r) => stratSel.includes(r.strategy));
  }

  const assetSel = ASSET_FILTER_IDS.filter((id) => chips.has(id));
  if (assetSel.length) {
    out = out.filter((r) => (assetSel as readonly string[]).includes(r.assetCategory));
  }

  if (analystId !== "all") {
    out = out.filter((r) => r.analyst.id === analystId);
  }

  if (minConfidence > 0) {
    out = out.filter((r) => r.confidence >= minConfidence);
  }

  // Sort — trending: çok katmanlı skor; latest: kronoloji
  if (sort === "confidence") {
    out.sort((a, b) => b.confidence - a.confidence);
  } else if (sort === "trending") {
    out.sort(
      (a, b) =>
        personalizedTrendScore(b, signalMarketplaceTrendScore(b), affinity) -
        personalizedTrendScore(a, signalMarketplaceTrendScore(a), affinity),
    );
  } else {
    out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return out;
}
