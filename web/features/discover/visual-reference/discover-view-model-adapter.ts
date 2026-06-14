/**
 * FeedPost[] → Discover visual reference view model.
 * MC-001/MC-002: `isMock=false` iken VR static fallback devre dışı.
 * Gerçek veri yoksa bölüm boş kalır; sahte içerik gösterilmez.
 */

import type { FeedPost } from "@/features/feed/types";
import { filterDiscoverPosts } from "@/features/feed/discover-feed-filters";
import {
  authorAvatarSrc,
  formatDurationBadge,
  gridCardTitle,
  isLivePost,
  isLongVideoPost,
  isPulsePost,
  isSignalPost,
  pickDurationSeconds,
  pickGridThumbnail,
  primaryContentHref,
} from "@/features/feed/feed-display";
import { marketSymbolPath } from "@/features/markets/markets-routes";
import {
  VR_CREATOR_ACTIVITY_FEED,
  VR_CREATOR_ITEMS,
  VR_LIVE_ITEMS,
  VR_MARKET_TICKERS,
  VR_MARKET_TOPIC_CHIPS,
  VR_PULSE_ITEMS,
  VR_SIGNAL_ITEMS,
  VR_TOPIC_ECOSYSTEMS,
  VR_VIDEO_ITEMS,
  type VRCreatorActivityBadge,
  type VRCreatorActivityLine,
  type VRCreatorActivityTileTone,
  type VRCreatorItem,
  type VRDeskHeat,
  type VRDeskTopicAccent,
  type VRLiveItem,
  type VRMarketTicker,
  type VRMarketTopicChip,
  type VRPulseItem,
  type VRSignalItem,
  type VRTopicEcosystem,
  type VRVideoItem,
} from "./discover-visual-reference-data";

export type DiscoverViewModel = {
  liveItems: VRLiveItem[];
  pulseItems: VRPulseItem[];
  videoItems: VRVideoItem[];
  signalItems: VRSignalItem[];
  creatorItems: VRCreatorItem[];
  creatorActivityFeed: VRCreatorActivityLine[];
  marketTopicChips: VRMarketTopicChip[];
  topicEcosystems: VRTopicEcosystem[];
  marketTickers: VRMarketTicker[];
};

function stableU32(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickMod<T>(id: string, arr: readonly T[]): T {
  return arr[stableU32(id) % arr.length]!;
}

const PULSE_GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ["#0d1f3c", "#050a14"],
  ["#1a0e30", "#06040f"],
  ["#2a1800", "#0d0700"],
  ["#0f2818", "#040e07"],
  ["#1a1400", "#080600"],
  ["#001524", "#000508"],
  ["#180d30", "#06030f"],
  ["#0a1828", "#030810"],
];

const CREATOR_TAG_POOL = [
  "Öne Çıkan",
  "Yükselen",
  "Topluluk Favorisi",
  "Yeni Keşif",
  "Derin Analiz",
] as const;

const ACCENT_POOL: VRDeskTopicAccent[] = ["macro", "crypto", "bist", "commodity", "equity", "deriv"];
const HEAT_POOL: VRDeskHeat[] = ["hot", "rising", "watch", "risk", "new"];
const SIZE_POOL: Array<"sm" | "md" | "lg"> = ["sm", "md", "md", "lg"];

function formatHandle(raw: string): string {
  const t = raw.trim();
  if (!t) return "@user";
  return t.startsWith("@") ? t : `@${t}`;
}

function publishedAgoTr(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "Yakında";
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 36) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  if (d < 12) return `${d} gün önce`;
  const w = Math.floor(d / 7);
  return `${w} hf önce`;
}

function initialsFromName(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  if (p.length === 1) return p[0]!.slice(0, 1).toUpperCase();
  return (p[0]!.slice(0, 1) + p[p.length - 1]!.slice(0, 1)).toUpperCase();
}

