import type { SupabaseClient } from "@supabase/supabase-js";

import { liveHrefForPostId } from "@/features/live/live-href";
import type { StudioLiveCommand, StudioLiveStreamItem } from "@/features/studio/repository/types";

export async function fetchStudioLiveCommand(
  client: SupabaseClient,
  ownerId: string,
): Promise<StudioLiveCommand> {
  const [activeRes, scheduledRes, endedRes] = await Promise.all([
    client
      .from("live_sessions")
      .select("post_id, channel_name, title, viewer_count, started_at")
      .eq("host_id", ownerId)
      .eq("is_active", true)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("scheduled_streams")
      .select("id, title, description, scheduled_at")
      .eq("user_id", ownerId)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(10),
    client
      .from("live_sessions")
      .select("post_id, channel_name, title, viewer_count, started_at, ended_at")
      .eq("host_id", ownerId)
      .eq("is_active", false)
      .not("ended_at", "is", null)
      .order("ended_at", { ascending: false })
      .limit(5),
  ]);

  const activeRow = activeRes.data;
  const activeSession =
    activeRow?.post_id && activeRow.channel_name
      ? {
          postId: String(activeRow.post_id),
          channelName: String(activeRow.channel_name),
          title: String(activeRow.title ?? "Canlı yayın"),
          viewerCount: typeof activeRow.viewer_count === "number" ? activeRow.viewer_count : 0,
          startedAt: String(activeRow.started_at ?? new Date().toISOString()),
          href: liveHrefForPostId(String(activeRow.post_id)),
        }
      : null;

  const scheduled: StudioLiveStreamItem[] = (scheduledRes.data ?? []).map((row) => ({
    id: String(row.id),
    title: row.title ?? "Zamanlanmış yayın",
    description: row.description ?? "",
    scheduledStart: String(row.scheduled_at),
    status: "scheduled" as const,
    reminderCount: 0,
    thumbnailUrl: null,
    href: "/studio/scheduled",
  }));

  const endedRecent: StudioLiveStreamItem[] = (endedRes.data ?? []).map((row) => ({
    id: String(row.post_id ?? row.channel_name),
    title: row.title ?? "Yayın",
    description: row.channel_name ? `Kanal · ${row.channel_name}` : "",
    scheduledStart: String(row.started_at ?? row.ended_at),
    status: "ended" as const,
    reminderCount: 0,
    thumbnailUrl: null,
    postId: row.post_id ? String(row.post_id) : null,
    channelName: row.channel_name ? String(row.channel_name) : null,
    viewerCount: typeof row.viewer_count === "number" ? row.viewer_count : 0,
    href: row.post_id ? liveHrefForPostId(String(row.post_id)) : null,
  }));

  return { activeSession, scheduled, endedRecent };
}
