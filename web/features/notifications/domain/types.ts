import type { NotificationItem } from "@/features/social/repository";

/** Gelen kutusu sekmeleri — etiketler UI’da Türkçe */
export type NotificationInboxStreamId =
  | "all"
  | "today"
  | "important"
  | "portfolio"
  | "following"
  | "premium"
  | "discussions";

export type NotificationQuickActionKind =
  | "open_primary"
  | "open_secondary"
  | "mark_read"
  | "toggle_star"
  | "mute_creator"
  | "mute_asset"
  | "mute_topic"
  | "join_room"
  | "copy_signal"
  | "follow_creator";

export type NotificationQuickAction = {
  id: string;
  kind: NotificationQuickActionKind;
  label: string;
  href?: string | null;
  /** copy_signal, mute_topic vb. */
  payload?: { text?: string; symbol?: string; token?: string; creatorId?: string };
};

export type NotificationCenterItem = {
  id: string;
  row: NotificationItem;
  starred: boolean;
  streams: NotificationInboxStreamId[];
  priority: number;
  importance: "critical" | "high" | "normal";
  relevance_line: string | null;
  actor_href: string;
  actions: NotificationQuickAction[];
  batch_key: string | null;
};

export type NotificationDigestCard = {
  id: string;
  title: string;
  subline: string;
  href: string;
  tone: "market" | "creator" | "premium" | "portfolio" | "signal";
};

export type NotificationSurfaceLink = {
  href: string;
  label: string;
};

export type NotificationCenterPayload = {
  headline: string;
  subline: string;
  adaptive_subline: string;
  fatigue_note: string | null;
  confidence_label: string;
  digests: NotificationDigestCard[];
  nav_links: NotificationSurfaceLink[];
  items: NotificationCenterItem[];
  mock_mode: boolean;
};

export type NotificationCenterAction =
  | { type: "mark_read"; notificationId: string }
  | { type: "toggle_star"; notificationId: string }
  | { type: "mute_creator"; creatorId: string }
  | { type: "mute_asset"; symbol: string }
  | { type: "mute_topic"; token: string }
  | { type: "follow_creator"; creatorId: string };