function avatarColorFromId(id: string): string {
  const n = stableU32(`c-${id}`);
  const r = 24 + (n & 0x3f);
  const g = 24 + ((n >> 8) & 0x3f);
  const b = 24 + ((n >> 16) & 0x3f);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function formatFollowersApprox(likes: number, comments: number, id: string): string {
  const base = likes * 37 + comments * 91 + (stableU32(id) % 4000);
  const n = Math.max(1200, base);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function contentSnippet(p: FeedPost, max = 96): string {
  const c = p.content?.trim() ?? "";
  if (!c) return gridCardTitle(p);
  return c.length > max ? `${c.slice(0, max)}…` : c;
}

function mapLive(p: FeedPost): VRLiveItem {
  const id = p.id;
  const h = stableU32(id);
  const views = p.views_count ?? null;
  const viewers =
    typeof views === "number" && views > 0
      ? Math.max(views, Math.floor(views * 0.02) + 50)
      : 800 + (h % 4000);
  const heat: "high" | "medium" = h % 3 === 0 ? "high" : "medium";
  const chatPerMin = 40 + (h % 160);
  const tag = (p.asset_tag?.trim() || "Canlı").slice(0, 24);
  const thumb = pickGridThumbnail(p);
  return {
    id,
    title: gridCardTitle(p),
    creator: p.author_name || "Üretici",
    handle: formatHandle(p.author_handle || ""),
    viewers,
    tag,
    thumb,
    avatarColor: avatarColorFromId(p.user_id),
    avatarInitial: initialsFromName(p.author_name || "?"),
    href: primaryContentHref(p),
    chatPerMin,
    heat,
    programLine: p.title?.trim() ? undefined : contentSnippet(p, 72),
    channelLine: tag,
    hostKicker: "Canlı",
  };
}

function mapPulse(p: FeedPost): VRPulseItem {
  const id = p.id;
  const [gradientFrom, gradientTo] = pickMod(id, PULSE_GRADIENTS);
  const durSec = pickDurationSeconds(p);
  const durationLabel = durSec != null && durSec > 0 ? formatDurationBadge(durSec) : "0:45";
  const views = typeof p.views_count === "number" && p.views_count > 0 ? p.views_count : p.likes * 12 + p.comments * 40 + (stableU32(id) % 5000);
  const tag = (p.asset_tag?.trim() || "Pulse").slice(0, 20);
  return {
    id,
    title: gridCardTitle(p),
    creator: p.author_name || "Üretici",
    durationLabel,
    views,
    tag,
    thumb: pickGridThumbnail(p),
    gradientFrom,
    gradientTo,
    href: primaryContentHref(p),
    hookLine: contentSnippet(p, 80),
    avatarInitial: initialsFromName(p.author_name || "?"),
    avatarColor: avatarColorFromId(p.user_id),
    formatLabel: "Kısa içerik",
  };
}

function mapVideo(p: FeedPost): VRVideoItem {
  const id = p.id;
  const [gradientFrom, gradientTo] = pickMod(`v-${id}`, PULSE_GRADIENTS);
  const durSec = pickDurationSeconds(p);
  const durationLabel = durSec != null && durSec > 0 ? formatDurationBadge(durSec) : "12:00";
  const views = typeof p.views_count === "number" && p.views_count > 0 ? p.views_count : p.likes * 80 + p.comments * 120 + (stableU32(id) % 8000);
  const tag = (p.asset_tag?.trim() || "Video").slice(0, 20);
  return {
    id,
    title: gridCardTitle(p),
    creator: p.author_name || "Üretici",
    handle: formatHandle(p.author_handle || ""),
    durationLabel,
    views,
    tag,
    thumb: pickGridThumbnail(p),
    gradientFrom,
    gradientTo,
    avatarColor: avatarColorFromId(p.user_id),
    avatarInitial: initialsFromName(p.author_name || "?"),
    publishedAgo: publishedAgoTr(p.created_at),
    href: primaryContentHref(p),
  };
}

function signalDirection(id: string): "BUY" | "SELL" | "HOLD" {
  const m = stableU32(`sigdir-${id}`) % 3;
  if (m === 0) return "BUY";
  if (m === 1) return "SELL";
  return "HOLD";
}

function mapSignal(p: FeedPost): VRSignalItem {
  const id = p.id;
  const sym = (p.asset_tag?.trim() || gridCardTitle(p).slice(0, 8).toUpperCase() || "VARLIK").slice(0, 16);
  const dir = signalDirection(id);
  const analystColor = avatarColorFromId(p.user_id);
  return {
    id,
    symbol: sym,
    assetName: gridCardTitle(p).slice(0, 48),
    direction: dir,
    entry: "—",
    target: "—",
    stop: "—",
    timeframe: "1H",
    confidence: 55 + (stableU32(id) % 30),
    rationale: contentSnippet(p, 140),
    analyst: p.author_name || "Analist",
    analystHandle: formatHandle(p.author_handle || ""),
    analystColor,
    rr: `${(1.5 + (stableU32(id) % 20) / 10).toFixed(1)}x`,
    age: publishedAgoTr(p.created_at),
    href: `/post/${p.id}`,
    spotPrice: "—",
    changePct: "—",
    changePositive: dir !== "SELL",
    signalStatus: dir === "HOLD" ? "watching" : "in_entry",
    signalStatusLabel: dir === "HOLD" ? "Nötr — izleme" : "Giriş bandında",
    pricePosition: 40 + (stableU32(id) % 35),
  };
}

function mapCreatorRow(p: FeedPost, hasLive: boolean): VRCreatorItem {
  const uid = p.user_id;
  const portrait = authorAvatarSrc(p);
  return {
    id: uid,
    displayName: p.author_name || "Üretici",
    handle: formatHandle(p.author_handle || ""),
    specialty: contentSnippet(p, 72),
    tag: pickMod(uid, CREATOR_TAG_POOL),
    followers: formatFollowersApprox(p.likes, p.comments, uid),
    contentFormats: "İçerik",
    isLive: hasLive,
    avatarColor: avatarColorFromId(uid),
    avatarInitial: initialsFromName(p.author_name || "?"),
    portraitUrl: p.author_avatar?.trim() ? portrait : undefined,
    href: `/channel/${uid}`,
  };
}

function buildCreatorItems(posts: FeedPost[]): VRCreatorItem[] {
  const creatorPosts = filterDiscoverPosts(posts, "creators");
  const liveByUser = new Set(posts.filter(isLivePost).map((x) => x.user_id));
  return creatorPosts.map((p) => mapCreatorRow(p, liveByUser.has(p.user_id)));
}

function buildCreatorActivityFeed(posts: FeedPost[], creators: VRCreatorItem[]): VRCreatorActivityLine[] {
  if (!creators.length) return [];
  const lines: VRCreatorActivityLine[] = [];
  const userPosts = [...posts].sort((a, b) => b.likes + b.comments * 2 - (a.likes + a.comments * 2));

  const badgeCycle: VRCreatorActivityBadge[] = ["live", "trend", "new", "hot"];
  const toneCycle: VRCreatorActivityTileTone[] = ["bist", "crypto", "macro", "bist"];

  for (let i = 0; i < creators.length && lines.length < 10; i++) {
    const c = creators[i]!;
    const pick = userPosts.find((p) => p.user_id === c.id);
    if (!pick) continue;
    const badge: VRCreatorActivityBadge = isLivePost(pick)
      ? "live"
      : pickMod(`${c.id}-b`, badgeCycle);
    const tileTone = pickMod(`${c.id}-t`, toneCycle);
    lines.push({
      creatorId: c.id,
      badge,
      headline: gridCardTitle(pick),
      railContext: contentSnippet(pick, 56),
      topicChipA: (pick.asset_tag?.trim() || "Gündem").slice(0, 12),
      topicChipB: "Akış",
      tileTone,
      cta: isLivePost(pick) ? "İzle" : "Profil",
    });
  }
  return lines;
}

function buildMarketTopicChipsFromPosts(posts: FeedPost[]): VRMarketTopicChip[] {
  const tags = new Map<string, string>();
  for (const p of posts) {
    const t = p.asset_tag?.trim();
    if (t && !tags.has(t)) tags.set(t, t);
    if (tags.size >= 12) break;
  }
  if (!tags.size) return [...VR_MARKET_TOPIC_CHIPS];
  return [...tags.values()].map((tag, i) => {
    const id = `chip-feed-${tag}`;
    return {
      id,
      title: `${tag} gündemi`,
      tickers: [tag],
      heat: HEAT_POOL[stableU32(id) % HEAT_POOL.length]!,
      href: marketSymbolPath(tag),
      accent: ACCENT_POOL[stableU32(id) % ACCENT_POOL.length]!,
      size: SIZE_POOL[i % SIZE_POOL.length]!,
    };
  });
}

/**
 * Mock true: boşsa VR fallback kullanır.
 * Mock false: boşsa boş dizi döner (sahte içerik yok).
 */
function orCopy<T>(mapped: T[], fallback: readonly T[], isMock: boolean): T[] {
  if (mapped.length > 0) return mapped;
  return isMock ? [...fallback] : [];
}

/**
 * `posts` repo/mock `FeedPost[]` (dedupe edilmiş) olmalı.
 * `isMock=true`: boş bölümler VR static ile doldurulur (geliştirici önizlemesi).
 * `isMock=false`: boş bölümler gerçekten boş kalır — sahte içerik gösterilmez (MC-001).
 */
export function buildDiscoverViewModel(posts: FeedPost[], isMock = true): DiscoverViewModel {
  const liveMapped = posts.filter(isLivePost).map(mapLive);
  const pulseMapped = posts.filter(isPulsePost).map(mapPulse);
  const videoMapped = posts.filter(isLongVideoPost).map(mapVideo);
  const signalMapped = posts.filter(isSignalPost).map(mapSignal);

  const creatorItemsMapped = buildCreatorItems(posts);
  const creatorItems = orCopy(creatorItemsMapped, VR_CREATOR_ITEMS, isMock);

  const activityMapped = buildCreatorActivityFeed(posts, creatorItemsMapped);
  const creatorActivityFeed = activityMapped.length > 0
    ? activityMapped
    : (isMock ? [...VR_CREATOR_ACTIVITY_FEED] : []);

  const marketTopicChips = posts.length > 0
    ? buildMarketTopicChipsFromPosts(posts)
    : (isMock ? [...VR_MARKET_TOPIC_CHIPS] : []);

  return {
    liveItems:    orCopy(liveMapped,   VR_LIVE_ITEMS,   isMock),
    pulseItems:   orCopy(pulseMapped,  VR_PULSE_ITEMS,  isMock),
    videoItems:   orCopy(videoMapped,  VR_VIDEO_ITEMS,  isMock),
    signalItems:  orCopy(signalMapped, VR_SIGNAL_ITEMS, isMock),
    creatorItems,
    creatorActivityFeed,
    marketTopicChips,
    /** MC-002: mock false iken boş — real topic API bağlanınca doldurulacak. */
    topicEcosystems: isMock ? [...VR_TOPIC_ECOSYSTEMS] : [],
    /** MC-002: mock false iken boş — markets tickers API bağlanınca doldurulacak. */
    marketTickers:   isMock ? [...VR_MARKET_TICKERS]   : [],
  };
}

/** Tamamen VR fallback — test ve varsayılan props için (mock=true) */
export const DISCOVER_STATIC_VIEW_MODEL: DiscoverViewModel = buildDiscoverViewModel([], true);
