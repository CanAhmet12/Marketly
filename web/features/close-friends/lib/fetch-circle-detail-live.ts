import type { SupabaseClient } from "@supabase/supabase-js";

import type { PrivateCircleDetailPayload, PrivateCircleKind } from "@/features/close-friends/domain/types";
import { buildCircleSummary } from "@/features/close-friends/lib/circle-factory";
import { isCloseFriendsWriteEnabled } from "@/features/close-friends/lib/close-friends-persistence";
import { fetchIsCloseFriend } from "@/features/close-friends/lib/fetch-trusted-members";

function parseCircleId(circleId: string): { creatorId: string; kind: PrivateCircleKind } | null {
  const idx = circleId.indexOf("::");
  if (idx <= 0) return null;
  const creatorId = circleId.slice(0, idx);
  const kind = circleId.slice(idx + 2) as PrivateCircleKind;
  return { creatorId, kind };
}

export async function fetchCircleDetailLive(
  client: SupabaseClient,
  circleId: string,
  viewerId: string | null,
): Promise<PrivateCircleDetailPayload | null> {
  const parsed = parseCircleId(circleId);
  if (!parsed) return null;

  try {
    const { data, error } = await client
      .from("profiles")
      .select("id, username, full_name, avatar_url, verified")
      .eq("id", parsed.creatorId)
      .maybeSingle();

    if (error || !data) return null;

    let isFriend = false;
    if (viewerId) {
      isFriend = await fetchIsCloseFriend(client, viewerId, parsed.creatorId);
      if (!isFriend && parsed.kind === "close_followers") {
        return null;
      }
    }

    const circle = buildCircleSummary(data, parsed.kind);
    return {
      circle,
      feed: [],
      publishing_hint: "Özel akış canlı modda henüz sınırlı — kanal ve mesajlar üzerinden devam edebilirsin.",
      is_close_friend: isFriend,
      write_enabled: isCloseFriendsWriteEnabled(),
    };
  } catch {
    return null;
  }
}
