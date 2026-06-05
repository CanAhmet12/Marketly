/** Backend-ready: notifications tablosu ile hizalı mock tipler */

export type MockNotificationType =
  | "like"
  | "comment"
  | "follow"
  | "signal_copied"
  | "price_alert"
  | "live_started"
  | "mention"
  | "message"
  | "market_move"
  | "system"
  | "premium_signal"
  | "signal_lifecycle"
  | "target_stop"
  | "room_invite"
  | "circle_invite"
  | "creator_reply"
  | "discussion_mention"
  | "recommendation_update"
  | "portfolio_intel"
  | "watchlist_intel"
  | "macro_alert"
  | "subscription_update"
  | "premium_unlock"
  | "live_recap"
  | "strategy_fit"
  | "rising_theme";

export type MockNotificationRow = {
  id: string;
  /** Alıcı — `auth.users.id` */
  user_id: string;
  /** Tetikleyen profil */
  actor_id: string;
  type: MockNotificationType;
  entity_type: string | null;
  entity_id: string | null;
  title: string;
  body: string;
  /** Sunucu null = okunmadı; mock başlangıçta bazıları dolu olabilir */
  read_at: string | null;
  created_at: string;
  /** UI denormalize (JOIN profiles) */
  actor_display: string;
  actor_avatar_url: string | null;
  actor_verified: boolean;
  action_href: string;
  /** Opsiyonel — bildirim merkezi 2.0 */
  secondary_href?: string | null;
  batch_key?: string | null;
  importance?: "critical" | "high" | "normal";
  relevance_token?: string | null;
};

export type MockConversationKind =
  | "creator_dm"
  | "circle_private"
  | "premium_member"
  | "signal_thread"
  | "support"
  | "market_debate"
  | "room_side"
  | "strategy"
  | "event_temp"
  | "live_watch";

export type MockConversationContext = {
  asset_tag?: string | null;
  room_href?: string | null;
  signal_href?: string | null;
  discussion_href?: string | null;
  portfolio_note?: string | null;
};

export type MockConversationIntel = {
  heat: 0 | 1 | 2;
  velocity_label: string;
  market_line: string;
  trust_label: string;
};

export type MockConversationRow = {
  id: string;
  is_group: boolean;
  title: string;
  subtitle: string | null;
  avatar_url: string | null;
  participant_ids: string[];
  /** Mock online göstergesi */
  online_participant_ids: string[];
  unread_count: number;
  updated_at: string;
  last_message: {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
  };
  kind?: MockConversationKind;
  context?: MockConversationContext;
  intel?: MockConversationIntel;
};

export type MockMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

export type MockNotificationPrefs = {
  push_enabled: boolean;
  email_digest: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
  signals: boolean;
  messages: boolean;
  market: boolean;
  live: boolean;
  creator_digest: boolean;
  watchlist_alerts: boolean;
  portfolio_alerts: boolean;
  discussion_alerts: boolean;
  room_activity: boolean;
  premium_updates: boolean;
  macro_alerts: boolean;
};

export type MockPrivacyPrefs = {
  profile_public: boolean;
  show_activity: boolean;
  allow_mentions_from: "everyone" | "followers" | "none";
  read_receipts: boolean;
  private_circle_visible: boolean;
  follow_list_public: boolean;
  discussion_visibility: "public" | "followers" | "private";
  watch_activity_visible: boolean;
  signal_copy_visible: boolean;
  premium_visibility: boolean;
  room_participation_visible: boolean;
};

export type MockAppearancePrefs = {
  compact_feed: boolean;
  reduce_motion: boolean;
};

export type MockSecurityPrefs = {
  two_factor_hint: "off" | "sms_mock" | "app_mock";
};

export type MockSettingsBundle = {
  profile: {
    display_name: string;
    username: string;
    bio: string;
    avatar_url: string | null;
  };
  notifications: MockNotificationPrefs;
  privacy: MockPrivacyPrefs;
  appearance: MockAppearancePrefs;
  security: MockSecurityPrefs;
};
