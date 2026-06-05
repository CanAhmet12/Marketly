import type { SupabaseClient } from "@supabase/supabase-js";

import type { ChannelSignal } from "@/features/channel/types";
import { mapSignalsPageRowToFeedRow } from "@/features/signals/lib/map-page-row-to-feed-row";
import { normalizeSignalConfidence } from "@/features/signals/lib/normalize-signal-confidence";
import type { SignalsFeedRow, SignalsPageRow } from "@/features/signals/repository/types";

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
    result: row.result != null ? String(row.result) : null,
  };
}

function profileDisplay(p: ProfileRow | undefined): string {
  if (!p) return "Analist";
  return p.full_name?.trim() || p.username?.trim() || "Analist";
}

/** `/signals` katalog beslemesi — signals + assets + profiles. */
export async function fetchSignalsFeed(client: SupabaseClient, limit = 120): Promise<SignalsFeedRow[]> {
  try {
    const { data, error } = await client
      .from("signals")
      .select(
        `
        id, creator_id, asset_id, direction, confidence, entry_price, target_price, stop_loss,
        timeframe, rationale, is_active, copies_count, likes_count, created_at, result,
        assets!signals_asset_id_fkey ( symbol, name, category )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      if (error.code === "42P01") {
        console.warn("[signals] signals tablosu yok");
        return [];
      }
      console.warn("[signals] fetchSignalsFeed", error.message);
      return [];
    }

    const rawRows = (data ?? []) as Record<string, unknown>[];
    if (!rawRows.length) return [];

    const creatorIds = [...new Set(rawRows.map((r) => String(r.creator_id)))];
    const profileMap = new Map<string, ProfileRow>();

    const { data: profiles, error: profileError } = await client
      .from("profiles")
      .select(
        "id, username, full_name, avatar_url, verified, follower_count, signal_accuracy, specialties, tier, strategy_style",
      )
      .in("id", creatorIds);

    if (profileError) {
      console.warn("[signals] fetchSignalsFeed profiles", profileError.message);
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
  } catch (e) {
    console.warn("[signals] fetchSignalsFeed", e);
    return [];
  }
}
