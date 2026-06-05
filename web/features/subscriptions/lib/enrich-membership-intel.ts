import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ActivityTimelineItem,
  CreatorEconomyIntel,
  DiscussionPreviewLine,
  MembershipDiscoveryCard,
  SignalPreviewLine,
} from "@/features/subscriptions/domain/types";

export type CreatorActivitySnapshot = {
  posts: number;
  signals: number;
  active_signals: number;
  followers: number;
  recent_post_at: string | null;
  recent_signal_at: string | null;
};

const EMPTY_SNAPSHOT: CreatorActivitySnapshot = {
  posts: 0,
  signals: 0,
  active_signals: 0,
  followers: 0,
  recent_post_at: null,
  recent_signal_at: null,
};

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

function activityHeat(snapshot: CreatorActivitySnapshot): number {
  const postDays = daysSince(snapshot.recent_post_at);
  const sigDays = daysSince(snapshot.recent_signal_at);
  let heat = 0.2;
  if (postDays != null && postDays <= 7) heat += 0.25;
  if (sigDays != null && sigDays <= 7) heat += 0.25;
  if (snapshot.active_signals >= 3) heat += 0.15;
  if (snapshot.posts >= 5) heat += 0.1;
  return Math.min(1, heat);
}

/** Gerçek içerik sayılarından türetilmiş intel — sahte abone üretmez. */
export function buildCreatorEconomyIntel(snapshot: CreatorActivitySnapshot): CreatorEconomyIntel {
  const intel: CreatorEconomyIntel = {
    subscriber_momentum_label: "",
    premium_engagement_label: "",
    consistency_label: "",
    premium_hit_rate_label: "",
    institutional_confidence_label: "",
    room_participation_label: "",
    strategy_quality_label: "",
    premium_activity_heat_label: "",
  };

  if (snapshot.followers > 0) {
    intel.subscriber_momentum_label = `${snapshot.followers} takipçi`;
  }

  const contentParts: string[] = [];
  if (snapshot.posts > 0) contentParts.push(`${snapshot.posts} gönderi`);
  if (snapshot.signals > 0) contentParts.push(`${snapshot.signals} sinyal`);
  if (contentParts.length > 0) {
    intel.premium_engagement_label = contentParts.join(" · ");
  }

  const postDays = daysSince(snapshot.recent_post_at);
  const sigDays = daysSince(snapshot.recent_signal_at);
  if (postDays != null && postDays <= 14) {
    intel.consistency_label = postDays === 0 ? "Bugün gönderi" : `${postDays} gün önce gönderi`;
  } else if (sigDays != null && sigDays <= 14) {
    intel.consistency_label = sigDays === 0 ? "Bugün sinyal" : `${sigDays} gün önce sinyal`;
  }

  if (snapshot.active_signals > 0) {
    intel.premium_hit_rate_label = `${snapshot.active_signals} aktif çağrı`;
  }

  if (snapshot.signals >= 5) {
    intel.strategy_quality_label = "Düzenli sinyal üretimi";
  } else if (snapshot.posts >= 8) {
    intel.strategy_quality_label = "Düzenli içerik akışı";
  }

  const heat = activityHeat(snapshot);
  if (heat >= 0.55) {
    intel.premium_activity_heat_label = heat >= 0.75 ? "Yüksek aktivite" : "Orta aktivite";
  }

  return intel;
}

export function enrichMembershipCard(
  card: MembershipDiscoveryCard,
  snapshot: CreatorActivitySnapshot | undefined,
): MembershipDiscoveryCard {
  const snap = snapshot ?? EMPTY_SNAPSHOT;
  const intel = buildCreatorEconomyIntel(snap);
  const heat = activityHeat(snap);
  const strategyFocus =
    snap.active_signals >= snap.posts && snap.active_signals > 0
      ? "Sinyal odaklı"
      : snap.posts > snap.signals
        ? "İçerik odaklı"
        : card.strategy_focus_label;

  return {
    ...card,
    strategy_focus_label: strategyFocus,
    intel,
    heat_score: Math.max(card.heat_score, heat),
  };
}

