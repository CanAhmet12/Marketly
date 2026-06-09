import type { PersonalizedDiscussionPack } from "@/features/social/repository/discussion-discovery-types";
import type { HomeVisualRailLink } from "@/features/home/visual/mock-data";

/** RPC pack → sağ rail tartışma satırları */
export function mapDiscussionPackToRailLinks(pack: PersonalizedDiscussionPack): HomeVisualRailLink[] {
  const merged = [
    ...pack.for_you,
    ...pack.watchlist,
    ...pack.followed_creators,
    ...pack.portfolio,
  ];
  const seen = new Set<string>();
  const links: HomeVisualRailLink[] = [];
  for (const row of merged) {
    if (seen.has(row.post_id)) continue;
    seen.add(row.post_id);
    links.push({
      label: row.label,
      meta: row.relevance_reason,
      href: row.href,
    });
    if (links.length >= 6) break;
  }
  return links;
}
