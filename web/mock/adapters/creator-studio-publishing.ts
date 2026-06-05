import type { StudioDraftItem, StudioLocalMutations, StudioScheduledItem, StudioPlatformTarget } from "@/features/studio/types";

import { formatIsoPlusHours, pickThumb, studioSeed } from "./creator-studio-utils";
import { MOCK_POST_SOURCES } from "@/mock/fixtures/posts";

const DRAFT_SNIPPETS = [
  "VIOP teminat notları — yayın öncesi gözden geçir.",
  "Kripto haftalık seviye haritası (taslak).",
  "Bilanço vurguları: marj ve nakit akışı.",
  "Makro öncesi pozisyon küçültme metni.",
];

function baseDraftTime(ownerId: string, i: number): string {
  const ref = MOCK_POST_SOURCES.find((p) => p.user_id === ownerId)?.created_at ?? "2026-05-01T10:00:00.000Z";
  return formatIsoPlusHours(ref, -24 * (i + 2));
}

export function getStudioDrafts(ownerId: string, local: StudioLocalMutations, mockDataset: boolean): StudioDraftItem[] {
  if (!mockDataset) return [];
  const deleted = new Set(local.deletedDraftIds);
  const n = 4 + (studioSeed(ownerId, "dn") % 3);
  const out: StudioDraftItem[] = [];
  for (let i = 0; i < n; i++) {
    const id = `draft-${ownerId}-${i}`;
    if (deleted.has(id)) continue;
    const roll = (studioSeed(ownerId, `dk:${i}`) % 3) as 0 | 1 | 2;
    const kind: StudioDraftItem["kind"] = roll === 0 ? "post" : roll === 1 ? "video" : "signal";
    const p = MOCK_POST_SOURCES.find((x) => x.user_id === ownerId && (roll === 0 ? x.type === "post" : roll === 1 ? x.type === "video" : x.type === "signal"));
    const title =
      kind === "signal"
        ? `Sinyal taslağı #${i + 1}`
        : kind === "video"
          ? `Video taslağı #${i + 1}`
          : `Gönderi taslağı #${i + 1}`;
    out.push({
      id,
      kind,
      title,
      preview: DRAFT_SNIPPETS[i % DRAFT_SNIPPETS.length],
      lastEditedAt: baseDraftTime(ownerId, i),
      thumbnailUrl: p ? pickThumb(p) : null,
    });
  }
  return out;
}

export function getStudioScheduledPosts(ownerId: string, local: StudioLocalMutations, mockDataset: boolean): StudioScheduledItem[] {
  if (!mockDataset) return [];
  const cancelled = new Set(local.cancelledScheduledIds);
  const n = 3 + (studioSeed(ownerId, "sn") % 2);
  const platforms: StudioPlatformTarget[] = ["marketly", "web", "mobile", "all"];
  const out: StudioScheduledItem[] = [];
  for (let i = 0; i < n; i++) {
    const id = `sched-${ownerId}-${i}`;
    if (cancelled.has(id)) continue;
    const ref = MOCK_POST_SOURCES.find((p) => p.user_id === ownerId)?.created_at ?? "2026-05-10T12:00:00.000Z";
    const scheduledFor = formatIsoPlusHours(ref, 6 + i * 10);
    const ckRoll = studioSeed(ownerId, `sck:${i}`) % 4;
    const contentKind = (["post", "video", "signal", "short"] as const)[ckRoll];
    const p = MOCK_POST_SOURCES.find((x) => x.user_id === ownerId && x.type === contentKind);
    out.push({
      id,
      contentKind,
      title: `Zamanlanmış ${contentKind} #${i + 1}`,
      preview: "Otomatik yayın — saat geldiğinde `publish-scheduled-posts` edge fonksiyonu tetiklenir (prod).",
      scheduledFor,
      status: "pending",
      platformTarget: platforms[studioSeed(ownerId, `spf:${i}`) % platforms.length],
      thumbnailUrl: p ? pickThumb(p) : null,
    });
  }
  return out;
}
