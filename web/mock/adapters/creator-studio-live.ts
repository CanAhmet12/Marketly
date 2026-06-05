import type { StudioLiveStreamItem } from "@/features/studio/types";
import { MOCK_POST_SOURCES } from "@/mock/fixtures/posts";

import { formatIsoPlusHours, pickThumb, studioSeed } from "./creator-studio-utils";

export function getStudioLiveSchedule(ownerId: string, mockDataset: boolean): StudioLiveStreamItem[] {
  if (!mockDataset) return [];
  const posts = MOCK_POST_SOURCES.filter((p) => p.user_id === ownerId && p.type === "live");
  const ref = posts[0]?.created_at ?? "2026-05-12T15:00:00.000Z";
  const anyPost = MOCK_POST_SOURCES.find((p) => p.user_id === ownerId);
  const thumb = posts[0] ? pickThumb(posts[0]) : anyPost ? pickThumb(anyPost) : null;

  const items: StudioLiveStreamItem[] = [
    {
      id: `live-${ownerId}-up1`,
      title: "Piyasa açılışı — soru-cevap",
      description: "Yayın öncesi hatırlatıcı sayısı mock veriden gelir.",
      scheduledStart: formatIsoPlusHours(ref, 4),
      status: "scheduled",
      reminderCount: 120 + (studioSeed(ownerId, "rm1") % 400),
      thumbnailUrl: thumb,
    },
    {
      id: `live-${ownerId}-up2`,
      title: "Haftalık strateji yayını",
      description: "StreamScheduleScreen ile uyumlu: başlık, saat, durum, hatırlatıcı.",
      scheduledStart: formatIsoPlusHours(ref, 28),
      status: "scheduled",
      reminderCount: 40 + (studioSeed(ownerId, "rm2") % 200),
      thumbnailUrl: thumb,
    },
  ];

  if (studioSeed(ownerId, "liveNow") % 4 === 0) {
    items.unshift({
      id: `live-${ownerId}-now`,
      title: "CANLI — portföy güncellemesi",
      description: "Mock durum: şu an yayında gösterimi.",
      scheduledStart: formatIsoPlusHours(ref, -1),
      status: "live",
      reminderCount: 890 + (studioSeed(ownerId, "rm0") % 200),
      thumbnailUrl: thumb,
    });
  }

  return items;
}
