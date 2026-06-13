import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AssetDiscussionItem,
  AssetMediaItem,
  AssetThesisThreadRow,
} from "@/features/markets/types/asset-intelligence";

export type AssetSymbolCommunityLive = {
  discussions: AssetDiscussionItem[];
  media: AssetMediaItem[];
  thesisThreads: AssetThesisThreadRow[];
};

type ProfileJoin = {
  username?: string;
  full_name?: string;
  avatar_url?: string | null;
  verified?: boolean;
  tier?: string;
};

type RawPostRow = {
  id: string;
  user_id: string;
  type: string | null;
  title: string | null;
  content: string | null;
  thumbnail_url: string | null;
  created_at: string;
  views_count: number | null;
  likes_count: number | null;
  comments_count: number | null;
  asset_tag: string | null;
  profiles?: unknown;
};

const POST_SELECT = `
  id, user_id, type, title, content, thumbnail_url, created_at, views_count, likes_count, comments_count, asset_tag,
  profiles!posts_user_id_fkey ( username, full_name, avatar_url, verified, tier )
`;

function symKey(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/^#/, "");
}

function pickProfile(profiles: unknown): ProfileJoin | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return (profiles[0] as ProfileJoin) ?? null;
  return profiles as ProfileJoin;
}

function readCount(row: RawPostRow, key: "likes_count" | "comments_count"): number {
  const v = row[key];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function sentimentFromContent(content: string, changeHint?: number): AssetDiscussionItem["sentiment"] {
  const t = content.toLowerCase();
  if (/yüksel|bull|long|alım|breakout|pump/.test(t)) return "bullish";
  if (/düş|bear|short|satım|dump|breakdown/.test(t)) return "bearish";
  if (changeHint != null) {
    if (changeHint >= 1) return "bullish";
    if (changeHint <= -1) return "bearish";
  }
  return "neutral";
}

function discussionKind(index: number): AssetDiscussionItem["kind"] {
  const kinds: AssetDiscussionItem["kind"][] = [
    "thesis",
    "update",
    "debate",
    "macro",
    "signal_followup",
    "quote",
  ];
  return kinds[index % kinds.length]!;
}

function mapDiscussion(row: RawPostRow, symbol: string, index: number, changeHint?: number): AssetDiscussionItem {
  const prof = pickProfile(row.profiles);
  const username = prof?.username ?? "creator";
  const display = prof?.full_name?.trim() || username;
  const contentRaw = row.content ?? "";
  const title = row.title?.trim();
  const content = title ? `${title} — ${contentRaw}` : contentRaw;
  const kind = discussionKind(index);
  const sentiment = sentimentFromContent(content, changeHint);

  return {
    id: row.id,
    creatorId: row.user_id,
    creatorDisplay: display,
    creatorUsername: username,
    avatarUrl: prof?.avatar_url ?? null,
    verified: Boolean(prof?.verified),
    content: content.slice(0, 280) + (content.length > 280 ? "…" : ""),
    sentiment,
    likes: readCount(row, "likes_count"),
    replies: readCount(row, "comments_count"),
    tags: [symKey(symbol), prof?.tier ?? "community"].filter(Boolean),
    createdAt: row.created_at,
    href: `/post/${row.id}`,
    kind,
    threadTitle:
      kind === "thesis"
        ? `${symKey(symbol)} · tez`
        : kind === "debate"
          ? `${symKey(symbol)} · tartışma`
          : null,
    live: row.type === "live",
    creatorReplied: readCount(row, "comments_count") > 0,
    convictionReactions: readCount(row, "likes_count"),
    thesisFollowers: readCount(row, "comments_count"),
    trackingCount: typeof row.views_count === "number" ? row.views_count : 0,
  };
}

function mapMedia(row: RawPostRow, symbol: string, index: number): AssetMediaItem {
  const prof = pickProfile(row.profiles);
  const display = prof?.full_name?.trim() || prof?.username || "Creator";
  const kind = row.type === "short" ? "short" : row.type === "live" ? "live" : "video";
  const views = typeof row.views_count === "number" ? row.views_count : 0;
  const viewsLabel =
    views >= 1_000_000
      ? `${(views / 1_000_000).toFixed(1)}M izlenme`
      : views >= 1000
        ? `${(views / 1000).toFixed(1)}K izlenme`
        : `${views} izlenme`;
  const intents = ["Makro özet", "Pulse kesiti", "Üretici yorum", "Seans recap"];

  return {
    id: row.id,
    title: row.title ?? `${symKey(symbol)} · ${kind === "short" ? "Short" : kind === "live" ? "Canlı" : "Analiz"}`,
    kind,
    durationLabel: kind === "live" ? "CANLI" : null,
    creatorDisplay: display,
    thumbnailUrl: row.thumbnail_url,
    viewsLabel,
    href: kind === "live" ? "/live" : `/watch/${row.id}`,
    editorialIntent: intents[index % intents.length],
  };
}

function buildThesisThreads(discussions: AssetDiscussionItem[], symbol: string): AssetThesisThreadRow[] {
  const key = symKey(symbol);
  const pool =
    discussions.filter((d) => d.kind === "thesis" || d.kind === "debate").length >= 2
      ? discussions.filter((d) => d.kind === "thesis" || d.kind === "debate")
      : discussions.slice(0, 4);

  return pool.slice(0, 6).map((d, i) => ({
    id: `th-${d.id}`,
    title: d.threadTitle ?? `${key} · ${d.content.slice(0, 56)}${d.content.length > 56 ? "…" : ""}`,
    stance:
      d.sentiment === "bullish" ? "bullish" : d.sentiment === "bearish" ? "bearish" : i % 2 === 0 ? "mixed" : "neutral",
    participantCount: Math.max(1, d.replies + 1),
    lastActivityAt: d.createdAt,
    intensity: Math.min(100, 24 + d.likes + d.replies * 3),
    href: d.href,
    trending: i === 0,
  }));
}

async function queryPostsByAssetTag(client: SupabaseClient, key: string, limit: number): Promise<RawPostRow[]> {
  const { data, error } = await client
    .from("posts")
    .select(POST_SELECT)
    .or(`asset_tag.ilike.${key},asset_tag.ilike.#${key}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[markets] fetchAssetSymbolCommunity asset_tag", error.message);
    return [];
  }
  return (data ?? []) as RawPostRow[];
}

async function queryPostsByContent(client: SupabaseClient, key: string, limit: number): Promise<RawPostRow[]> {
  const { data, error } = await client
    .from("posts")
    .select(POST_SELECT)
    .or(`content.ilike.%${key}%,title.ilike.%${key}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[markets] fetchAssetSymbolCommunity content", error.message);
    return [];
  }
  return (data ?? []) as RawPostRow[];
}

/** Sembol etiketli gönderiler → tartışma + medya + tez thread (canlı B7/B8). */
export async function fetchAssetSymbolCommunity(
  client: SupabaseClient,
  symbol: string,
  changeHint?: number,
): Promise<AssetSymbolCommunityLive> {
  const key = symKey(symbol);
  if (!key) {
    return { discussions: [], media: [], thesisThreads: [] };
  }

  let rows = await queryPostsByAssetTag(client, key, 24);
  if (rows.length < 4) {
    const extra = await queryPostsByContent(client, key, 16);
    const seen = new Set(rows.map((r) => r.id));
    for (const row of extra) {
      if (!seen.has(row.id)) {
        rows.push(row);
        seen.add(row.id);
      }
    }
  }

  const discussions: AssetDiscussionItem[] = [];
  const media: AssetMediaItem[] = [];
  let discIdx = 0;
  let mediaIdx = 0;

  for (const row of rows) {
    const type = (row.type ?? "post").toLowerCase();
    if (type === "video" || type === "short" || type === "live") {
      media.push(mapMedia(row, key, mediaIdx++));
    } else {
      discussions.push(mapDiscussion(row, key, discIdx++, changeHint));
    }
  }

  return {
    discussions: discussions.slice(0, 8),
    media: media.slice(0, 10),
    thesisThreads: buildThesisThreads(discussions, key),
  };
}
