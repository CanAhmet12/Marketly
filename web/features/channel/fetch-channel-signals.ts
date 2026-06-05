import type { SupabaseClient } from "@supabase/supabase-js";

import type { ChannelSignal } from "./types";
import { isMockDataEnabled } from "@/mock/config";
import { mockChannelSignals } from "@/mock/adapters/channel";

/** Mobil `useSignals` ile aynı tablo ve join FK’leri */
export async function fetchChannelSignals(
  client: SupabaseClient,
  creatorId: string,
  limit = 40,
): Promise<ChannelSignal[]> {
  if (isMockDataEnabled()) {
    return mockChannelSignals(creatorId);
  }

  try {
    const { data, error } = await client
      .from("signals")
      .select(
        `
        id, creator_id, asset_id, direction, confidence, entry_price, target_price, stop_loss,
        timeframe, rationale, is_active, copies_count, likes_count, created_at, result,
        assets!signals_asset_id_fkey ( symbol )
      `,
      )
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      if (error.code === "42P01") {
        console.warn("[channel] signals tablosu yok");
        return [];
      }
      console.warn("[channel] fetchChannelSignals", error.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => {
      const assetsRaw = row.assets as { symbol?: string } | { symbol?: string }[] | null;
      const assets = Array.isArray(assetsRaw) ? assetsRaw[0] : assetsRaw;
      return {
        id: String(row.id),
        creator_id: String(row.creator_id),
        asset_id: String(row.asset_id ?? ""),
        symbol: assets?.symbol ?? String(row.asset_id ?? ""),
        direction: (row.direction as ChannelSignal["direction"]) ?? "HOLD",
        confidence: typeof row.confidence === "number" ? row.confidence : 3,
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
    });
  } catch (e) {
    console.warn("[channel] fetchChannelSignals", e);
    return [];
  }
}
