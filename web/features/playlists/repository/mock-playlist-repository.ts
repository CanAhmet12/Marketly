import type { StudioPlaylistItem } from "@/features/studio/repository/types";
import { getHomeRepository } from "@/features/home/repository";
import { getPersonalizationRepository } from "@/features/personalization/repository";
import { playlistContinuation } from "@/features/personalization/domain/watch-next-rank";
import { readWatchFeedbackState } from "@/features/personalization/domain/watch-feedback-store";
import { getSignalsRepository } from "@/features/signals/repository";
import { getSocialRepository } from "@/features/social/repository";
import { getStudioRepository } from "@/features/studio/repository";
import { MOCK_POST_BY_ID } from "@/mock/fixtures/posts";

import type {
  PlaylistDetailPayload,
  PlaylistDiscoveryRow,
  PlaylistIntegrationLink,
  PlaylistIntelligence,
  PlaylistLibraryHints,
  PlaylistMemberRow,
  PlaylistProgressHint,
  PlaylistStructureKind,
} from "../domain/types";
import type { PlaylistRepository } from "./playlist-repository";

function seedInt(s: string, salt: string, mod: number): number {
  const str = `${s}::${salt}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

function pct(s: string, salt: string): number {
  return seedInt(s, salt, 101);
}

const STRUCTURE_LABELS: Record<PlaylistStructureKind, string> = {
  strategy_collection: "Strateji koleksiyonu",
  macro_breakdown: "Makro kırılım",
  market_cycle: "Piyasa döngüsü",
  signal_archive: "Sinyal arşivi",
  creator_course: "Üretici kursu",
  premium_research: "Premium araştırma",
  live_recap: "Canlı özet",
  educational_series: "Eğitim serisi",
  room_linked: "Oda bağlantılı",
  general: "Kürasyon",
};

function inferStructureKind(pl: StudioPlaylistItem): PlaylistStructureKind {
  const blob = `${pl.title} ${pl.description}`.toLowerCase();
  if (blob.includes("premium") || blob.includes("araştırma")) return "premium_research";
  if (blob.includes("makro") || blob.includes("fed") || blob.includes("faiz")) return "macro_breakdown";
  if (blob.includes("sinyal") || blob.includes("çağrı")) return "signal_archive";
  if (blob.includes("canlı") || blob.includes("yayın")) return "live_recap";
  if (blob.includes("eğitim") || blob.includes("ders") || blob.includes("kurs")) return "educational_series";
  if (blob.includes("oda") || blob.includes("room")) return "room_linked";
  if (blob.includes("döngü") || blob.includes("cycle")) return "market_cycle";
  if (blob.includes("strateji") || blob.includes("portföy")) return "strategy_collection";
  const roll = seedInt(pl.id, "stk", 5);
  const fallbacks: PlaylistStructureKind[] = ["creator_course", "general", "strategy_collection", "signal_archive", "market_cycle"];
  return fallbacks[roll] ?? "general";
}

function buildIntelligence(pl: StudioPlaylistItem, members: MockPostLike[]): PlaylistIntelligence {
  const tags = new Set<string>();
  for (const m of members) {
    const a = m.asset_tag?.replace(/^#/, "").trim();
    if (a) tags.add(a.toUpperCase());
  }
  const tagArr = [...tags].slice(0, 4);
  const thesis =
    tagArr.length > 0
      ? `Bu koleksiyon ${tagArr.join(" · ")} ekseninde kürasyonlanmış; volatilite ve haber akışıyla birlikte okunur.`
      : "Çok varlıklı bir anlatı akışı — format ve üretici sürekliliği ön planda.";

  const intents = [
    "İzleyiciyi derinleşmeye taşımak, risk çerçevesini her bölümde yenilemek.",
    "Kısa vadeli tepkileri değil, kurulum ve teyit hattını göstermek.",
    "Makro olaylar ile teknik seviyeleri aynı zaman diliminde harmanlamak.",
  ];
  const creator_intent = intents[seedInt(pl.ownerId, "intent", intents.length)] ?? intents[0];

  return {
    thesis,
    creator_intent,
    momentum_pct: pct(pl.id, "mom"),
    discussion_density_pct: Math.min(100, members.length ? Math.round((members.filter((m) => m.discussion_anchor_post_id).length / members.length) * 100) : 0),
    signal_overlap_pct: pct(pl.id, "sig"),
    market_relevance_pct: Math.min(100, tagArr.length * 22 + seedInt(pl.id, "mr", 28)),
    strategy_alignment_pct: pct(pl.id, "stg"),
    creator_continuity_pct: pct(pl.ownerId, "cc"),
    watch_momentum_pct: pct(pl.id, "wm"),
    premium_relevance_pct: pl.visibility === "private" ? 55 + seedInt(pl.id, "pr", 40) : 12 + seedInt(pl.id, "pr2", 30),
  };
}

type MockPostLike = {
  id: string;
  type: string | null;
  title: string | null;
  content: string;
  asset_tag: string | null;
  thumbnail_url: string | null;
  discussion_anchor_post_id?: string | null;
  quoted_signal_id?: string | null;
  views_count?: number;
};

function resolvePost(pid: string): MockPostLike | null {
  const p = MOCK_POST_BY_ID[pid];
  return p ?? null;
}

function integrationLinks(pl: StudioPlaylistItem, topSymbol: string | null): PlaylistIntegrationLink[] {
  const enc = encodeURIComponent(pl.ownerId);
  const out: PlaylistIntegrationLink[] = [
    { kind: "discover", label: "Keşfet akışı", href: "/discover?tab=videos" },
    { kind: "discussion", label: "Tartışmalar", href: `/channel/${enc}?tab=discussions` },
    { kind: "room", label: "Üretici odaları", href: `/channel/${enc}?tab=rooms` },
    { kind: "signal", label: "Sinyal keşfi", href: "/discover?tab=signals" },
    { kind: "subscription", label: "Abonelikler", href: "/subscriptions" },
    { kind: "close_friends", label: "Yakın çevre", href: "/close-friends" },
    { kind: "notifications", label: "Bildirimler", href: "/notifications" },
  ];
  if (topSymbol) {
    out.splice(4, 0, { kind: "market", label: `${topSymbol} vitrin`, href: `/markets/${encodeURIComponent(topSymbol)}` });
  }
  return out;
}

function signalOverlapPercent(members: MockPostLike[]): number {
  const cards = getSignalsRepository().getDiscoverSignalCards(32);
  const symSet = new Set(cards.map((c) => c.symbol.replace(/^#/, "").toUpperCase()).filter(Boolean));
  if (!symSet.size || !members.length) return 0;
  let hit = 0;
  for (const m of members) {
    const a = m.asset_tag?.replace(/^#/, "").toUpperCase();
    if (a && symSet.has(a)) hit++;
  }
  return Math.min(100, Math.round((hit / members.length) * 100));
}

function buildMemberRows(
  pl: StudioPlaylistItem,
  playingId: string | null | undefined,
): PlaylistMemberRow[] {
  const wf = readWatchFeedbackState();
  const order = pl.memberPostIds;
  const play = playingId && order.includes(playingId) ? playingId : "__none__";
  const { after } = playlistContinuation(order, play);
  const nextId = after[0] ?? null;
  const playingIdx = playingId ? order.indexOf(playingId) : -1;

  return order.map((pid, idx) => {
    const post = resolvePost(pid);
    const title = post?.title?.trim() || post?.content?.slice(0, 96)?.trim() || "Medya";
    const watch_href = `/watch/${encodeURIComponent(pid)}?list=${encodeURIComponent(pl.id)}`;
    let continuity_label: string | null = null;
    if (playingId && pid === playingId) continuity_label = "Oynatılıyor";
    else if (nextId && pid === nextId) continuity_label = "Sıradaki";
    else if (playingIdx >= 0 && idx > playingIdx) continuity_label = "Liste akışı";

    let progress_hint: PlaylistProgressHint = "none";
    if (wf.morePostIds.includes(pid)) progress_hint = "more_signal";
    else if ((post?.views_count ?? 0) > 40000 && seedInt(pid, "ph", 2) === 0) progress_hint = "started";

    return {
      rank: idx + 1,
      post_id: pid,
      title,
      type_label: (post?.type ?? "video").toUpperCase(),
      asset_tag: post?.asset_tag ?? null,
      thumbnail_url: post?.thumbnail_url ?? null,
      watch_href,
      discussion_linked: Boolean(post?.discussion_anchor_post_id),
      signal_linked: Boolean(post?.quoted_signal_id),
      continuity_label,
      progress_hint,
    };
  });
}

export class MockPlaylistRepository implements PlaylistRepository {
  getPlaylistDetail(playlistId: string, viewerId: string | null, playingId?: string | null): PlaylistDetailPayload | null {
    const pl = getStudioRepository().getPlaylistById(playlistId);
    if (!pl) return null;

    const members = pl.memberPostIds.map((id) => resolvePost(id)).filter(Boolean) as MockPostLike[];
    const structure_kind = inferStructureKind(pl);
    const intel = buildIntelligence(pl, members);
    intel.signal_overlap_pct = signalOverlapPercent(members);

    const topSymbol = members.map((m) => m.asset_tag?.replace(/^#/, "").toUpperCase()).filter(Boolean)[0] ?? null;

    const profile = getSocialRepository().getParticipantProfile(pl.ownerId);
    const owner_display = profile?.full_name?.trim() || profile?.username || pl.ownerId;

    const access = pl.visibility === "private" && viewerId !== pl.ownerId ? ("locked" as const) : ("full" as const);
    const locked_message = access === "locked" ? "Bu koleksiyon özel — erişim üretici tarafından sınırlı." : null;

    const snap = getPersonalizationRepository().getRecommendationAdaptationSnapshot(viewerId);
    const engagement_line =
      members.filter((m) => m.discussion_anchor_post_id).length > 0
        ? "Tartışma bağlantılı bölümler bu listede yoğunlaşıyor."
        : "İzleme sürekliliği için üretici binge akışına uyumlu sıralama.";

    const continuation_summary =
      playingId && pl.memberPostIds.includes(playingId)
        ? "Şu anki medya listenin içinde — sıradaki öneri otomatik hizalanır."
        : "Listenin başından veya kaldığın bölümden devam edebilirsin.";

    const library_hints: PlaylistLibraryHints | null =
      viewerId === pl.ownerId
        ? {
            positioning_line: "Studio → Listeler üzerinden vitrin sırasını ve kapak görselini güncel tut.",
            premium_visibility_line: "Özel listeler abonelik öncesi önizleme için uygundur.",
            grouping_line: "Benzer temalı listeleri aynı üretici altında gruplayarak arşiv okunabilirliğini artırın.",
          }
        : null;

    return {
      id: pl.id,
      title: pl.title,
      description: pl.description,
      visibility: pl.visibility,
      video_count: pl.videoCount,
      updated_at: pl.updatedAt,
      cover_thumbnail_url: pl.coverThumbnailUrl,
      owner_id: pl.ownerId,
      owner_display,
      owner_channel_href: `/channel/${encodeURIComponent(pl.ownerId)}`,
      access,
      locked_message,
      structure_kind,
      structure_label: STRUCTURE_LABELS[structure_kind],
      intelligence: intel,
      integration_links: integrationLinks(pl, topSymbol),
      discovery_rows: this.getRecommendedPlaylists(viewerId, 8),
      member_rows: access === "full" ? buildMemberRows(pl, playingId ?? null) : [],
      continuation_summary,
      recommendation_confidence_hint: snap.coldData ? "Soğuk veri — liste tamamlandıkça güven bandı yükselir." : `Öneri güveni ~%${Math.round(snap.overallConfidence * 100)} · keşif %${Math.round(snap.explorationShare * 100)}`,
      engagement_line,
      sparse_reason: pl.memberPostIds.length === 0 ? "no_members" : "none",
      library_hints,
    };
  }

  getRecommendedPlaylists(viewerId: string | null, limit: number): PlaylistDiscoveryRow[] {
    const creators = getHomeRepository().getRecommendedCreators().slice(0, 8);
    const out: PlaylistDiscoveryRow[] = [];
    const seen = new Set<string>();
    const offset = viewerId ? seedInt(viewerId, "plrec", 7) : 0;
    let i = 0;
    for (const c of creators) {
      const lists = getStudioRepository().getPlaylists(c.id);
      for (const pl of lists) {
        if (seen.has(pl.id)) continue;
        seen.add(pl.id);
        const badgeRoll = (offset + i) % 4;
        const badges = ["Yükselen", "Strateji", "Makro", "Premium"];
        out.push({
          id: pl.id,
          title: pl.title,
          subtitle: `${pl.videoCount} medya · ${STRUCTURE_LABELS[inferStructureKind(pl)]}`,
          href: `/playlist/${encodeURIComponent(pl.id)}`,
          badge: badgeRoll === 3 ? badges[3] : badges[badgeRoll],
          cover_thumbnail_url: pl.coverThumbnailUrl,
        });
        i++;
        if (out.length >= limit) return out;
      }
    }
    return out;
  }

  recordPlaylistView(playlistId: string, viewerId: string | null): void {
    const pl = getStudioRepository().getPlaylistById(playlistId);
    if (!pl) return;
    const p = getPersonalizationRepository();
    p.recordInteraction({
      kind: "creator_view",
      creatorId: pl.ownerId,
      quality: 0.42,
      surface: `playlist:${playlistId}`,
      contentFormat: "video",
    });
    if (viewerId) {
      p.recordAdaptiveLearning({ type: "positive_creator", creatorId: pl.ownerId });
    }
  }
}
