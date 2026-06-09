/** Creator membership + subscriptions hub — repository şekli */

export type MembershipTierKey =
  | "free"
  | "premium"
  | "elite"
  | "institutional"
  | "private_room"
  | "strategy_club"
  | "macro_research"
  | "signal_desk";

export type MembershipUnlockAxis =
  | "rooms"
  | "signals"
  | "discussions"
  | "watchlists"
  | "live"
  | "research"
  | "archives"
  | "notes";

export type TierAccessFlags = Record<MembershipUnlockAxis, "none" | "preview" | "full">;

export type MembershipTierDefinition = {
  key: MembershipTierKey;
  label: string;
  /** Kısa ürün dili — fiyat kartı değil */
  pitch: string;
  monthly_hint: string | null;
  access: TierAccessFlags;
  highlight: boolean;
};

export type CreatorEconomyIntel = {
  subscriber_momentum_label: string;
  premium_engagement_label: string;
  consistency_label: string;
  premium_hit_rate_label: string;
  institutional_confidence_label: string;
  room_participation_label: string;
  strategy_quality_label: string;
  premium_activity_heat_label: string;
};

export type MembershipRecommendationReason =
  | "interest_fit"
  | "portfolio_overlap"
  | "macro_affinity"
  | "momentum_fit"
  | "room_activity"
  | "signal_quality"
  | "rising_premium"
  | "institutional_style"
  | "strategy_club"
  | "copied_signals";

export type MembershipDiscoveryCard = {
  creator_id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  verified: boolean;
  thesis_line: string;
  strategy_focus_label: string;
  timeframe_label: string;
  macro_vs_momentum: "macro" | "momentum" | "balanced";
  rel_label: string;
  rel_kind: MembershipRecommendationReason;
  tier_keys: MembershipTierKey[];
  intel: CreatorEconomyIntel;
  href_detail: string;
  href_channel: string;
  /** 0–1 — ince ısı göstergesi */
  heat_score: number;
};

export type MembershipDiscoveryRails = {
  recommended_for_you: MembershipDiscoveryCard[];
  rising_premium: MembershipDiscoveryCard[];
  institutional_style: MembershipDiscoveryCard[];
  strategy_focused: MembershipDiscoveryCard[];
  portfolio_aligned: MembershipDiscoveryCard[];
  premium_room_spotlight: MembershipDiscoveryCard[];
  macro_desk: MembershipDiscoveryCard[];
  high_conviction: MembershipDiscoveryCard[];
};

export type ActiveMembershipRow = {
  creator_id: string;
  display_name: string;
  handle: string;
  tier_label: string;
  renew_hint: string | null;
  href_detail: string;
  href_channel: string;
};

export type SubscriptionsHubPayload = {
  headline: string;
  subline: string;
  affinity_line: string;
  cold_start: boolean;
  strategy_profile_label: string;
  active_memberships: ActiveMembershipRow[];
  catalog: MembershipDiscoveryCard[];
  rails: MembershipDiscoveryRails;
  platform_intel: {
    premium_circulation_label: string;
    room_desk_label: string;
    signal_archive_label: string;
  };
  nav: {
    signals: string;
    discover: string;
    watch: string;
    markets: string;
  };
  data_mode: "mock" | "live_sparse" | "live";
  /** WEB yazma kapısı açık mı (abone ol / iptal) */
  write_enabled?: boolean;
};

export type MembershipViewerSubscription = {
  subscribed: boolean;
  tier: string | null;
  subscribed_at: string | null;
};

export type SignalPreviewLine = {
  id: string;
  symbol: string;
  direction: string;
  thesis_snippet: string;
  access_label: string;
  href: string;
};

export type DiscussionPreviewLine = {
  id: string;
  label: string;
  sub: string;
  href: string;
};

export type RoomPreviewLine = {
  id: string;
  label: string;
  kind_label: string;
  heat_label: string;
  href: string;
  premium: boolean;
};

export type ActivityTimelineItem = {
  id: string;
  at: string;
  title: string;
  sub: string;
  href: string | null;
};

export type MembershipDetailPayload = {
  creator_id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  verified: boolean;
  overview: string;
  strategy_summary: string;
  tiers: MembershipTierDefinition[];
  intel: CreatorEconomyIntel;
  unlocks_editorial: string[];
  room_previews: RoomPreviewLine[];
  discussion_previews: DiscussionPreviewLine[];
  signal_previews: SignalPreviewLine[];
  activity_timeline: ActivityTimelineItem[];
  archive_hint: string;
  links: {
    channel: string;
    signals: string;
    rooms_tab: string;
    discover: string;
  };
  subscription: MembershipViewerSubscription;
  write_enabled: boolean;
};
