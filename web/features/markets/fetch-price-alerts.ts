import type { SupabaseClient } from "@supabase/supabase-js";

import { friendlyPostgrestMessage } from "@/lib/supabase/postgrest-error";

export type LivePriceAlert = {
  id: string;
  symbol: string;
  condition: "above" | "below";
  targetPrice: number;
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
  label: string;
};

function formatLabel(symbol: string, condition: string, targetPrice: number): string {
  const op = condition === "below" ? "≤" : "≥";
  const price = targetPrice.toLocaleString("tr-TR", { maximumFractionDigits: targetPrice >= 100 ? 2 : 4 });
  return `${symbol} ${op} ${price}`;
}

/** Aktif fiyat alarmları — `price_alerts` + `assets.symbol` */
export async function fetchPriceAlerts(client: SupabaseClient, userId: string): Promise<LivePriceAlert[]> {
  const { data, error } = await client
    .from("price_alerts")
    .select(
      `
      id, user_id, asset_id, condition, target_price, is_active, triggered_at, created_at,
      assets ( symbol )
    `,
    )
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(friendlyPostgrestMessage(error));
  if (!data?.length) return [];

  return (data as Record<string, unknown>[]).map((row) => {
    const assets = row.assets as { symbol?: string } | { symbol?: string }[] | null;
    const assetObj = Array.isArray(assets) ? assets[0] : assets;
    const symbol = String(assetObj?.symbol ?? row.asset_id ?? "?").toUpperCase();
    const condition = row.condition === "below" ? "below" : "above";
    const targetPrice = Number(row.target_price ?? 0);
    return {
      id: String(row.id),
      symbol,
      condition,
      targetPrice,
      isActive: Boolean(row.is_active),
      triggeredAt: row.triggered_at ? String(row.triggered_at) : null,
      createdAt: String(row.created_at ?? new Date().toISOString()),
      label: formatLabel(symbol, condition, targetPrice),
    };
  });
}

export async function deletePriceAlert(client: SupabaseClient, userId: string, alertId: string): Promise<void> {
  const { error } = await client.from("price_alerts").delete().eq("id", alertId).eq("user_id", userId);
  if (error) throw new Error(friendlyPostgrestMessage(error));
}
