import type { SupabaseClient } from "@supabase/supabase-js";

import type { ChannelSignal } from "@/features/channel/types";
import { fetchSparklinesForSymbols } from "@/features/signals/fetch-signal-sparklines";
import { applyCopies24hToFeedRows } from "@/features/signals/lib/apply-copies-24h-to-feed";
import { applySparklinesToFeedRows } from "@/features/signals/lib/apply-sparklines-to-feed";
import { mapRpcRowToSignalsFeedRow, type SignalsFeedRpcRow } from "@/features/signals/lib/map-rpc-to-feed-row";
import { mapSignalsPageRowToFeedRow } from "@/features/signals/lib/map-page-row-to-feed-row";
import { normalizeSignalResult } from "@/features/signals/domain/signal-meta";
import { normalizeSignalConfidence } from "@/features/signals/lib/normalize-signal-confidence";
import type { SignalsFeedRow, SignalsPageRow } from "@/features/signals/repository/types";
import type { SignalDirectionFilter, SignalSortId } from "@/features/signals/types";
import { AlgoFlags } from "@/lib/algo-flags";
import { parseRpcRows } from "@/lib/supabase/parse-rpc-rows";

export type SignalsFeedScope = "live" | "archive";

export type SignalsFeedQuery = {
  asset?: string | null;
  direction?: SignalDirectionFilter;
  sort?: SignalSortId;
  scope?: SignalsFeedScope;
};

type RpcSort = "trending" | "personalized" | "new" | "accuracy" | "copies";

function mapSortToRpc(sort: SignalSortId | undefined, userId: string | null): RpcSort {
  if (sort === "latest") return "new";
  if (sort === "confidence") return "accuracy";
  if (sort === "trending") return userId ? "personalized" : "trending";
  return userId ? "personalized" : "trending";
}

function mapDirectionToRpc(direction: SignalDirectionFilter | undefined): string | null {
  if (direction === "buy") return "BUY";
  if (direction === "sell") return "SELL";
  if (direction === "hold") return "HOLD";
  return null;
}

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  follower_count: number | null;
  signal_accuracy: number | null;
  specialties: string[] | null;
  tier: string | null;
  strategy_style: string | null;
};

type AssetJoin = {
  symbol?: string;
  name?: string;
  category?: string;
};

