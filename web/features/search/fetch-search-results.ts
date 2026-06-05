import type { SupabaseClient } from "@supabase/supabase-js";

import type { SearchAssetHit, SearchChannelHit, SearchPostHit, SearchResultBundle, SearchSignalHit } from "./types";
import { isMockDataEnabled } from "@/mock/config";
import { mockSearchResults } from "@/mock/adapters/search";

/** ILIKE deseninde % ve _ kaçınır; uzunluk sınırı */
export function searchIlikePattern(raw: string): string {
  const t = raw.trim().slice(0, 72).replace(/%/g, "").replace(/_/g, " ");
  if (!t) return "";
  return `%${t}%`;
}

function isVideoLikeType(t: string | null): boolean {
  const x = (t ?? "").toLowerCase();
  return x === "video";
}
function isPulseType(t: string | null): boolean {
  const x = (t ?? "").toLowerCase();
  return x === "short" || x === "pulse";
}
function isLiveType(t: string | null): boolean {
  return (t ?? "").toLowerCase() === "live";
}

async function fetchPostsByIlike(
  client: SupabaseClient,
  pat: string,
  limit: number,
): Promise<SearchPostHit[]> {
  const sel =
    "id, user_id, type, content, title, thumbnail_url, image_url, created_at, likes, comments, asset_tag";

  const [byContent, byTitle] = await Promise.all([
    client
      .from("posts")
      .select(sel)
      .ilike("content", pat)
      .order("created_at", { ascending: false })
      .limit(limit),
    client
      .from("posts")
      .select(sel)
      .ilike("title", pat)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  if (byContent.error && byContent.error.code !== "42P01") {
    console.warn("[search] posts content", byContent.error.message);
  }
  if (byTitle.error && byTitle.error.code !== "42P01") {
    console.warn("[search] posts title", byTitle.error.message);
  }

  const mapRow = (r: Record<string, unknown>): SearchPostHit => ({
    id: String(r.id),
    user_id: String(r.user_id),
    type: r.type != null ? String(r.type) : null,
    content: String(r.content ?? ""),
    title: r.title != null ? String(r.title) : null,
    thumbnail_url: r.thumbnail_url != null ? String(r.thumbnail_url) : null,
    image_url: r.image_url != null ? String(r.image_url) : null,
    created_at: String(r.created_at ?? ""),
    likes: typeof r.likes === "number" ? r.likes : 0,
    comments: typeof r.comments === "number" ? r.comments : 0,
    views_count: typeof r.views_count === "number" ? r.views_count : 0,
    duration: typeof r.duration === "number" ? r.duration : null,
    asset_tag: r.asset_tag != null ? String(r.asset_tag) : null,
    author_name: "Kullanıcı",
    author_handle: "@user",
    author_avatar: null,
  });

  const seen = new Set<string>();
  const out: SearchPostHit[] = [];
  for (const row of [...(byContent.data ?? []), ...(byTitle.data ?? [])]) {
    const id = String((row as { id: string }).id);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(mapRow(row as Record<string, unknown>));
    if (out.length >= limit) break;
  }
  return out;
}

async function enrichPostsWithAuthors(
  client: SupabaseClient,
  posts: SearchPostHit[],
): Promise<SearchPostHit[]> {
  const ids = [...new Set(posts.map((p) => p.user_id).filter(Boolean))].slice(0, 48);
  if (!ids.length) return posts;

  const { data, error } = await client
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", ids);

  if (error?.code === "42P01" || !data?.length) return posts;

  const byId = new Map(
    data.map((row) => {
      const r = row as { id: string; username?: string; full_name?: string | null; avatar_url?: string | null };
      return [
        String(r.id),
        {
          name: r.full_name?.trim() || r.username || "Kullanıcı",
          handle: `@${r.username ?? "user"}`,
          avatar: r.avatar_url ?? null,
        },
      ] as const;
    }),
  );

  return posts.map((p) => {
    const prof = byId.get(p.user_id);
    if (!prof) return p;
    return {
      ...p,
      author_name: prof.name,
      author_handle: prof.handle,
      author_avatar: prof.avatar,
    };
  });
}

async function fetchProfilesSearch(
  client: SupabaseClient,
  pat: string,
  limit: number,
): Promise<SearchChannelHit[]> {
  const selSafe = "id, username, full_name, avatar_url, bio, follower_count, tier";
  const [u2, f2] = await Promise.all([
    client.from("profiles").select(selSafe).ilike("username", pat).limit(limit),
    client.from("profiles").select(selSafe).ilike("full_name", pat).limit(limit),
  ]);

  if (u2.error?.code === "42P01" || f2.error?.code === "42P01") return [];

  if (u2.error?.code === "42703" || f2.error?.code === "42703") {
    const narrowSel = "id, username, full_name, avatar_url, tier";
    const [nu, nf] = await Promise.all([
      client.from("profiles").select(narrowSel).ilike("username", pat).limit(limit),
      client.from("profiles").select(narrowSel).ilike("full_name", pat).limit(limit),
    ]);
    const seenN = new Set<string>();
    const outN: SearchChannelHit[] = [];
    for (const row of [...(nu.data ?? []), ...(nf.data ?? [])]) {
      const r = row as Record<string, unknown>;
      const id = String(r.id);
      if (seenN.has(id)) continue;
      seenN.add(id);
      outN.push({
        id,
        username: String(r.username ?? "user"),
        full_name: r.full_name != null ? String(r.full_name) : null,
        avatar_url: r.avatar_url != null ? String(r.avatar_url) : null,
        bio: null,
        follower_count: 0,
        tier: String(r.tier ?? "free"),
        verified: false,
        signal_accuracy: null,
        specialties: null,
        strategy_style: null,
      });
      if (outN.length >= limit) break;
    }
    return outN;
  }

  if (u2.error || f2.error) {
    console.warn("[search] profiles", u2.error?.message ?? f2.error?.message);
    return [];
  }

  const seen = new Set<string>();
  const out: SearchChannelHit[] = [];
  for (const row of [...(u2.data ?? []), ...(f2.data ?? [])]) {
    const r = row as Record<string, unknown>;
    const id = String(r.id);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      username: String(r.username ?? "user"),
      full_name: r.full_name != null ? String(r.full_name) : null,
      avatar_url: r.avatar_url != null ? String(r.avatar_url) : null,
      bio: r.bio != null ? String(r.bio) : null,
      follower_count: typeof r.follower_count === "number" ? r.follower_count : 0,
      tier: String(r.tier ?? "free"),
      verified: Boolean(r.verified),
      signal_accuracy: typeof r.signal_accuracy === "number" ? r.signal_accuracy : null,
      specialties: null,
      strategy_style: null,
    });
    if (out.length >= limit) break;
  }
  return out;
}

