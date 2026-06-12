import type { SupabaseClient } from "@supabase/supabase-js";

/** Sinyal kopyalandığında üreticiye bildirim — sessiz hata */
export async function notifySignalCopied(
  client: SupabaseClient,
  params: {
    creatorId: string;
    copierId: string;
    signalId: string;
    symbol: string;
  },
): Promise<void> {
  if (params.creatorId === params.copierId) return;

  try {
    const { error } = await client.from("notifications").insert({
      user_id: params.creatorId,
      sender_id: params.copierId,
      type: "signal",
      title: `${params.symbol} sinyalin kopyalandı`,
      body: "Bir kullanıcı sinyalini portföyüne ekledi.",
      related_id: params.signalId,
      is_read: false,
    });
    if (error) console.warn("[signals] notifySignalCopied", error.message);
  } catch (e) {
    console.warn("[signals] notifySignalCopied", e);
  }
}
