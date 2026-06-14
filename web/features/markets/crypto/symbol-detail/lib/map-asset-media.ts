import {
  VR_LIVE_ITEMS,
  VR_PULSE_ITEMS,
  VR_VIDEO_ITEMS,
  vrLiveThumbUrl,
  vrPulseThumbUrl,
  vrVideoThumbUrl,
  type VRLiveItem,
  type VRPulseItem,
  type VRVideoItem,
} from "@/features/discover/visual-reference/discover-visual-reference-data";
import type { AssetMediaItem } from "@/features/markets/types/asset-intelligence";

const AVATAR_COLORS = ["#0f9d75", "#6366f1", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"] as const;

const GRADIENTS = [
  { from: "#1a1040", to: "#06040f" },
  { from: "#1a0e30", to: "#06040f" },
  { from: "#0c1424", to: "#0d0f17" },
  { from: "#2a1800", to: "#0d0700" },
  { from: "#0f2818", to: "#040e07" },
] as const;

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function avatarColor(id: string): string {
  return AVATAR_COLORS[hashStr(id) % AVATAR_COLORS.length]!;
}

function handleFromName(name: string): string {
  const base = name.startsWith("@") ? name.slice(1) : name.toLowerCase().replace(/\s+/g, "");
  return `@${base}`;
}

function parseViewsLabel(label: string): number {
  const m = label.match(/([\d.]+)\s*M/i);
  if (m) return Math.round(parseFloat(m[1]!) * 1_000_000);
  const k = label.match(/([\d.]+)\s*K/i);
  if (k) return Math.round(parseFloat(k[1]!) * 1000);
  const n = label.match(/(\d+)/);
  return n ? parseInt(n[1]!, 10) : 2400;
}

function vrMatchesSymbol(item: { tag: string; title: string }, sym: string): boolean {
  const hay = `${item.tag} ${item.title}`.toUpperCase();
  return (
    hay.includes(sym) ||
    /BTC|ETH|CRYPTO|SOL|BNB|XRP|DEFI|ONCHAIN|KRİPTO|KRIPTO|USDT/i.test(hay)
  );
}

function pickVrPool<T extends { tag: string; title: string }>(pool: readonly T[], sym: string): T[] {
  const filtered = pool.filter((item) => vrMatchesSymbol(item, sym));
  return (filtered.length >= 4 ? filtered : pool).slice(0, 8);
}

function ensurePool<T extends { id: string }>(primary: T[], fallback: T[], max = 8): T[] {
  if (primary.length >= 4) return primary.slice(0, max);
  const seen = new Set(primary.map((p) => p.id));
  const merged = [...primary];
  for (const item of fallback) {
    if (merged.length >= max) break;
    if (seen.has(item.id)) continue;
    merged.push(item);
    seen.add(item.id);
  }
  return merged.length > 0 ? merged : fallback.slice(0, max);
}

function gradientFor(id: string) {
  return GRADIENTS[hashStr(id) % GRADIENTS.length]!;
}

export function mapMediaToLiveItem(item: AssetMediaItem, sym: string): VRLiveItem {
  const h = hashStr(item.id);
  return {
    id: item.id,
    title: item.title,
    creator: item.creatorDisplay,
    handle: handleFromName(item.creatorDisplay),
    viewers: parseViewsLabel(item.viewsLabel),
    tag: sym,
    thumb: item.thumbnailUrl ?? vrLiveThumbUrl(`cdr-live-${item.id}`),
    avatarColor: avatarColor(item.id),
    avatarInitial: item.creatorDisplay.slice(0, 1).toUpperCase() || "L",
    href: item.href,
    chatPerMin: 60 + (h % 180),
    heat: h % 3 === 0 ? "high" : "medium",
    programLine: item.editorialIntent ?? "Canlı piyasa masası",
    channelLine: item.creatorDisplay,
    hostKicker: "Yayında",
  };
}

export function mapMediaToVideoItem(item: AssetMediaItem, sym: string): VRVideoItem {
  const grad = gradientFor(item.id);
  return {
    id: item.id,
    title: item.title,
    creator: item.creatorDisplay,
    handle: handleFromName(item.creatorDisplay),
    durationLabel: item.durationLabel ?? "12:04",
    views: parseViewsLabel(item.viewsLabel),
    tag: sym,
    thumb: item.thumbnailUrl ?? vrVideoThumbUrl(`cdr-video-${item.id}`),
    gradientFrom: grad.from,
    gradientTo: grad.to,
    avatarColor: avatarColor(item.id),
    avatarInitial: item.creatorDisplay.slice(0, 1).toUpperCase() || "V",
    publishedAgo: "Az önce",
    href: item.href,
    seriesTitle: item.editorialIntent ?? `${sym} masası`,
  };
}

export function mapMediaToPulseItem(item: AssetMediaItem, sym: string): VRPulseItem {
  const grad = gradientFor(item.id);
  return {
    id: item.id,
    title: item.title,
    creator: item.creatorDisplay,
    durationLabel: item.durationLabel ?? "0:45",
    views: parseViewsLabel(item.viewsLabel),
    tag: sym,
    thumb: item.thumbnailUrl ?? vrPulseThumbUrl(`cdr-pulse-${item.id}`),
    gradientFrom: grad.from,
    gradientTo: grad.to,
    href: item.href,
    hookLine: item.editorialIntent ?? "Kısa piyasa notu",
    avatarInitial: item.creatorDisplay.slice(0, 1).toUpperCase() || "P",
    avatarColor: avatarColor(item.id),
    formatLabel: "Pulse",
  };
}

export type DetailMediaPools = {
  live: VRLiveItem[];
  video: VRVideoItem[];
  pulse: VRPulseItem[];
};

export function buildDetailMediaPools(
  media: readonly AssetMediaItem[],
  sym: string,
): DetailMediaPools {
  const liveSrc = media.filter((m) => m.kind === "live").map((m) => mapMediaToLiveItem(m, sym));
  const videoSrc = media.filter((m) => m.kind === "video").map((m) => mapMediaToVideoItem(m, sym));
  const pulseSrc = media.filter((m) => m.kind === "short").map((m) => mapMediaToPulseItem(m, sym));

  const liveFallback = pickVrPool(VR_LIVE_ITEMS, sym);
  const videoFallback = pickVrPool(VR_VIDEO_ITEMS, sym);
  const pulseFallback = pickVrPool(VR_PULSE_ITEMS, sym);

  return {
    live: ensurePool(liveSrc, liveFallback),
    video: ensurePool(videoSrc, videoFallback),
    pulse: ensurePool(pulseSrc, pulseFallback),
  };
}