async function fetchAssetsSearch(client: SupabaseClient, pat: string, limit: number): Promise<SearchAssetHit[]> {
  const sel = "id, symbol, name";
  const [a, b] = await Promise.all([
    client.from("assets").select(sel).ilike("symbol", pat).limit(limit),
    client.from("assets").select(sel).ilike("name", pat).limit(limit),
  ]);

  if (a.error?.code === "42P01" || b.error?.code === "42P01") {
    console.warn("[search] assets tablosu yok veya erişilemiyor");
    return [];
  }
  if (a.error) console.warn("[search] assets symbol", a.error.message);
  if (b.error) console.warn("[search] assets name", b.error.message);

  const seen = new Set<string>();
  const out: SearchAssetHit[] = [];
  for (const row of [...(a.data ?? []), ...(b.data ?? [])]) {
    const r = row as Record<string, unknown>;
    const id = String(r.id);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      symbol: String(r.symbol ?? ""),
      name: r.name != null ? String(r.name) : null,
    });
    if (out.length >= limit) break;
  }
  return out;
}

async function fetchSignalsSearch(
  client: SupabaseClient,
  pat: string,
  assetIds: string[],
  limit: number,
): Promise<SearchSignalHit[]> {
  const sel = `
    id, creator_id, asset_id, direction, confidence, timeframe, rationale, created_at,
    assets!signals_asset_id_fkey ( symbol )
  `;

  const byRationale = await client
    .from("signals")
    .select(sel)
    .ilike("rationale", pat)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (byRationale.error?.code === "42P01") {
    console.warn("[search] signals tablosu yok");
    return [];
  }

  let rationaleRows: unknown[] = (byRationale.data ?? []) as unknown[];
  if (byRationale.error) {
    console.warn("[search] signals rationale", byRationale.error.message);
    const fb = await client
      .from("signals")
      .select("id, creator_id, asset_id, direction, confidence, timeframe, rationale, created_at")
      .ilike("rationale", pat)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!fb.error) rationaleRows = (fb.data ?? []) as unknown[];
  }

  let byAssetRows: unknown[] = [];
  if (assetIds.length > 0) {
    const res1 = await client
      .from("signals")
      .select(sel)
      .in("asset_id", assetIds.slice(0, 24))
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!res1.error && res1.data) {
      byAssetRows = res1.data as unknown[];
    } else {
      if (res1.error) console.warn("[search] signals asset (join)", res1.error.message);
      const res2 = await client
        .from("signals")
        .select("id, creator_id, asset_id, direction, confidence, timeframe, rationale, created_at")
        .in("asset_id", assetIds.slice(0, 24))
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!res2.error && res2.data) byAssetRows = res2.data as unknown[];
      else if (res2.error) console.warn("[search] signals asset", res2.error.message);
    }
  }

  const seen = new Set<string>();
  const out: SearchSignalHit[] = [];

  const pushRows = (rows: unknown[]) => {
    for (const row of rows) {
      const r = row as Record<string, unknown>;
      const id = String(r.id);
      if (seen.has(id)) continue;
      seen.add(id);
      const assets = r.assets as { symbol?: string } | { symbol?: string }[] | null;
      const symRaw = Array.isArray(assets) ? assets[0]?.symbol : assets?.symbol;
      out.push({
        id,
        creator_id: String(r.creator_id),
        asset_id: String(r.asset_id ?? ""),
        symbol: symRaw != null ? String(symRaw) : String(r.asset_id ?? ""),
        direction: String(r.direction ?? ""),
        confidence: typeof r.confidence === "number" ? r.confidence : 0,
        timeframe: String(r.timeframe ?? ""),
        rationale: r.rationale != null ? String(r.rationale) : null,
        created_at: String(r.created_at ?? ""),
        creator_name: "Analist",
        creator_avatar: null,
        entry_price: typeof r.entry_price === "number" ? r.entry_price : null,
        target_price: typeof r.target_price === "number" ? r.target_price : null,
      });
      if (out.length >= limit) break;
    }
  };

  pushRows(rationaleRows);
  if (out.length < limit) pushRows(byAssetRows);

  return out.slice(0, limit);
}

