import { getPersonalizationRepository } from "@/features/personalization/repository";
import { getSubscriptionRepository } from "@/features/subscriptions/repository";
import type { NotificationItem } from "@/features/social/repository";
import { isSameCalendarDay } from "@/features/social/lib/social-format";
import type { MockNotificationType } from "@/features/social/types";
import { isMockDataEnabled } from "@/mock/config";

import type {
  NotificationCenterItem,
  NotificationCenterPayload,
  NotificationDigestCard,
  NotificationInboxStreamId,
  NotificationQuickAction,
  NotificationSurfaceLink,
} from "../domain/types";

function rowImportance(row: NotificationItem): "critical" | "high" | "normal" {
  const ex = row as NotificationItem & {
    importance?: "critical" | "high" | "normal";
  };
  if (ex.importance === "critical" || ex.importance === "high" || ex.importance === "normal") return ex.importance;
  const t = row.type;
  if (
    t === "macro_alert" ||
    t === "target_stop" ||
    t === "portfolio_intel" ||
    t === "premium_signal" ||
    t === "signal_lifecycle"
  ) {
    return "high";
  }
  if (t === "market_move" || t === "price_alert" || t === "live_started" || t === "recommendation_update") return "high";
  return "normal";
}

function streamsForRow(row: NotificationItem): NotificationInboxStreamId[] {
  const out = new Set<NotificationInboxStreamId>(["all"]);
  if (isSameCalendarDay(row.created_at, new Date().toISOString())) out.add("today");

  const t = row.type as MockNotificationType;
  const map: Record<string, NotificationInboxStreamId[]> = {
    like: ["following"],
    comment: ["discussions", "following"],
    follow: ["following"],
    signal_copied: ["premium", "following"],
    price_alert: ["portfolio", "important"],
    live_started: ["following", "today"],
    mention: ["discussions"],
    message: ["following"],
    market_move: ["important", "portfolio"],
    system: ["important"],
    premium_signal: ["premium", "important"],
    signal_lifecycle: ["premium", "important"],
    target_stop: ["premium", "important", "portfolio"],
    room_invite: ["premium", "following", "today"],
    circle_invite: ["following", "premium"],
    creator_reply: ["discussions", "following"],
    discussion_mention: ["discussions"],
    recommendation_update: ["important"],
    portfolio_intel: ["portfolio", "important"],
    watchlist_intel: ["portfolio", "following"],
    macro_alert: ["important", "portfolio"],
    subscription_update: ["premium"],
    premium_unlock: ["premium"],
    live_recap: ["following", "today"],
    strategy_fit: ["portfolio", "important"],
    rising_theme: ["important"],
  };
  for (const s of map[t] ?? ["following"]) out.add(s);
  return [...out];
}

function priorityScore(row: NotificationItem, imp: "critical" | "high" | "normal"): number {
  const ageMs = Date.now() - new Date(row.created_at).getTime();
  const recency = Math.max(0, 100 - Math.floor(ageMs / 3_600_000));
  const bump = imp === "critical" ? 40 : imp === "high" ? 22 : 0;
  return bump + recency;
}

function relevanceLine(row: NotificationItem, viewerId: string | null): string | null {
  const p = getPersonalizationRepository();
  const adapt = p.getRecommendationAdaptationSnapshot(viewerId);
  const intel = p.getInterestIntelligence();
  const t = row.type as MockNotificationType;
  if (t === "recommendation_update" || t === "rising_theme") {
    return adapt.hints[0] ?? adapt.subline ?? null;
  }
  if (t === "portfolio_intel" || t === "watchlist_intel" || t === "strategy_fit") {
    return intel.subline ?? null;
  }
  if (t === "macro_alert") return intel.horizonLabel ?? null;
  if (t === "premium_signal" || t === "signal_lifecycle") {
    return intel.confidenceLabel ?? null;
  }
  const tok = (row as NotificationItem & { relevance_token?: string | null }).relevance_token;
  return tok ?? null;
}

function buildActions(row: NotificationItem): NotificationQuickAction[] {
  const actions: NotificationQuickAction[] = [];
  const ext = row as NotificationItem & { secondary_href?: string | null };
  actions.push({
    id: "open",
    kind: "open_primary",
    label: "Aç",
    href: row.action_href,
  });
  if (ext.secondary_href) {
    actions.push({
      id: "open2",
      kind: "open_secondary",
      label: "İkincil",
      href: ext.secondary_href,
    });
  }
  actions.push({ id: "read", kind: "mark_read", label: "Okundu", href: null });
  actions.push({ id: "star", kind: "toggle_star", label: "Önemli", href: null });
  actions.push({
    id: "mute_cr",
    kind: "mute_creator",
    label: "Sessize al",
    href: null,
    payload: { creatorId: row.actor_id },
  });
  const t = row.type as MockNotificationType;
  if (t === "price_alert" || t === "market_move" || t === "watchlist_intel" || t === "macro_alert") {
    const sym = row.entity_id ?? "BTC";
    actions.push({
      id: "mute_as",
      kind: "mute_asset",
      label: "Varlığı kıs",
      href: `/markets/${encodeURIComponent(sym)}`,
      payload: { symbol: sym },
    });
  }
  if (t === "rising_theme" || t === "recommendation_update") {
    actions.push({
      id: "mute_th",
      kind: "mute_topic",
      label: "Temayı azalt",
      href: "/discover",
      payload: { token: row.entity_id ?? "makro" },
    });
  }
  if (t === "signal_copied" || t === "premium_signal" || t === "signal_lifecycle" || t === "target_stop") {
    actions.push({
      id: "copy",
      kind: "copy_signal",
      label: "Özeti kopyala",
      href: row.action_href,
      payload: { text: `${row.title}\n${row.body}` },
    });
  }
  if (t === "room_invite" || t === "live_started" || t === "live_recap") {
    actions.push({ id: "room", kind: "join_room", label: "Odaya git", href: "/live" });
  }
  if (t === "follow" || t === "creator_reply") {
    actions.push({
      id: "follow",
      kind: "follow_creator",
      label: "İlgi işaretle",
      href: `/channel/${encodeURIComponent(row.actor_id)}`,
      payload: { creatorId: row.actor_id },
    });
  }
  return actions;
}

