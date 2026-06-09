import type {
  ActiveMembershipRow,
  MembershipDiscoveryCard,
  MembershipDiscoveryRails,
  MembershipTierKey,
} from "@/features/subscriptions/domain/types";
import { formatTierKey } from "@/features/subscriptions/lib/tier-labels";

function sortHeat(a: MembershipDiscoveryCard, b: MembershipDiscoveryCard): number {
  return b.heat_score - a.heat_score;
}

function isSignalFocused(c: MembershipDiscoveryCard): boolean {
  return c.strategy_focus_label === "Sinyal odaklı" || /sinyal|signal|trade/i.test(c.thesis_line);
}

function isMacro(c: MembershipDiscoveryCard): boolean {
  return c.macro_vs_momentum === "macro" || /makro|fed|faiz|tahvil|fx|kur\b/i.test(c.thesis_line);
}

function isInstitutional(c: MembershipDiscoveryCard): boolean {
  return c.tier_keys.includes("institutional") || c.tier_keys.includes("elite");
}

/** Canlı katalog + aktif üyeliklerden rail dilimleme */
export function buildSubscriptionRails(
  catalog: MembershipDiscoveryCard[],
  subscribedCreatorIds: readonly string[],
): MembershipDiscoveryRails {
  const enriched = [...catalog].sort(sortHeat);
  const subscribedSet = new Set(subscribedCreatorIds);

  const recommended_for_you = enriched
    .filter((c) => !subscribedSet.has(c.creator_id))
    .slice(0, 6);

  const rising_premium = [...enriched]
    .filter((c) => c.heat_score >= 0.45)
    .sort(sortHeat)
    .slice(0, 4);

  const institutional_style = enriched.filter(isInstitutional).slice(0, 6);
  const strategy_focused = enriched.filter(isSignalFocused).slice(0, 6);
  const portfolio_aligned = enriched.filter((c) => subscribedSet.has(c.creator_id)).slice(0, 6);
  const premium_room_spotlight = enriched.filter((c) => c.tier_keys.includes("premium")).slice(0, 6);
  const macro_desk = enriched.filter(isMacro).slice(0, 6);
  const high_conviction = enriched.filter((c) => c.verified && c.heat_score >= 0.5).slice(0, 6);

  return {
    recommended_for_you,
    rising_premium,
    institutional_style,
    strategy_focused,
    portfolio_aligned,
    premium_room_spotlight,
    macro_desk,
    high_conviction,
  };
}

export function formatDbTierLabel(tier: string | null | undefined): string {
  const t = (tier ?? "premium").toLowerCase();
  const map: Record<string, MembershipTierKey> = {
    free: "free",
    premium: "premium",
    pro: "premium",
    elite: "elite",
    institutional: "institutional",
  };
  return formatTierKey(map[t] ?? "premium");
}

export function mapActiveMembershipRow(
  sub: { analyst_id: string; tier: string | null; subscribed_at: string | null },
  profile: { username: string | null; full_name: string | null } | null,
): ActiveMembershipRow {
  const name = profile?.full_name?.trim() || profile?.username?.trim() || "Üretici";
  const handle = profile?.username ? `@${profile.username}` : "@user";
  return {
    creator_id: sub.analyst_id,
    display_name: name,
    handle,
    tier_label: formatDbTierLabel(sub.tier),
    renew_hint: sub.subscribed_at
      ? `Üye since ${new Date(sub.subscribed_at).toLocaleDateString("tr-TR")}`
      : null,
    href_detail: `/hub/subscriptions/${encodeURIComponent(sub.analyst_id)}`,
    href_channel: `/channel/${encodeURIComponent(sub.analyst_id)}`,
  };
}