/**
 * Postgres ILIKE ile sınırlı arama (Edge `supabase/functions/search` şimdilik kullanılmıyor).
 */
export async function fetchSearchResults(client: SupabaseClient, query: string): Promise<SearchResultBundle> {
  if (isMockDataEnabled()) {
    return mockSearchResults(query);
  }

  const pat = searchIlikePattern(query);
  if (!pat) {
    return { posts: [], channels: [], signals: [], markets: [], discussions: [], communities: [], creatorRooms: [], composerRefs: [] };
  }

  const [postsRaw, channels, markets] = await Promise.all([
    fetchPostsByIlike(client, pat, 40),
    fetchProfilesSearch(client, pat, 18),
    fetchAssetsSearch(client, pat, 18),
  ]);

  const signals = await fetchSignalsSearch(
    client,
    pat,
    markets.map((m) => m.id),
    20,
  );

  const posts = await enrichPostsWithAuthors(client, postsRaw);

  return { posts, channels, signals, markets, discussions: [], communities: [], creatorRooms: [], composerRefs: [] };
}

export function splitPostsByKind(posts: SearchPostHit[]): {
  videos: SearchPostHit[];
  pulsePosts: SearchPostHit[];
  livePosts: SearchPostHit[];
  textPosts: SearchPostHit[];
} {
  const videos: SearchPostHit[] = [];
  const pulsePosts: SearchPostHit[] = [];
  const livePosts: SearchPostHit[] = [];
  const textPosts: SearchPostHit[] = [];
  for (const p of posts) {
    if (isVideoLikeType(p.type)) videos.push(p);
    else if (isPulseType(p.type)) pulsePosts.push(p);
    else if (isLiveType(p.type)) livePosts.push(p);
    else textPosts.push(p);
  }
  return { videos, pulsePosts, livePosts, textPosts };
}
