/** Üretici topluluk odaları — UI yalnızca SocialRepository üzerinden okur. */

export type CreatorRoomKind =
  | "general"
  | "premium"
  | "macro"
  | "asset"
  | "strategy"
  | "daily"
  | "education"
  | "signals"
  | "live_market";

export type CreatorRoomFeedRowKind =
  | "announcement"
  | "thread"
  | "signal_link"
  | "market_note"
  | "highlight"
  | "qa"
  | "creator_reply";

export type CreatorRoomSummary = {
  id: string;
  creator_id: string;
  label: string;
  kind: CreatorRoomKind;
  is_premium: boolean;
  preview_locked: boolean;
  heat_label: string;
  participant_density_label: string;
  creator_present_label: string;
  last_activity_at: string;
  href: string;
  linked_symbol: string | null;
  signal_thread_label: string | null;
  premium_badge_label: string | null;
};

export type CreatorRoomFeedRow = {
  id: string;
  room_id: string;
  kind: CreatorRoomFeedRowKind;
  title: string;
  sub: string;
  href: string;
  pinned: boolean;
  premium_only_preview: boolean;
  creator_reacted: boolean;
  created_at: string;
};

export type CreatorRoomPinnedNote = {
  id: string;
  room_id: string;
  body: string;
  href: string;
};

export type CreatorRoomTopParticipant = {
  user_id: string;
  display: string;
  score_label: string;
  premium_member: boolean;
};

export type CreatorCommunityIntelligence = {
  active_members_label: string;
  heat_peak_label: string;
  topic_overlap_label: string;
  premium_participation_label: string;
  related_room_labels: string[];
};

export type CreatorCommunityNetworkHints = {
  id: string;
  text: string;
  href: string;
};

export type CreatorCommunityRoomsSurface = {
  creator_id: string;
  rooms: CreatorRoomSummary[];
  feed: CreatorRoomFeedRow[];
  pinned_notes: CreatorRoomPinnedNote[];
  top_participants: CreatorRoomTopParticipant[];
  intelligence: CreatorCommunityIntelligence;
  network: CreatorCommunityNetworkHints[];
};

export type DiscoverCreatorRoomsRail = {
  headline: string;
  spotlight: { room_id: string; room_label: string; creator_id: string; creator_name: string; heat_label: string; href: string }[];
  collaboration_chips: { id: string; label: string; href: string }[];
};

export type CreatorRoomSearchHit = {
  id: string;
  room_id: string;
  title: string;
  subtitle: string;
  creator_name: string;
  href: string;
  premium_badge: boolean;
};

export type SignalCreatorRoomLink = {
  href: string;
  label: string;
  sub: string;
};

export type WatchCreatorRoomsContext = {
  lines: { id: string; text: string; href: string }[];
};

export type CreatorRoomNotificationStripItem = {
  id: string;
  title: string;
  href: string;
};

export type MessagingCreatorRoomDigestItem = {
  id: string;
  text: string;
  href: string;
};
