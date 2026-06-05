import type { SupabaseClient } from "@supabase/supabase-js";

import { reportOperationalWarning } from "@/lib/observability/report-error";

/**
 * Video detay sayfasında tek seferlik görüntülenme sinyali (süre 0 — mobil/edge ile uyumlu RPC adı).
 * Başarısızlık ürün akışını bozmaz; gözlemlenebilirlik için kaydedilir.
 */
export async function trackVideoViewImpulse(client: SupabaseClient, postId: string): Promise<void> {
  try {
    await client.rpc("track_video_view", { p_video_id: postId, p_watch_duration: 0 });
  } catch (e) {
    reportOperationalWarning("analytics:track_video_view", "RPC başarısız", {
      postId,
      detail: e instanceof Error ? e.message : String(e),
    });
  }
}
