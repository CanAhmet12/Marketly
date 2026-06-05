import type { SupabaseClient } from "@supabase/supabase-js";

export type PortfolioHoldingLive = {
  asset_id:      string;
  quantity:      number;
  avg_cost:      number;
  current_price: number;
  pnl:           number;
  pnl_percent:   number;
  total_value:   number;
};

/** portfolio_holdings + asset_prices JOIN → canlı portföy */
export async function fetchPortfolioHoldings(
  client: SupabaseClient,
  userId: string,
): Promise<PortfolioHoldingLive[]> {
  const { data: holdings, error } = await client
    .from("portfolio_holdings")
    .select("asset_id, quantity, avg_cost")
    .eq("user_id", userId)
    .gt("quantity", 0);

  if (error || !holdings || holdings.length === 0) return [];

  const assetIds = holdings.map((h: any) => h.asset_id);
  const { data: prices } = await client
    .from("asset_prices")
    .select("asset_id, price")
    .in("asset_id", assetIds);

  const priceMap: Record<string, number> = {};
  for (const p of prices ?? []) priceMap[p.asset_id] = p.price;

  return holdings.map((h: any): PortfolioHoldingLive => {
    const cur = priceMap[h.asset_id] ?? h.avg_cost;
    const qty = Number(h.quantity);
    const cost = Number(h.avg_cost);
    const val  = cur * qty;
    const pnl  = val - cost * qty;
    const pnlPct = cost > 0 ? (pnl / (cost * qty)) * 100 : 0;
    return {
      asset_id:      h.asset_id,
      quantity:      qty,
      avg_cost:      cost,
      current_price: cur,
      pnl:           pnl,
      pnl_percent:   pnlPct,
      total_value:   val,
    };
  });
}
