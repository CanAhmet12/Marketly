import type {
  PlaylistDetailPayload,
  PlaylistIntegrationLink,
  PlaylistIntelligence,
  PlaylistMemberRow,
  PlaylistProgressHint,
  PlaylistStructureKind,
} from "@/features/playlists/domain/types";
import type {
  PlaylistDetailFetchResult,
  PlaylistPostRow,
} from "@/features/playlists/fetch-playlist-detail";

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

function inferStructureKind(title: string, description: string, playlistId: string): PlaylistStructureKind {
  const blob = `${title} ${description}`.toLowerCase();
  if (blob.includes("premium") || blob.includes("araştırma")) return "premium_research";
  if (blob.includes("makro") || blob.includes("fed") || blob.includes("faiz")) return "macro_breakdown";
  if (blob.includes("sinyal") || blob.includes("çağrı")) return "signal_archive";
  if (blob.includes("canlı") || blob.includes("yayın")) return "live_recap";
  if (blob.includes("eğitim") || blob.includes("ders") || blob.includes("kurs")) return "educational_series";
  if (blob.includes("oda") || blob.includes("room")) return "room_linked";
  if (blob.includes("döngü") || blob.includes("cycle")) return "market_cycle";
  if (blob.includes("strateji") || blob.includes("portföy")) return "strategy_collection";
  const roll = seedInt(playlistId, "stk", 5);
  const fallbacks: PlaylistStructureKind[] = ["creator_course", "general", "strategy_collection", "signal_archive", "market_cycle"];
  return fallbacks[roll] ?? "general";
}