function buildDigests(viewerId: string | null): NotificationDigestCard[] {
  const p = getPersonalizationRepository();
  const intel = p.getInterestIntelligence();
  const explore = p.getDiscoverExploreSurface(viewerId);
  const hub = viewerId ? getSubscriptionRepository().getSubscriptionsHub(viewerId) : null;
  const cards: NotificationDigestCard[] = [];

  cards.push({
    id: "digest-market",
    title: "Günlük piyasa özeti",
    subline: intel.headline,
    href: "/markets",
    tone: "market",
  });

  if (intel.strongest[0]) {
    cards.push({
      id: "digest-interest",
      title: "İlgi özeti",
      subline: intel.strongest[0]!.label,
      href: intel.strongest[0]!.href,
      tone: "creator",
    });
  }

  if (explore.rising_topics[0]) {
    cards.push({
      id: "digest-rise",
      title: "Yükselen temalar",
      subline: explore.rising_topics[0]!.sub,
      href: explore.rising_topics[0]!.href,
      tone: "market",
    });
  }

  cards.push({
    id: "digest-signals",
    title: "Sinyal özeti",
    subline: "Açık risk ve hedef akışınızı tek yerde görün.",
    href: "/signals",
    tone: "signal",
  });

  cards.push({
    id: "digest-watch",
    title: "İzleme listesi",
    subline: explore.watchlist_linked[0]?.sub ?? "Kesişen varlıklar ve içerikçiler.",
    href: "/watchlist",
    tone: "portfolio",
  });

  cards.push({
    id: "digest-portfolio",
    title: "Portföy istihbaratı",
    subline: explore.portfolio_linked[0]?.sub ?? "Strateji uyumu ve makro bağlantılar.",
    href: "/portfolio",
    tone: "portfolio",
  });

  cards.push({
    id: "digest-discuss",
    title: "Tartışma özeti",
    subline: "Bahsedilmeler ve tez hatları.",
    href: "/discover",
    tone: "creator",
  });

  if (hub?.rails.recommended_for_you[0]) {
    const c = hub.rails.recommended_for_you[0]!;
    cards.push({
      id: "digest-premium",
      title: "Premium özet",
      subline: `${c.display_name} · ${c.rel_label}`,
      href: c.href_detail,
      tone: "premium",
    });
  }

  return cards.slice(0, 8);
}

const NAV: NotificationSurfaceLink[] = [
  { href: "/", label: "Ana" },
  { href: "/discover", label: "Keşfet" },
  { href: "/watchlist", label: "Liste" },
  { href: "/signals", label: "Sinyaller" },
  { href: "/markets", label: "Piyasalar" },
  { href: "/live", label: "Canlı" },
  { href: "/messages", label: "Mesaj" },
  { href: "/subscriptions", label: "Abonelikler" },
  { href: "/close-friends", label: "Daireler" },
  { href: "/search", label: "Arama" },
];

export function assembleNotificationCenter(input: {
  viewerId: string | null;
  rows: readonly NotificationItem[];
  isStarred: (id: string) => boolean;
}): NotificationCenterPayload {
  const mock = isMockDataEnabled();
  const p = getPersonalizationRepository();
  const fb = p.getFeedFeedbackState();
  const ex = p.getExplorationFeedbackState();
  const muted = new Set([...fb.muteCreators, ...ex.notInterestedCreators]);
  const adapt = p.getRecommendationAdaptationSnapshot(input.viewerId);
  const intel = p.getInterestIntelligence();

  const filtered = input.rows.filter((r) => !muted.has(r.actor_id));

  const fatigueNote =
    adapt.fatigueIndex > 0.55
      ? "Öneri yoğunluğu kontrollü düşürüldü; önemli kanal öne alındı."
      : adapt.fatigueIndex > 0.35
        ? "Sinyal gürültüsünü azaltan bir tempo kullanılıyor."
        : null;

  const items: NotificationCenterItem[] = filtered.map((row) => {
    const imp = rowImportance(row);
    return {
      id: row.id,
      row,
      starred: input.isStarred(row.id),
      streams: streamsForRow(row),
      priority: priorityScore(row, imp),
      importance: imp,
      relevance_line: relevanceLine(row, input.viewerId),
      actor_href: `/channel/${encodeURIComponent(row.actor_id)}`,
      actions: buildActions(row),
      batch_key: (row as NotificationItem & { batch_key?: string | null }).batch_key ?? null,
    };
  });

  items.sort((a, b) => b.priority - a.priority || +new Date(b.row.created_at) - +new Date(a.row.created_at));

  const sub = mock
    ? `${filtered.length} olay · ${intel.confidenceLabel}`
    : "Canlı bağlantıda olaylar yüklendiğinde akış güncellenir.";

  return {
    headline: "Bildirim merkezi",
    subline: sub,
    adaptive_subline: adapt.subline,
    fatigue_note: fatigueNote,
    confidence_label: intel.confidenceLabel,
    digests: input.viewerId ? buildDigests(input.viewerId) : [],
    nav_links: NAV,
    items,
    mock_mode: mock,
  };
}
