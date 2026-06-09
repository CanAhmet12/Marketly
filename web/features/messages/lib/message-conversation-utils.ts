import type { Conversation } from "@/features/social/repository";
import type { MockConversationKind, MockConversationRow } from "@/features/social/types";

export const MESSAGE_KIND_LABELS: Record<MockConversationKind, string> = {
  creator_dm: "DM",
  circle_private: "Daire",
  premium_member: "Premium",
  signal_thread: "Sinyal",
  support: "Destek",
  market_debate: "Tartışma",
  room_side: "Oda",
  strategy: "Strateji",
  event_temp: "Etkinlik",
  live_watch: "Canlı",
};

export function extConversation(c: Conversation): MockConversationRow {
  return c as unknown as MockConversationRow;
}

export function peerChannelHref(c: Conversation, selfId: string): string | null {
  if (c.is_group) return null;
  const other = c.participant_ids.find((p) => p !== selfId);
  return other ? `/channel/${encodeURIComponent(other)}` : null;
}

export function conversationKind(c: Conversation): MockConversationKind {
  return extConversation(c).kind ?? (c.is_group ? "market_debate" : "creator_dm");
}
