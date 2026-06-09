/** Özel daireler + yakın takipçi ağı — repository şekli */

export type PrivateCircleKind =
  | "close_followers"
  | "premium_members"
  | "signal_desk"
  | "macro_club"
  | "institutional_room"
  | "elite_subscribers"
  | "research_circle"
  | "inner_strategy"
  | "creator_selected";

export type CircleAccessMode =
  | "creator_selected"
  | "membership"
  | "invite_only"
  | "strategy_tier"
  | "premium_room"
  | "temporary";

export type PrivateCircleIntel = {
  member_activity_label: string;
  creator_participation_label: string;
  private_engagement_label: string;
  discussion_density_label: string;
  premium_participation_label: string;
  invite_momentum_label: string;
  trust_heat_label: string;
  member_overlap_label: string;
};

export type CircleAccessDescriptor = {
  mode: CircleAccessMode;
  label: string;
  locked: boolean;
  role_hint: string | null;
  temporary_hint: string | null;
};

export type PrivateCircleSummary = {
  id: string;
  creator_id: string;
  creator_display: string;
  creator_handle: string;
  avatar_url: string | null;
  verified: boolean;
  kind: PrivateCircleKind;
  title: string;
  subline: string;
  access: CircleAccessDescriptor;
  intel: PrivateCircleIntel;
  href: string;
  subscription_href: string;
  signals_href: string;
  rooms_href: string;
  messages_href: string;
};

export type CloseFriendCandidate = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  verified: boolean;
};

export type TrustedMemberCard = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  verified: boolean;
  trust_line: string;
  channel_href: string;
};

export type PrivateFeedKind =
  | "creator_update"
  | "signal_preview"
  | "discussion"
  | "note"
  | "room_activity"
  | "announcement"
  | "debate"
  | "trusted_thread";

export type PrivateFeedItem = {
  id: string;
  kind: PrivateFeedKind;
  title: string;
  sub: string;
  href: string | null;
  at: string;
  circle_id: string | null;
  trust_line: string | null;
};

export type CloseFriendsHubPayload = {
  headline: string;
  subline: string;
  affinity_line: string;
  trusted_members: TrustedMemberCard[];
  your_circles: PrivateCircleSummary[];
  suggested_circles: PrivateCircleSummary[];
  rails: {
    trusted_groups: PrivateCircleSummary[];
    premium_inner: PrivateCircleSummary[];
    portfolio_related: PrivateCircleSummary[];
    strategy_fit: PrivateCircleSummary[];
    macro_private: PrivateCircleSummary[];
    active_communities: PrivateCircleSummary[];
  };
  private_feed: PrivateFeedItem[];
  publishing: { upload_href: string; composer_hint: string };
  nav: {
    subscriptions: string;
    messages: string;
    notifications: string;
    discover: string;
    watch: string;
  };
  data_mode: "mock" | "live_sparse" | "live";
  write_enabled?: boolean;
};

export type PrivateCircleDetailPayload = {
  circle: PrivateCircleSummary;
  feed: PrivateFeedItem[];
  publishing_hint: string;
  is_close_friend?: boolean;
  write_enabled?: boolean;
};

export type ComposerCircleAudienceOption = {
  id: string;
  label: string;
  sub: string;
  locked: boolean;
  href_learn: string | null;
};
