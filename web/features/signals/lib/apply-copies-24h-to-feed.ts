import { deriveSubscriberCopies24h } from "@/features/signals/domain/signal-economy";
import type { SignalsFeedRow } from "@/features/signals/repository/types";

/** `signal_copies` 24s penceresinden gerçek kopya hızını feed satırlarına yazar */
export function applyCopies24hToFeedRows(
  rows: SignalsFeedRow[],
  counts: Map<string, number>,
): SignalsFeedRow[] {
  if (!counts.size) return rows;

  return rows.map((row) => {
    const c24 = counts.get(row.id);
    if (c24 == null || c24 <= 0) return row;
    return {
      ...row,
      copies_24h_real: c24,
      community_copies_24h: c24,
      subscriber_copies_24h: deriveSubscriberCopies24h(c24, row.id),
    };
  });
}