/** profiles + posts + signals + follows → üretici aktivite özeti */
export async function fetchCreatorActivitySnapshots(
  client: SupabaseClient,
  creatorIds: string[],
): Promise<Map<string, CreatorActivitySnapshot>> {
  const map = new Map<string, CreatorActivitySnapshot>();
  if (creatorIds.length === 0) return map;

  for (const id of creatorIds) {
    map.set(id, { ...EMPTY_SNAPSHOT });
  }

  try {
    const [postsRes, signalsRes, followsRes] = await Promise.all([
      client
        .from("posts")
        .select("user_id, created_at")
        .in("user_id", creatorIds)
        .order("created_at", { ascending: false })
        .limit(400),
      client
        .from("signals")
        .select("creator_id, is_active, created_at")
        .in("creator_id", creatorIds)
        .order("created_at", { ascending: false })
        .limit(400),
      client.from("follows").select("following_id").in("following_id", creatorIds).limit(2000),
    ]);

    for (const row of postsRes.data ?? []) {
      const id = String((row as { user_id: string }).user_id);
      const snap = map.get(id);
      if (!snap) continue;
      snap.posts += 1;
      if (!snap.recent_post_at) snap.recent_post_at = String((row as { created_at: string }).created_at);
    }

    for (const row of signalsRes.data ?? []) {
      const id = String((row as { creator_id: string }).creator_id);
      const snap = map.get(id);
      if (!snap) continue;
      snap.signals += 1;
      if ((row as { is_active: boolean }).is_active) snap.active_signals += 1;
      if (!snap.recent_signal_at) snap.recent_signal_at = String((row as { created_at: string }).created_at);
    }

    for (const row of followsRes.data ?? []) {
      const id = String((row as { following_id: string }).following_id);
      const snap = map.get(id);
      if (!snap) continue;
      snap.followers += 1;
    }
  } catch (e) {
    console.warn("[subscriptions] fetchCreatorActivitySnapshots", e);
  }

  return map;
}

type SignalRow = {
  id: string;
  creator_id: string;
  asset_id?: string | null;
  direction?: string | null;
  rationale?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  assets?: { symbol?: string | null } | { symbol?: string | null }[] | null;
};

function signalSymbol(row: SignalRow): string {
  const assets = row.assets;
  const join = Array.isArray(assets) ? assets[0] : assets;
  return join?.symbol?.trim() || String(row.asset_id ?? "").trim() || "—";
}

type PostRow = {
  id: string;
  user_id: string;
  title?: string | null;
  content?: string | null;
  created_at: string;
};

export async function fetchCreatorDetailEnrichment(
  client: SupabaseClient,
  creatorId: string,
): Promise<{
  snapshot: CreatorActivitySnapshot;
  signal_previews: SignalPreviewLine[];
  discussion_previews: DiscussionPreviewLine[];
  activity_timeline: ActivityTimelineItem[];
  strategy_summary: string;
}> {
  const snapshots = await fetchCreatorActivitySnapshots(client, [creatorId]);
  const snapshot = snapshots.get(creatorId) ?? { ...EMPTY_SNAPSHOT };

  let signal_previews: SignalPreviewLine[] = [];
  let discussion_previews: DiscussionPreviewLine[] = [];
  const activity_timeline: ActivityTimelineItem[] = [];

  try {
    const [signalsRes, postsRes] = await Promise.all([
      client
        .from("signals")
        .select(
          "id, creator_id, asset_id, direction, rationale, is_active, created_at, assets!signals_asset_id_fkey ( symbol )",
        )
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false })
        .limit(6),
      client
        .from("posts")
        .select("id, user_id, title, content, created_at")
        .eq("user_id", creatorId)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    signal_previews = ((signalsRes.data ?? []) as SignalRow[]).map((s) => ({
      id: s.id,
      symbol: signalSymbol(s),
      direction: String(s.direction ?? "HOLD"),
      thesis_snippet: (s.rationale ?? "").trim().slice(0, 120) || "Sinyal detayı kanalda.",
      access_label: s.is_active ? "Aktif" : "Kapalı",
      href: `/signals/${s.id}`,
    }));

    discussion_previews = ((postsRes.data ?? []) as PostRow[]).map((p) => ({
      id: p.id,
      label: (p.title ?? p.content ?? "Gönderi").trim().slice(0, 72),
      sub: "Kanal gönderisi",
      href: `/post/${p.id}`,
    }));

    for (const s of (signalsRes.data ?? []) as SignalRow[]) {
      activity_timeline.push({
        id: `sig-${s.id}`,
        at: String(s.created_at ?? ""),
        title: `${signalSymbol(s)} ${String(s.direction ?? "")}`.trim(),
        sub: "Yeni sinyal",
        href: `/signals/${s.id}`,
      });
    }
    for (const p of (postsRes.data ?? []) as PostRow[]) {
      activity_timeline.push({
        id: `post-${p.id}`,
        at: p.created_at,
        title: (p.title ?? p.content ?? "Gönderi").trim().slice(0, 64),
        sub: "Gönderi yayınlandı",
        href: `/post/${p.id}`,
      });
    }
    activity_timeline.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  } catch (e) {
    console.warn("[subscriptions] fetchCreatorDetailEnrichment", e);
  }

  let strategy_summary = "Strateji özeti kanal ve sinyaller sekmesinde.";
  if (snapshot.active_signals >= 3) strategy_summary = "Aktif sinyal masası — çoklu varlık çağrıları";
  else if (snapshot.posts >= 5) strategy_summary = "Düzenli içerik ve tartışma akışı";

  return {
    snapshot,
    signal_previews,
    discussion_previews,
    activity_timeline: activity_timeline.slice(0, 8),
    strategy_summary,
  };
}

export function hasVisibleIntel(intel: CreatorEconomyIntel): boolean {
  return Object.values(intel).some((v) => typeof v === "string" && v.trim().length > 0);
}
