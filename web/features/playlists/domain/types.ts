/** Playlist / media library — sunucuya taşınmaya hazır domain */

export type PlaylistStructureKind =
  | "strategy_collection"
  | "macro_breakdown"
  | "market_cycle"
  | "signal_archive"
  | "creator_course"
  | "premium_research"
  | "live_recap"
  | "educational_series"
  | "room_linked"
  | "general";

export type PlaylistIntelligence = {
  thesis: string;
  creator_intent: string;
  momentum_pct: number;
  discussion_density_pct: number;
  signal_overlap_pct: number;
  market_relevance_pct: number;
  strategy_alignment_pct: number;
  creator_continuity_pct: number;
  watch_momentum_pct: number;
  premium_relevance_pct: number;
};

export type PlaylistIntegrationKind =
  | "room"
  | "discussion"
  | "signal"
  | "market"
  | "subscription"
  | "close_friends"
  | "notifications"
  | "discover";

export type PlaylistIntegrationLink = {
  kind: PlaylistIntegrationKind;
  label: string;
  href: string;
};

export type PlaylistDiscoveryRow = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge: string | null;
  cover_thumbnail_url: string | null;
};

export type PlaylistProgressHint = "none" | "more_signal" | "started";

export type PlaylistMemberRow = {
  rank: number;
  post_id: string;
  title: string;
  type_label: string;
  asset_tag: string | null;
  thumbnail_url: string | null;
  watch_href: string;
  discussion_linked: boolean;
  signal_linked: boolean;
  continuity_label: string | null;
  progress_hint: PlaylistProgressHint;
};

export type PlaylistLibraryHints = {
  positioning_line: string;
  premium_visibility_line: string;
  grouping_line: string;
};

export type PlaylistAccess = "full" | "locked";

export type PlaylistDetailPayload = {
  id: string;
  title: string;
  description: string;
  visibility: "public" | "unlisted" | "private";
  video_count: number;
  updated_at: string;
  cover_thumbnail_url: string | null;
  owner_id: string;
  owner_display: string;
  owner_channel_href: string;
  access: PlaylistAccess;
  locked_message: string | null;
  structure_kind: PlaylistStructureKind;
  structure_label: string;
  intelligence: PlaylistIntelligence;
  integration_links: PlaylistIntegrationLink[];
  discovery_rows: PlaylistDiscoveryRow[];
  member_rows: PlaylistMemberRow[];
  continuation_summary: string;
  recommendation_confidence_hint: string;
  engagement_line: string;
  sparse_reason: "none" | "no_members";
  library_hints: PlaylistLibraryHints | null;
};
