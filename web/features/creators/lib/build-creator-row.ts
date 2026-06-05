import type { ChannelPost } from "@/features/channel/types";
import type { MockProfileRow } from "@/mock/fixtures/profiles";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import type { CreatorContentFormat, CreatorDirectoryRow } from "@/features/creators/types";

function postType(p: ChannelPost): string {
  return (p.type ?? "").toLowerCase();
}

function isChannelLivePost(p: ChannelPost): boolean {
  return postType(p) === "live";
}

function isChannelPulsePost(p: ChannelPost): boolean {
  const t = postType(p);
  return t === "short" || t === "pulse";
}

function isChannelLongVideoPost(p: ChannelPost): boolean {
  const t = postType(p);
  return t === "video" || (Boolean(p.video_url?.trim()) && !isChannelPulsePost(p) && !isChannelLivePost(p));
}

function formatHandle(username: string): string {
  return username.startsWith("@") ? username : `@${username}`;
}

function postHeadline(p: ChannelPost): string {
  return p.title?.trim() || p.content?.slice(0, 80) || "İçerik";
}

function postHref(p: ChannelPost): string {
  const t = (p.type ?? "").toLowerCase();
  if (t === "live") return `/live/${encodeURIComponent(p.id)}`;
  if (t === "pulse" || t === "short") return `/pulse/${encodeURIComponent(p.id)}`;
  if (t === "video") return `/watch/${encodeURIComponent(p.id)}`;
  return `/post/${encodeURIComponent(p.id)}`;
}

function thumb(p: ChannelPost): string | null {
  return p.thumbnail_url?.trim() || p.image_url?.trim() || null;
}

function mapAssetPreset(tag: string): string[] {
  const u = tag.toUpperCase();
  const out = [u];
  if (["THYAO", "GARAN", "ASELS", "XU100", "BIST"].some((x) => u.includes(x))) out.push("BIST");
  if (["BTC", "ETH", "SOL", "AVAX"].includes(u)) out.push("BTC", "ETH");
  if (["USDTRY", "EURTRY", "EURUSD", "FOREX"].some((x) => u.includes(x))) out.push("Forex");
  if (u.includes("VIOP")) out.push("VIOP");
  return [...new Set(out)];
}

export function buildCreatorRowFromProfile(
  profile: MockProfileRow,
  posts: ChannelPost[],
  signals: SignalsFeedRow[],
): CreatorDirectoryRow {
  const livePosts = posts.filter(isChannelLivePost);
  const isLive = livePosts.length > 0;
  const livePost = livePosts[0];

  const formatCounts: Partial<Record<CreatorContentFormat, number>> = {};
  const formats = new Set<CreatorContentFormat>();

  for (const p of posts) {
    const t = (p.type ?? "").toLowerCase();
    if (isChannelLivePost(p)) {
      formats.add("live");
      formatCounts.live = (formatCounts.live ?? 0) + 1;
    } else if (isChannelLongVideoPost(p)) {
      formats.add("video");
      formatCounts.video = (formatCounts.video ?? 0) + 1;
    } else if (isChannelPulsePost(p)) {
      formats.add("pulse");
      formatCounts.pulse = (formatCounts.pulse ?? 0) + 1;
    } else if (t === "signal") {
      formats.add("signal");
      formatCounts.signal = (formatCounts.signal ?? 0) + 1;
    } else {
      formats.add("post");
      formatCounts.post = (formatCounts.post ?? 0) + 1;
    }
  }

  const activeSignals = signals.filter((s) => s.is_active);
  if (activeSignals.length) formats.add("signal");

  const assetSet = new Set<string>();
  for (const p of posts) {
    const t = p.asset_tag?.trim();
    if (t) mapAssetPreset(t).forEach((a) => assetSet.add(a));
  }
  for (const s of profile.specialties ?? []) {
    assetSet.add(s);
    if (/bist/i.test(s)) assetSet.add("BIST");
    if (/kripto|btc|eth/i.test(s)) assetSet.add("BTC");
    if (/forex|döviz/i.test(s)) assetSet.add("Forex");
    if (/makro/i.test(s)) assetSet.add("Makro");
    if (/viop/i.test(s)) assetSet.add("VIOP");
  }

  const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const latest = sortedPosts[0];

  const bestSignal = [...activeSignals].sort((a, b) => b.confidence - a.confidence)[0];

  const createdMs = new Date(profile.created_at).getTime();
  const rising = Date.now() - createdMs < 180 * 86_400_000 || (profile.streak_days ?? 0) >= 14;

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.full_name?.trim() || profile.username,
    handle: formatHandle(profile.username),
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    tier: profile.tier,
    verified: profile.verified,
    followerCount: profile.follower_count,
    signalAccuracy: profile.signal_accuracy,
    specialties: profile.specialties ?? [],
    assetTags: [...assetSet].slice(0, 8),
    contentFormats: [...formats],
    formatCounts,
    isLive,
    liveHref: livePost ? postHref(livePost) : null,
    latestHeadline: latest ? postHeadline(latest) : null,
    latestContentHref: latest ? postHref(latest) : null,
    latestThumbnailUrl: latest ? thumb(latest) : null,
    activeSignalsCount: activeSignals.length,
    bestSignalSymbol: bestSignal?.symbol ?? null,
    bestSignalConfidence: bestSignal?.confidence ?? null,
    roomHref: `/channel/${encodeURIComponent(profile.id)}?tab=rooms`,
    channelHref: `/channel/${encodeURIComponent(profile.id)}`,
    editorPick: false,
    rising,
    createdAt: profile.created_at,
  };
}

export function pickFeaturedIds(rows: CreatorDirectoryRow[]): string[] {
  return [...rows]
    .sort((a, b) => {
      const sa = (a.signalAccuracy ?? 0) + (a.isLive ? 30 : 0) + Math.log10(a.followerCount + 1) * 5;
      const sb = (b.signalAccuracy ?? 0) + (b.isLive ? 30 : 0) + Math.log10(b.followerCount + 1) * 5;
      return sb - sa;
    })
    .slice(0, 3)
    .map((r) => r.id);
}

export function pickLiveNowIds(rows: CreatorDirectoryRow[]): string[] {
  return rows.filter((r) => r.isLive).map((r) => r.id);
}
