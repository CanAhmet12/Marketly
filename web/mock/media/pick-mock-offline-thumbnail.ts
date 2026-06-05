import { mockPicsumThumb } from "@/mock/media/thumbnail-urls";

function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = (h << 5) + h + str.charCodeAt(i);
  return Math.abs(h);
}

/** Görsel yüklenemezse — Picsum (tek havuz, Unsplash 404 riski yok) */
export function pickMockOfflineThumbnail(seed: string): string {
  const n = djb2(seed) % 24;
  return mockPicsumThumb(`ml-fallback-${n}-${seed.slice(0, 24)}`);
}
