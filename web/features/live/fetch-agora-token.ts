import type { SupabaseClient } from "@supabase/supabase-js";

export type AgoraTokenResponse = {
  token: string;
  mode: "testing" | "secured";
  appId?: string;
  uid?: number;
  channelName?: string;
  expiresAt?: number;
  error?: string;
};

export type AgoraRtcRole = "publisher" | "subscriber";

/** Supabase Edge Function — Agora RTC token (sertifika yoksa testing modu). */
export async function fetchAgoraRtcToken(
  client: SupabaseClient,
  channelName: string,
  role: AgoraRtcRole = "subscriber",
  uid = 0,
): Promise<AgoraTokenResponse | null> {
  const { data, error } = await client.functions.invoke("agora-token", {
    body: { channelName, role, uid },
  });

  if (error) {
    console.warn("[agora] token", error.message);
    return null;
  }

  const payload = data as AgoraTokenResponse | null;
  if (!payload || typeof payload.token !== "string") return null;
  return payload;
}
