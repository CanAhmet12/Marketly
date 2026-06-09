import type { SupabaseClient } from "@supabase/supabase-js";

export type UpsertPortfolioHoldingInput = {
  assetId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
};

export type UpsertPortfolioHoldingResult = { ok: true } | { ok: false; error: string };

/** Varlık ekle veya mevcut pozisyonu güncelle (user_id + asset_id). */
export async function upsertPortfolioHolding(
  client: SupabaseClient,
  userId: string,
  input: UpsertPortfolioHoldingInput,
): Promise<UpsertPortfolioHoldingResult> {
  const assetId = input.assetId.trim().toUpperCase();
  if (!assetId || input.quantity <= 0 || input.avgCost <= 0) {
    return { ok: false, error: "Geçersiz miktar veya maliyet." };
  }

  const payload = {
    user_id: userId,
    asset_id: assetId,
    symbol: input.symbol.trim().toUpperCase() || assetId,
    name: input.name.trim() || assetId,
    quantity: input.quantity,
    avg_cost: input.avgCost,
  };

  const { data: existing, error: findErr } = await client
    .from("portfolio_holdings")
    .select("id")
    .eq("user_id", userId)
    .eq("asset_id", assetId)
    .maybeSingle();

  if (findErr) {
    return { ok: false, error: findErr.message };
  }

  if (existing?.id) {
    const { error } = await client
      .from("portfolio_holdings")
      .update({ quantity: payload.quantity, avg_cost: payload.avg_cost, symbol: payload.symbol, name: payload.name })
      .eq("id", existing.id)
      .eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const { error } = await client.from("portfolio_holdings").insert(payload);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
