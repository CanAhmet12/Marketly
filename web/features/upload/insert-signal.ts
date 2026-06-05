import type { SupabaseClient } from "@supabase/supabase-js";
import { friendlyPostgrestMessage } from "@/lib/supabase/postgrest-error";
import { isWebWriteEnabled, WEB_WRITE_BLOCKED_MESSAGE } from "@/lib/supabase/write-guard";

export type InsertSignalArgs = {
  /** Auth user id — sadece kendi creator_id ile yazabilir (RLS: auth.uid() = creator_id) */
  userId:      string;
  /** Varlık sembolü (BTC, AAPL…) — signals.asset_id */
  assetId:     string;
  /** BUY | SELL | HOLD */
  direction:   "BUY" | "SELL" | "HOLD";
  entryPrice:  number | null;
  targetPrice: number | null;
  stopLoss:    number | null;
  /** 0-100 arası konviksiyon */
  confidence:  number;
  timeframe:   string;
  /** Analiz tezi */
  rationale:   string | null;
};

/** `signals` tablosuna INSERT — mock false/live modda çağrılır */
export async function insertSignal(
  client: SupabaseClient,
  args: InsertSignalArgs,
): Promise<{ id: string } | { error: string }> {
  if (!isWebWriteEnabled()) {
    return { error: WEB_WRITE_BLOCKED_MESSAGE };
  }

  const { data, error } = await client
    .from("signals")
    .insert({
      creator_id:  args.userId,
      asset_id:    args.assetId,
      direction:   args.direction,
      entry_price: args.entryPrice,
      target_price: args.targetPrice,
      stop_loss:   args.stopLoss,
      confidence:  args.confidence,
      timeframe:   args.timeframe,
      rationale:   args.rationale,
      is_active:   true,
    })
    .select("id")
    .single();

  if (error) {
    return { error: friendlyPostgrestMessage(error) };
  }
  if (!data?.id) return { error: "Sinyal kaydedilemedi." };
  return { id: String(data.id) };
}