function buildIntelligence(
  playlistId: string,
  title: string,
  description: string,
  members: PlaylistPostRow[],
  visibility: string,
  ownerId: string,
): PlaylistIntelligence {
  const tags = new Set<string>();
  for (const m of members) {
    const a = m.asset_tag?.replace(/^#/, "").trim();
    if (a) tags.add(a.toUpperCase());
  }
  const tagArr = [...tags].slice(0, 4);
  const thesis =
    tagArr.length > 0
      ? `Bu koleksiyon ${tagArr.join(" · ")} ekseninde kürasyonlanmış; canlı piyasa akışıyla birlikte okunur.`
      : "Çok varlıklı bir anlatı akışı — format ve üretici sürekliliği ön planda.";

  const intents = [
    "İzleyiciyi derinleşmeye taşımak, risk çerçevesini her bölümde yenilemek.",
    "Kısa vadeli tepkileri değil, kurulum ve teyit hattını göstermek.",
    "Makro olaylar ile teknik seviyeleri aynı zaman diliminde harmanlamak.",
  ];
  const creator_intent = intents[seedInt(ownerId, "intent", intents.length)] ?? intents[0];

  return {
    thesis,
    creator_intent,
    momentum_pct: pct(playlistId, "mom"),
    discussion_density_pct: 0,
    signal_overlap_pct: pct(playlistId, "sig"),
    market_relevance_pct: Math.min(100, tagArr.length * 22 + seedInt(playlistId, "mr", 28)),
    strategy_alignment_pct: pct(playlistId, "stg"),
    creator_continuity_pct: pct(ownerId, "cc"),
    watch_momentum_pct: pct(playlistId, "wm"),
    premium_relevance_pct: visibility === "private" ? 55 + seedInt(playlistId, "pr", 40) : 12 + seedInt(playlistId, "pr2", 30),
  };
}

function integrationLinks(ownerId: string, topSymbol: string | null): PlaylistIntegrationLink[] {
  const enc = encodeURIComponent(ownerId);
  const out: PlaylistIntegrationLink[] = [
    { kind: "discover", label: "Keşfet akışı", href: "/videos" },
    { kind: "discussion", label: "Tartışmalar", href: `/channel/${enc}?tab=discussions` },
    { kind: "room", label: "Üretici odaları", href: `/channel/${enc}?tab=rooms` },
    { kind: "signal", label: "Sinyal keşfi", href: "/signals" },
    { kind: "subscription", label: "Abonelikler", href: "/subscriptions" },
    { kind: "close_friends", label: "Yakın çevre", href: "/close-friends" },
  ];
  if (topSymbol) {
    out.splice(4, 0, { kind: "market", label: `${topSymbol} vitrin`, href: `/markets/${encodeURIComponent(topSymbol)}` });
  }
  return out;
}

function buildMemberRows(
  playlistId: string,
  items: PlaylistDetailFetchResult["items"],
  posts: PlaylistPostRow[],
  playingId: string | null | undefined,
): PlaylistMemberRow[] {
  const postById = new Map(posts.map((p) => [p.id, p]));
  const order = items.map((i) => i.video_id);
  const playingIdx = playingId ? order.indexOf(playingId) : -1;
  const nextId = playingIdx >= 0 && playingIdx < order.length - 1 ? order[playingIdx + 1] : null;

  return items.map((item, idx) => {
    const post = postById.get(item.video_id);
    const title = post?.title?.trim() || post?.content?.slice(0, 96)?.trim() || "Medya";
    const watch_href = `/watch/${encodeURIComponent(item.video_id)}?list=${encodeURIComponent(playlistId)}`;
    let continuity_label: string | null = null;
    if (playingId && item.video_id === playingId) continuity_label = "Oynatılıyor";
    else if (nextId && item.video_id === nextId) continuity_label = "Sıradaki";
    else if (playingIdx >= 0 && idx > playingIdx) continuity_label = "Liste akışı";

    let progress_hint: PlaylistProgressHint = "none";
    if ((post?.views_count ?? 0) > 1000) progress_hint = "started";

    return {
      rank: idx + 1,
      post_id: item.video_id,
      title,
      type_label: (post?.type ?? "video").toUpperCase(),
      asset_tag: post?.asset_tag ?? null,
      thumbnail_url: post?.thumbnail_url ?? post?.image_url ?? null,
      watch_href,
      discussion_linked: false,
      signal_linked: false,
      continuity_label,
      progress_hint,
    };
  });
}

export function buildPlaylistDetailFromLive(
  data: PlaylistDetailFetchResult,
  viewerId: string | null,
  playingId?: string | null,
): PlaylistDetailPayload {
  const { playlist, owner, items, posts } = data;
  const members = items
    .map((i) => posts.find((p) => p.id === i.video_id))
    .filter(Boolean) as PlaylistPostRow[];

  const structure_kind = inferStructureKind(playlist.title, playlist.description ?? "", playlist.id);
  const intel = buildIntelligence(
    playlist.id,
    playlist.title,
    playlist.description ?? "",
    members,
    playlist.visibility,
    playlist.user_id,
  );

  const topSymbol = members.map((m) => m.asset_tag?.replace(/^#/, "").toUpperCase()).filter(Boolean)[0] ?? null;
  const owner_display = owner.full_name?.trim() || owner.username?.trim() || playlist.user_id;
  const access = playlist.visibility === "private" && viewerId !== playlist.user_id ? ("locked" as const) : ("full" as const);
  const locked_message = access === "locked" ? "Bu koleksiyon özel — erişim üretici tarafından sınırlı." : null;
  const cover = members.find((m) => m.thumbnail_url || m.image_url);

  return {
    id: playlist.id,
    title: playlist.title,
    description: playlist.description ?? "",
    visibility: playlist.visibility,
    video_count: playlist.video_count ?? members.length,
    updated_at: playlist.updated_at,
    cover_thumbnail_url: cover?.thumbnail_url ?? cover?.image_url ?? null,
    owner_id: playlist.user_id,
    owner_display,
    owner_channel_href: `/channel/${encodeURIComponent(playlist.user_id)}`,
    access,
    locked_message,
    structure_kind,
    structure_label: STRUCTURE_LABELS[structure_kind],
    intelligence: intel,
    integration_links: integrationLinks(playlist.user_id, topSymbol),
    discovery_rows: [],
    member_rows: access === "full" ? buildMemberRows(playlist.id, items, posts, playingId ?? null) : [],
    continuation_summary:
      playingId && items.some((i) => i.video_id === playingId)
        ? "Şu anki medya listenin içinde — sıradaki öneri otomatik hizalanır."
        : "Listenin başından veya kaldığın bölümden devam edebilirsin.",
    recommendation_confidence_hint: members.length > 0 ? "Canlı liste — izleme geçmişiyle güven artar." : "Liste boş — üye ekleyin.",
    engagement_line:
      members.length > 0
        ? `${members.length} medya · canlı kürasyon`
        : "Henüz medya eklenmemiş.",
    sparse_reason: members.length === 0 ? "no_members" : "none",
    library_hints:
      viewerId === playlist.user_id
        ? {
            positioning_line: "Studio → Listeler üzerinden vitrin sırasını güncel tut.",
            premium_visibility_line: "Özel listeler abonelik öncesi önizleme için uygundur.",
            grouping_line: "Benzer temalı listeleri aynı üretici altında gruplayın.",
          }
        : null,
  };
}
