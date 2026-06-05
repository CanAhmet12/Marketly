import type { MockPostSource } from "@/mock/fixtures/posts";

/** Deterministik sayı üretimi (fixture + owner kimliği). */
export function studioSeed(ownerId: string, salt: string): number {
  const s = `${ownerId}:${salt}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

export function pickThumb(p: MockPostSource): string | null {
  return p.thumbnail_url ?? p.image_url ?? p.media_urls?.[0]?.thumbnail_url ?? p.media_urls?.[0]?.url ?? null;
}

export function formatIsoPlusHours(baseIso: string, addHours: number): string {
  const t = new Date(baseIso).getTime() + addHours * 3600_000;
  return new Date(t).toISOString();
}
