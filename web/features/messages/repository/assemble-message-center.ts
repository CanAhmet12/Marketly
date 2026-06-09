import { getPersonalizationRepository } from "@/features/personalization/repository";
import { getSubscriptionRepository } from "@/features/subscriptions/repository";
import { getSocialRepository } from "@/features/social/repository";
import type { Conversation } from "@/features/social/repository";
import type { MockConversationContext, MockConversationKind, MockConversationRow } from "@/features/social/types";
import { isMockDataEnabled } from "@/mock/config";

import type {
  ComposerSuggestion,
  MessageBridgeStrip,
  MessageCenterPayload,
  MessageInboxStreamId,
  SmartConversationItem,
} from "../domain/types";

function extRow(c: Conversation): MockConversationRow {
  return c as Conversation & MockConversationRow;
}

function peerCreatorId(c: Conversation, viewerId: string): string | null {
  if (c.is_group) return null;
  return c.participant_ids.find((p) => p !== viewerId) ?? null;
}

function kindOf(c: Conversation): MockConversationKind {
  return extRow(c).kind ?? (c.is_group ? "market_debate" : "creator_dm");
}

function streamsFor(
  c: Conversation,
  viewerId: string,
  closeIds: Set<string>,
): MessageInboxStreamId[] {
  const out = new Set<MessageInboxStreamId>(["all"]);
  const k = kindOf(c);
  const row = extRow(c);
  const peer = peerCreatorId(c, viewerId);

  if (k === "creator_dm" || k === "support") out.add("creators");
  if (k === "premium_member") {
    out.add("premium");
    out.add("creators");
  }
  if (k === "circle_private") {
    out.add("close");
  }
  if (peer && closeIds.has(peer)) {
    out.add("close");
  }
  if (k === "room_side" || k === "live_watch") out.add("rooms");
  if (k === "market_debate" || k === "signal_thread" || k === "strategy") out.add("discussions");
  if (row.context?.asset_tag || k === "market_debate") out.add("markets");

  const heat = row.intel?.heat ?? 0;
  if (c.unread_count >= 3 || heat >= 2 || k === "signal_thread") out.add("important");

  return [...out];
}

function contextPreview(c: Conversation): string | null {
  const ctx = extRow(c).context;
  if (!ctx) return null;
  const parts: string[] = [];
  if (ctx.asset_tag) parts.push(ctx.asset_tag);
  if (ctx.portfolio_note) parts.push("Portföy");
  if (ctx.room_href) parts.push("Oda");
  if (ctx.signal_href) parts.push("Sinyal");
  return parts.length ? parts.join(" · ") : null;
}

function ringLabels(c: Conversation): string[] {
  const row = extRow(c);
  const i = row.intel;
  if (!i) return [];
  return [i.velocity_label, i.trust_label].filter(Boolean);
}

function rankConv(
  c: Conversation,
  viewerId: string,
  affinity: Readonly<Record<string, number>>,
  fatigue: number,
  closeIds: Set<string>,
): number {
  const peer = peerCreatorId(c, viewerId);
  const aff = peer ? affinity[peer] ?? 12 : 8;
  const heat = (extRow(c).intel?.heat ?? 0) * 14;
  const unread = c.unread_count * 22;
  const t = new Date(c.updated_at).getTime();
  const recency = Math.min(40, Math.floor((Date.now() - t) / 120_000));
  const fatiguePenalty = Math.floor(fatigue * 8);
  const closeBoost = peer && closeIds.has(peer) ? 10 : 0;
  return unread + heat + aff + Math.max(0, 30 - recency) - fatiguePenalty + closeBoost;
}

const NAV = [
  { href: "/hub/notifications", label: "Bildirimler" },
  { href: "/live", label: "Odalar" },
  { href: "/discover", label: "Keşfet" },
  { href: "/signals", label: "Sinyaller" },
  { href: "/markets", label: "Piyasalar" },
  { href: "/hub/watchlist", label: "Liste" },
  { href: "/hub/subscriptions", label: "Abonelik" },
  { href: "/hub/close-friends", label: "Daireler" },
  { href: "/search", label: "Arama" },
] as const;

