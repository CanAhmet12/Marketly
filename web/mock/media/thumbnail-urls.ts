/**
 * Mock feed görselleri — Unsplash ID’leri sık 404 verdiği için deterministik Picsum kullanılır.
 * Terminalde toplu URL testi gerekmez; `seed` benzersiz olduğu sürece görsel benzersizdir.
 */

export const MOCK_THUMB_W = 1280;
export const MOCK_THUMB_H = 720;

/** 16:9 — deterministik, yüksek erişilebilirlik */
export function mockPicsumThumb(seed: string, w = MOCK_THUMB_W, h = MOCK_THUMB_H): string {
  const s = encodeURIComponent(seed.slice(0, 80));
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}

/** Sırayla: 25 video + 12 short + 10 live + 8 signal + 5 post = 60 — her biri farkı seed */
const SEEDS60 = [
  "ml-v-01",
  "ml-v-02",
  "ml-v-03",
  "ml-v-04",
  "ml-v-05",
  "ml-v-06",
  "ml-v-07",
  "ml-v-08",
  "ml-v-09",
  "ml-v-10",
  "ml-v-11",
  "ml-v-12",
  "ml-v-13",
  "ml-v-14",
  "ml-v-15",
  "ml-v-16",
  "ml-v-17",
  "ml-v-18",
  "ml-v-19",
  "ml-v-20",
  "ml-v-21",
  "ml-v-22",
  "ml-v-23",
  "ml-v-24",
  "ml-v-25",
  "ml-s-01",
  "ml-s-02",
  "ml-s-03",
  "ml-s-04",
  "ml-s-05",
  "ml-s-06",
  "ml-s-07",
  "ml-s-08",
  "ml-s-09",
  "ml-s-10",
  "ml-s-11",
  "ml-s-12",
  "ml-l-01",
  "ml-l-02",
  "ml-l-03",
  "ml-l-04",
  "ml-l-05",
  "ml-l-06",
  "ml-l-07",
  "ml-l-08",
  "ml-l-09",
  "ml-l-10",
  "ml-g-01",
  "ml-g-02",
  "ml-g-03",
  "ml-g-04",
  "ml-g-05",
  "ml-g-06",
  "ml-g-07",
  "ml-g-08",
  "ml-p-01",
  "ml-p-02",
  "ml-p-03",
  "ml-p-04",
  "ml-p-05",
] as const;

function assert60Unique(): void {
  const full = SEEDS60.map((s) => mockPicsumThumb(s));
  if (new Set(full).size !== 60) throw new Error("[mock/media] MOCK_THUMBMASTER_60: duplicate URL");
}
assert60Unique();

export const MOCK_THUMBMASTER_60 = SEEDS60.map((s) => mockPicsumThumb(s)) as unknown as readonly string[];

const V0 = 0;
const V1 = 25;
const S0 = 25;
const S1 = 37;
const L0 = 37;
const L1 = 47;
const G0 = 47;
const G1 = 55;
const P0 = 55;
const P1 = 60;

export const THUMB_POOL_VIDEO = MOCK_THUMBMASTER_60.slice(V0, V1);
export const THUMB_POOL_SHORT = MOCK_THUMBMASTER_60.slice(S0, S1);
export const THUMB_POOL_LIVE = MOCK_THUMBMASTER_60.slice(L0, L1);
export const THUMB_POOL_SIGNAL = MOCK_THUMBMASTER_60.slice(G0, G1);
export const THUMB_POOL_POST = MOCK_THUMBMASTER_60.slice(P0, P1);

/** img onError — Picsum ile ayrı seed’ler (Unsplash bağımlılığı yok) */
export const THUMB_OFFLINE_FALLBACKS = [
  mockPicsumThumb("ml-off-a"),
  mockPicsumThumb("ml-off-b"),
  mockPicsumThumb("ml-off-c"),
  mockPicsumThumb("ml-off-d"),
  mockPicsumThumb("ml-off-e"),
  mockPicsumThumb("ml-off-f"),
  mockPicsumThumb("ml-off-g"),
  mockPicsumThumb("ml-off-h"),
] as const;

/** Geriye dönük import uyumu (başka dosyalar kullanıyorsa) */
export function asMockThumbnailUrl(seed: string): string {
  return mockPicsumThumb(seed);
}
