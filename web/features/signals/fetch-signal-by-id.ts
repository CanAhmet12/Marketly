import type { SupabaseClient } from "@supabase/supabase-js";

import { enrichSignalsFeedRows } from "@/features/signals/fetch-signals-feed";
import { mapRpcRowToSignalsFeedRow, type SignalsFeedRpcRow } from "@/features/signals/lib/map-rpc-to-feed-row";
import { mapSignalsPageRowToFeedRow } from "@/features/signals/lib/map-page-row-to-feed-row";
import { normalizeSignalResult } from "@/features/signals/domain/signal-meta";
import { normalizeSignalConfidence } from "@/features/signals/lib/normalize-signal-confidence";
import type { ChannelSignal } from "@/features/channel/types";
import type { SignalsFeedRow, SignalsPageRow } from "@/features/signals/repository/types";
import { parseRpcRows } from "@/lib/supabase/parse-rpc-rows";

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

type AssetJoin = { symbol?: string; name?: string; category?: string };

function pickJoin<T>(raw: T | T[] | null | undefined): T | null {
  if (raw == null) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function profileDisplay(p: ProfileRow | undefined): string {
  if (!p) return "Analist";
  return p.full_name?.trim() || p.username?.trim() || "Analist";
}

async function fetchSignalByIdFromRpc(
  client: SupabaseClient,
  signalId: string,
  userId: string | null,
): Promise<SignalsFeedRow | null> {
  const { data, error } = await client.rpc("get_signal_by_id", {
    p_signal_id: signalId,
    p_user_id: userId,
  });
  if (error) {
    if (error.code !== "PGRST202") console.warn("[signals] get_signal_by_id", error.message);
    return null;
  }
  const rows = parseRpcRows<SignalsFeedRpcRow>(data);
  if (!rows.length) return null;
  return mapRpcRowToSignalsFeedRow(rows[0]!);
}

async function fetchSignalByIdFromTable(
  client: SupabaseClient,
  signalId: string,
): Promise<SignalsFeedRow | null> {
  const { data, error } = await client
    .from("signals")
    .select(
      `
      id, creator_id, asset_id, direction, confidence, entry_price, target_price, stop_loss,
      timeframe, rationale, is_active, copies_count, likes_count, created_at, result,
      assets!signals_asset_id_fkey ( symbol, name, category )
    `,
    )
    .eq("id", signalId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.warn("[signals] fetchSignalById table", error.message);
    return null;
  }

  const row = data as Record<string, unknown>;
  const assets = pickJoin(row.assets as AssetJoin | AssetJoin[] | null);
  const base: ChannelSignal = {
    id: String(row.id),
    creator_id: String(row.creator_id),
    asset_id: String(row.asset_id ?? ""),
    symbol: assets?.symbol ?? String(row.asset_id ?? ""),
    direction: (row.direction as ChannelSignal["direction"]) ?? "HOLD",
    confidence: normalizeSignalConfidence(typeof row.confidence === "number" ? row.confidence : 3),
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

  const { data: prof } = await client
    .from("profiles")
    .select(
      "id, username, full_name, avatar_url, verified, follower_count, signal_accuracy, tier, strategy_style",
    )
    .eq("id", base.creator_id)
    .maybeSingle();

  const p = prof as ProfileRow | null;
  const pageRow: SignalsPageRow = {
    ...base,
    creator_display: profileDisplay(p ?? undefined),
    asset_display_name: assets?.name?.trim() || base.symbol,
    detail_href: `/signals?signal=${encodeURIComponent(base.id)}`,
  };

  return mapSignalsPageRowToFeedRow(pageRow, {
    id: base.creator_id,
    display: profileDisplay(p ?? undefined),
    avatar_url: p?.avatar_url ?? null,
    verified: Boolean(p?.verified),
    follower_count: p?.follower_count ?? 0,
    accuracy: p?.signal_accuracy ?? null,
    specialties: p?.specialties ?? null,
    tier: p?.tier ?? "free",
    strategy_style: p?.strategy_style ?? null,
  });
}

/** Tek sinyal — RPC (arşiv dahil) veya tablo fallback + sparkline zenginleştirme */
export async function fetchSignalById(
  client: SupabaseClient,
  signalId: string,
  userId: string | null = null,
): Promise<SignalsFeedRow | null> {
  const mapped = (await fetchSignalByIdFromRpc(client, signalId, userId))
    ?? (await fetchSignalByIdFromTable(client, signalId));
  if (!mapped) return null;
  const [enriched] = await enrichSignalsFeedRows(client, [mapped]);
  return enriched ?? null;
}