export function assembleMessageCenter(viewerId: string | null, conversations: readonly Conversation[]): MessageCenterPayload {
  const mock = isMockDataEnabled();
  if (!viewerId) {
    return {
      headline: "Mesaj merkezi",
      subline: "Oturum açın",
      adaptive_line: "",
      fatigue_note: null,
      strips: [],
      nav_links: [...NAV],
      items: [],
      mock_mode: mock,
    };
  }

  const p = getPersonalizationRepository();
  const adapt = p.getRecommendationAdaptationSnapshot(viewerId);
  const intel = p.getInterestIntelligence();
  const aff = p.getAffinityContext().creators;

  const closeRows = getSocialRepository().getCloseFriends(viewerId);
  const closeIds = new Set(closeRows.map((x) => x.id));

  const hub = getSubscriptionRepository().getSubscriptionsHub(viewerId);
  const memberCreators = new Set(hub.active_memberships.map((m) => m.creator_id));

  const roomDigest = getSocialRepository().getMessagingCreatorRoomDigest(viewerId);
  const strips: MessageBridgeStrip[] = roomDigest.map((d) => ({
    id: d.id,
    label: "Oda köprüsü",
    sub: d.text,
    href: d.href,
  }));

  if (hub.rails.premium_room_spotlight[0]) {
    const pr = hub.rails.premium_room_spotlight[0]!;
    strips.push({
      id: "strip-premium-room",
      label: "Premium oda",
      sub: pr.display_name,
      href: pr.href_detail,
    });
  }

  const items: SmartConversationItem[] = conversations.map((c) => {
    const peer = peerCreatorId(c, viewerId);
    let streams = streamsFor(c, viewerId, closeIds);
    if (peer && memberCreators.has(peer) && !streams.includes("premium")) {
      streams = [...streams, "premium"];
    }
    return {
      id: c.id,
      row: c,
      streams,
      rank: rankConv(c, viewerId, aff, adapt.fatigueIndex, closeIds),
      peer_creator_id: peer,
      context_preview: contextPreview(c),
      ring_labels: ringLabels(c),
    };
  });

  items.sort((a, b) => b.rank - a.rank);

  const fatigueNote =
    adapt.fatigueIndex > 0.5
      ? "Sohbet sıralaması yorgunluk sinyaline göre yumuşatıldı."
      : adapt.fatigueIndex > 0.32
        ? "Öncelik bandı daraltıldı."
        : null;

  return {
    headline: "Mesaj merkezi",
    subline: mock
      ? `${conversations.length} sohbet · ${intel.confidenceLabel}`
      : "Canlı bağlantıda konuşmalar burada görünecek.",
    adaptive_line: intel.subline,
    fatigue_note: fatigueNote,
    strips,
    nav_links: [...NAV],
    items,
    mock_mode: mock,
  };
}

function buildSuggestions(viewerId: string | null, active: Conversation | null): ComposerSuggestion[] {
  if (!viewerId || !active) return [];
  const row = extRow(active);
  const ctx: MockConversationContext | undefined = row.context;
  const p = getPersonalizationRepository();
  const chips = p.getInterestIntelligence().strongest.slice(0, 2);
  const out: ComposerSuggestion[] = [];

  if (ctx?.asset_tag) {
    out.push({
      id: "as-1",
      label: ctx.asset_tag,
      insert_text: `${ctx.asset_tag} `,
    });
  }
  if (ctx?.signal_href) {
    out.push({ id: "sg-1", label: "Sinyal bağla", insert_text: "[sinyal] " });
  }
  if (ctx?.room_href) {
    out.push({ id: "rm-1", label: "Oda notu", insert_text: "Oda notu: " });
  }
  if (ctx?.discussion_href) {
    out.push({ id: "dc-1", label: "Tez özeti", insert_text: "Tez: " });
  }
  for (const ch of chips) {
    out.push({ id: `ch-${ch.id}`, label: ch.label, insert_text: `${ch.label} ` });
  }
  out.push({ id: "tx-thanks", label: "Teşekkür", insert_text: "Teşekkürler, netleşti. " });
  out.push({ id: "tx-risk", label: "Risk", insert_text: "Risk notu: " });
  return out.slice(0, 8);
}

export function assembleComposerSuggestions(viewerId: string | null, conversationId: string | null, conversations: readonly Conversation[]): ComposerSuggestion[] {
  if (!conversationId) return [];
  const active = conversations.find((c) => c.id === conversationId) ?? null;
  return buildSuggestions(viewerId, active);
}
