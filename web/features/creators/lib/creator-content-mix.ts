import type { CreatorContentFormat, CreatorDirectoryRow } from "@/features/creators/types";

export type ContentMixSegment = {
  key: CreatorContentFormat;
  label: string;
  count: number;
  pct: number;
};

const FORMAT_LABELS: Record<CreatorContentFormat, string> = {
  live: "Canlı",
  video: "Video",
  pulse: "Pulse",
  signal: "Sinyal",
  post: "Gönderi",
};

/** İçerik format dağılımı — kart altı mini tape */
export function buildContentMixSegments(row: CreatorDirectoryRow): ContentMixSegment[] {
  const entries = (Object.entries(row.formatCounts) as [CreatorContentFormat, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = entries.reduce((s, [, n]) => s + n, 0) || 1;

  return entries.slice(0, 4).map(([key, count]) => ({
    key,
    label: FORMAT_LABELS[key],
    count,
    pct: Math.round((count / total) * 100),
  }));
}

export function pickHeroCreator(
  live: CreatorDirectoryRow[],
  featured: CreatorDirectoryRow[],
): CreatorDirectoryRow | null {
  if (live[0]) return live[0];
  if (featured[0]) return featured[0];
  return null;
}
