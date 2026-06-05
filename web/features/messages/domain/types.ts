import type { Conversation } from "@/features/social/repository";

export type MessageInboxStreamId =
  | "all"
  | "important"
  | "creators"
  | "premium"
  | "rooms"
  | "markets"
  | "discussions"
  | "close";

export type SmartConversationItem = {
  id: string;
  row: Conversation;
  streams: MessageInboxStreamId[];
  rank: number;
  peer_creator_id: string | null;
  context_preview: string | null;
  ring_labels: readonly string[];
};

export type MessageBridgeStrip = {
  id: string;
  label: string;
  sub: string;
  href: string;
};

export type ComposerSuggestion = {
  id: string;
  label: string;
  insert_text: string;
};

export type MessageCenterPayload = {
  headline: string;
  subline: string;
  adaptive_line: string;
  fatigue_note: string | null;
  strips: MessageBridgeStrip[];
  nav_links: { href: string; label: string }[];
  items: SmartConversationItem[];
  mock_mode: boolean;
};
