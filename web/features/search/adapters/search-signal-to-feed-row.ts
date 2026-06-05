import { mapSignalsPageRowToFeedRow } from "@/features/signals/lib/map-page-row-to-feed-row";
import type { SignalsFeedRow, SignalsPageRow } from "@/features/signals/repository/types";
import type { SearchSignalHit } from "@/features/search/types";

function parseDirection(raw: string): "BUY" | "SELL" | "HOLD" {
  const x = raw.toUpperCase();
  if (x === "BUY" || x === "LONG") return "BUY";
  if (x === "SELL" || x === "SHORT") return "SELL";
  return "HOLD";
}

/** SearchSignalHit → SignalsFeedRow (UnifiedSignalCompactCard) */
export function searchSignalToFeedRow(hit: SearchSignalHit): SignalsFeedRow {
  const pageRow: SignalsPageRow = {
    id: hit.id,
    creator_id: hit.creator_id,
    asset_id: hit.asset_id,
    symbol: hit.symbol,
    direction: parseDirection(hit.direction),
    confidence: hit.confidence,
    entry_price: hit.entry_price,
    target_price: hit.target_price,
    stop_loss: null,
    timeframe: hit.timeframe || "1G",
    rationale: hit.rationale,
    is_active: true,
    copies_count: 0,
    likes_count: 0,
    created_at: hit.created_at,
    result: null,
    creator_display: hit.creator_name,
    asset_display_name: hit.symbol,
    detail_href: `/signals?asset=${encodeURIComponent(hit.symbol)}`,
  };

  return mapSignalsPageRowToFeedRow(pageRow, {
    id: hit.creator_id,
    display: hit.creator_name,
    avatar_url: hit.creator_avatar,
    verified: false,
    follower_count: 0,
    accuracy: null,
    specialties: null,
    tier: "free",
    strategy_style: null,
  });
}
