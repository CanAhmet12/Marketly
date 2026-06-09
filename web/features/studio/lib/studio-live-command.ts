import { liveHrefForPostId } from "@/features/live/live-href";
import type { StudioLiveCommand, StudioLiveStreamItem } from "@/features/studio/repository/types";

/** Mock schedule → command center modeli */
export function scheduleToLiveCommand(schedule: StudioLiveStreamItem[]): StudioLiveCommand {
  const liveItem = schedule.find((s) => s.status === "live");
  const activeSession =
    liveItem?.postId && liveItem.channelName
      ? {
          postId: liveItem.postId,
          channelName: liveItem.channelName,
          title: liveItem.title,
          viewerCount: liveItem.viewerCount ?? 0,
          startedAt: liveItem.scheduledStart,
          href: liveItem.href ?? liveHrefForPostId(liveItem.postId),
        }
      : liveItem?.postId
        ? {
            postId: liveItem.postId,
            channelName: `marketly-${liveItem.postId.slice(0, 8)}`,
            title: liveItem.title,
            viewerCount: liveItem.viewerCount ?? 0,
            startedAt: liveItem.scheduledStart,
            href: liveItem.href ?? liveHrefForPostId(liveItem.postId),
          }
        : null;

  return {
    activeSession,
    scheduled: schedule.filter((s) => s.status === "scheduled"),
    endedRecent: schedule.filter((s) => s.status === "ended"),
  };
}
