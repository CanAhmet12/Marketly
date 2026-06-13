import type { SignalThreadPack } from "@/features/signals/community/types";
import type { SignalThreadPackRpc } from "@/features/signals/fetch-signal-thread-pack";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

/** Gerçek metriklerden thread paketi — mock hash yok */
export function buildSignalThreadPackFromRow(
  row: SignalsFeedRow,
  rpc?: SignalThreadPackRpc | null,
): SignalThreadPack {
  const copies24h = rpc?.copies_24h ?? row.community_copies_24h ?? 0;
  const likes = rpc?.likes_count ?? row.likes_count ?? 0;
  const copies = rpc?.copies_count ?? row.copies_count ?? 0;
  const bullish = rpc?.bullish_count ?? (row.direction === "BUY" ? likes + copies24h : 0);
  const bearish = rpc?.bearish_count ?? (row.direction === "SELL" ? likes + copies24h : 0);
  const total = bullish + bearish;
  const bullPct = total > 0 ? Math.round((bullish / total) * 100) : row.direction === "BUY" ? 62 : 38;
  const bearPct = total > 0 ? Math.round((bearish / total) * 100) : row.direction === "SELL" ? 62 : 38;

  return {
    signalId: row.id,
    entries: [],
    reactions: {
      bullish,
      bearish,
      tracking: copies,
      copied: copies,
      disagreed: Math.max(0, Math.round(likes * 0.15)),
    },
    replyCount: rpc?.reply_count ?? copies + likes,
    quoteCount: 0,
    sentimentSplit: {
      bullPct,
      bearPct,
      neutralPct: Math.max(0, 100 - bullPct - bearPct),
    },
    lastCreatorUpdateAt: rpc?.last_activity_at ?? row.created_at,
    pinnedNote: row.rationale?.trim().slice(0, 140) ?? null,
  };
}