function pickJoin<T>(raw: T | T[] | null | undefined): T | null {
  if (raw == null) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function mapDbRowToChannelSignal(row: Record<string, unknown>): ChannelSignal {
  const assets = pickJoin(row.assets as AssetJoin | AssetJoin[] | null);
  const rawConf = typeof row.confidence === "number" ? row.confidence : 3;
  return {
    id: String(row.id),
    creator_id: String(row.creator_id),
    asset_id: String(row.asset_id ?? ""),
    symbol: assets?.symbol ?? String(row.asset_id ?? ""),
    direction: (row.direction as ChannelSignal["direction"]) ?? "HOLD",
    confidence: normalizeSignalConfidence(rawConf),
    entry_price: row.entry_price != null ? Number(row.entry_price) : null,
    target_price: row.target_price != null ? Number(row.target_price) : null,
    stop_loss: row.stop_loss != null ? Number(row.stop_loss) : null,
    timeframe: String(row.timeframe ?? "1G"),
    rationale: row.rationale != null ? String(row.rationale) : null,
    is_active: Boolean(row.is_active ?? true),
    copies_count: typeof row.copies_count === "number" ? row.copies_count : 0,
    likes_count: typeof row.likes_count === "number" ? row.likes_count : 0,
    created_at: String(row.created_at ?? ""),
    result: normalizeSignalResult(row.result != null ? String(row.result) : null),
  };
}

function profileDisplay(p: ProfileRow | undefined): string {
  if (!p) return "Analist";
  return p.full_name?.trim() || p.username?.trim() || "Analist";
}

/** MVECF + Gaussian trend — sunucu RPC sıralaması */
async function fetchSignalsFeedFromRpc(
  client: SupabaseClient,
  limit: number,
  userId: string | null,
  query: SignalsFeedQuery = {},
): Promise<SignalsFeedRow[]> {
  const sort = mapSortToRpc(query.sort, userId);
  const asset = query.asset?.trim().toUpperCase() || null;
  const direction = mapDirectionToRpc(query.direction);

  // Tüm parametreler explicit — PostgREST PGRST203 imza çakışması önlenir
  const { data, error } = await client.rpc("get_signals_feed", {
    p_limit: limit,
    p_sort: sort,
    p_asset: asset,
    p_direction: direction,
    p_user_id: userId,
  });
  if (error) {
    console.warn("[signals] get_signals_feed RPC", error.message);
    return [];
  }
  return parseRpcRows<SignalsFeedRpcRow>(data).map(mapRpcRowToSignalsFeedRow);
}

async function fetchCopies24hBySignalId(
  client: SupabaseClient,
  signalIds: readonly string[],
): Promise<Map<string, number>> {
  if (!signalIds.length) return new Map();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await client
    .from("signal_copies")
    .select("signal_id")
    .in("signal_id", [...signalIds].slice(0, 120))
    .gte("created_at", since);

  if (error) {
    console.warn("[signals] copies_24h batch", error.message);
    return new Map();
  }

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const id = String(row.signal_id);
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

/** Sparkline + copies_24h zenginleştirme — tekil detay fetch için export */
export async function enrichSignalsFeedRows(
  client: SupabaseClient,
  rows: SignalsFeedRow[],
): Promise<SignalsFeedRow[]> {
  if (!rows.length) return rows;

  const [sparkMap, copiesMap] = await Promise.all([
    fetchSparklinesForSymbols(
      client,
      rows.flatMap((r) => [r.symbol, r.asset_id]),
    ),
    fetchCopies24hBySignalId(
      client,
      rows.map((r) => r.id),
    ),
  ]);

  let enriched = applySparklinesToFeedRows(rows, sparkMap);
  enriched = applyCopies24hToFeedRows(enriched, copiesMap);
  return enriched;
}

async function fetchSignalsFromTable(
  client: SupabaseClient,
  limit: number,
  query: SignalsFeedQuery = {},
): Promise<SignalsFeedRow[]> {
  const scope = query.scope ?? "live";
  const asset = query.asset?.trim().toUpperCase() || null;
  const direction = mapDirectionToRpc(query.direction);

  let q = client
    .from("signals")
    .select(
      `
      id, creator_id, asset_id, direction, confidence, entry_price, target_price, stop_loss,
      timeframe, rationale, is_active, copies_count, likes_count, created_at, result,
      assets!signals_asset_id_fkey ( symbol, name, category )
    `,
    )
    .eq("is_active", scope === "live")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (asset) q = q.eq("asset_id", asset);
  if (direction) q = q.eq("direction", direction);

  const { data, error } = await q;
  if (error) {
    if (error.code === "42P01") {
      console.warn("[signals] signals tablosu yok");
      return [];
    }
    console.warn("[signals] fetchSignalsFromTable", error.message);
    return [];
  }

  const rawRows = (data ?? []) as Record<string, unknown>[];
  if (!rawRows.length) return [];

  const creatorIds = [...new Set(rawRows.map((r) => String(r.creator_id)))];
  const profileMap = new Map<string, ProfileRow>();

  const { data: profiles, error: profileError } = await client
    .from("profiles")
    .select(
      "id, username, full_name, avatar_url, verified, follower_count, signal_accuracy, tier, strategy_style",
    )
    .in("id", creatorIds);

  if (profileError) {
    console.warn("[signals] fetchSignalsFromTable profiles", profileError.message);
  } else {
    for (const p of profiles ?? []) {
      profileMap.set(String(p.id), p as ProfileRow);
    }
  }

  return rawRows.map((row) => {
    const base = mapDbRowToChannelSignal(row);
    const assets = pickJoin(row.assets as AssetJoin | AssetJoin[] | null);
    const prof = profileMap.get(base.creator_id);
    const pageRow: SignalsPageRow = {
      ...base,
      creator_display: profileDisplay(prof),
      asset_display_name: assets?.name?.trim() || base.symbol,
      detail_href: `/signals?signal=${encodeURIComponent(base.id)}`,
    };
    return mapSignalsPageRowToFeedRow(pageRow, {
      id: base.creator_id,
      display: profileDisplay(prof),
      avatar_url: prof?.avatar_url ?? null,
      verified: Boolean(prof?.verified),
      follower_count: prof?.follower_count ?? 0,
      accuracy: prof?.signal_accuracy ?? null,
      specialties: prof?.specialties ?? null,
      tier: prof?.tier ?? "free",
      strategy_style: prof?.strategy_style ?? null,
    });
  });
}

/** Arşiv sinyal sayısı — boş durum CTA */
export async function fetchArchivedSignalsCount(client: SupabaseClient): Promise<number> {
  const { count, error } = await client
    .from("signals")
    .select("id", { count: "exact", head: true })
    .eq("is_active", false);
  if (error) {
    console.warn("[signals] archived count", error.message);
    return 0;
  }
  return count ?? 0;
}

/** `/signals` katalog beslemesi — RPC (algo) veya signals + assets + profiles. */
export async function fetchSignalsFeed(
  client: SupabaseClient,
  limit = 120,
  userId: string | null = null,
  query: SignalsFeedQuery = {},
): Promise<SignalsFeedRow[]> {
  const scope = query.scope ?? "live";

  if (scope === "archive") {
    const archived = await fetchSignalsFromTable(client, limit, query);
    return enrichSignalsFeedRows(client, archived);
  }

  if (AlgoFlags.signalTrendScore) {
    const rpcRows = await fetchSignalsFeedFromRpc(client, limit, userId, query);
    if (rpcRows.length > 0) return enrichSignalsFeedRows(client, rpcRows);
  }

  try {
    const mapped = await fetchSignalsFromTable(client, limit, query);
    return enrichSignalsFeedRows(client, mapped);
  } catch (e) {
    console.warn("[signals] fetchSignalsFeed", e);
    return [];
  }
}
