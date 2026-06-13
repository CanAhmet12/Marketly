import type { SupabaseClient } from "@supabase/supabase-js";

export type CryptoSentimentAggregate = {
  bullPct: number;
  bearPct: number;
  totalVotes: number;
};

type VoteRow = { direction: string | null };

function aggregateRows(rows: VoteRow[]): CryptoSentimentAggregate {
  const total = rows.length;
  if (total === 0) return { bullPct: 50, bearPct: 50, totalVotes: 0 };
  const bullCount = rows.filter((r) => r.direction === "bull").length;
  const bullPct = Math.round((bullCount / total) * 100);
  return { bullPct, bearPct: 100 - bullPct, totalVotes: total };
}

/** `sentiment_votes` tablosundan sembol bazlı topluluk sentiment özeti. */
export async function fetchCryptoSentimentAggregate(
  client: SupabaseClient,
  symbol: string,
): Promise<CryptoSentimentAggregate | null> {
  const key = symbol.trim().toUpperCase();
  if (!key) return null;

  const { data, error } = await client.from("sentiment_votes").select("direction").eq("symbol", key);

  if (error) {
    console.warn("[markets] fetchCryptoSentimentAggregate", error.message);
    return null;
  }

  return aggregateRows((data ?? []) as VoteRow[]);
}

/** Kullanıcı/cihaz oyu — mobil upsert ile aynı conflict anahtarı. */
export async function upsertCryptoSentimentVote(
  client: SupabaseClient,
  symbol: string,
  deviceId: string,
  direction: "bull" | "bear",
): Promise<boolean> {
  const key = symbol.trim().toUpperCase();
  if (!key || !deviceId) return false;

  const { error } = await client.from("sentiment_votes").upsert(
    { symbol: key, device_id: deviceId, direction },
    { onConflict: "symbol,device_id" },
  );

  if (error) {
    console.warn("[markets] upsertCryptoSentimentVote", error.message);
    return false;
  }

  return true;
}
