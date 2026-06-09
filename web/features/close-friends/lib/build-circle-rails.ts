import type { PrivateCircleSummary } from "@/features/close-friends/domain/types";

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type CircleRails = {
  trusted_groups: PrivateCircleSummary[];
  premium_inner: PrivateCircleSummary[];
  portfolio_related: PrivateCircleSummary[];
  strategy_fit: PrivateCircleSummary[];
  macro_private: PrivateCircleSummary[];
  active_communities: PrivateCircleSummary[];
};

export function buildCircleRails(circles: PrivateCircleSummary[]): CircleRails {
  const uniq = [...new Map(circles.map((c) => [c.id, c])).values()];

  return {
    trusted_groups: uniq.filter((x) => x.kind === "close_followers" || x.kind === "inner_strategy").slice(0, 8),
    premium_inner: uniq
      .filter((x) => ["premium_members", "elite_subscribers", "signal_desk"].includes(x.kind))
      .slice(0, 8),
    portfolio_related: [...uniq].slice(0, 6),
    strategy_fit: uniq.filter((x) => x.kind === "inner_strategy" || x.kind === "signal_desk").slice(0, 6),
    macro_private: uniq.filter((x) => x.kind === "macro_club" || x.kind === "institutional_room").slice(0, 6),
    active_communities: [...uniq].sort((a, b) => (hashId(b.id) % 97) - (hashId(a.id) % 97)).slice(0, 6),
  };
}
