import type { SupabaseClient } from "@supabase/supabase-js";

export type PortfolioHoldingLive = {
  id?: string;
  asset_id: string;
  symbol?: string | null;
  name?: string | null;
  category?: string | null;
  quantity: number;
  avg_cost: number;
  current_price: number;
  pnl: number;
  pnl_percent: number;
  total_value: number;
};

/** portfolio_holdings + asset_prices JOIN → canlı portföy */
export async function fetchPortfolioHoldings(
  client: SupabaseClient,
  userId: string,
): Promise<PortfolioHoldingLive[]> {
  const { data: holdings, error } = await client
    .from("portfolio_holdings")
    .select("id, asset_id, symbol, name, quantity, avg_cost")
    .eq("user_id", userId)
    .gt("quantity", 0);

  if (error || !holdings || holdings.length === 0) return [];

  const assetIds = holdings.map((h: any) => h.asset_id);
  const [{ data: prices }, { data: assetMeta }] = await Promise.all([
    client.from("asset_prices").select("asset_id, price").in("asset_id", assetIds),
    client.from("assets").select("id, symbol, name, category").in("id", assetIds),
  ]);

  const priceMap: Record<string, number> = {};
  for (const p of prices ?? []) priceMap[p.asset_id] = p.price;

  const metaMap: Record<string, { symbol: string; name: string; category: string | null }> = {};
  for (const a of assetMeta ?? []) {
    metaMap[String(a.id)] = {
      symbol: String(a.symbol),
      name: String(a.name),
      category: a.category != null ? String(a.category) : null,
    };
  }

  return holdings.map((h: any): PortfolioHoldingLive => {
    const meta = metaMap[String(h.asset_id)];
    const cur = priceMap[h.asset_id] ?? h.avg_cost;
    const qty = Number(h.quantity);
    const cost = Number(h.avg_cost);
    const val = cur * qty;
    const pnl = val - cost * qty;
    const pnlPct = cost > 0 ? (pnl / (cost * qty)) * 100 : 0;
    return {
      id: h.id != null ? String(h.id) : undefined,
      asset_id: String(h.asset_id),
      symbol: h.symbol != null ? String(h.symbol) : (meta?.symbol ?? null),
      name: h.name != null ? String(h.name) : (meta?.name ?? null),
      category: meta?.category ?? null,
      quantity: qty,
      avg_cost: cost,
      current_price: cur,
      pnl,
      pnl_percent: pnlPct,
      total_value: val,
    };
  });
}
