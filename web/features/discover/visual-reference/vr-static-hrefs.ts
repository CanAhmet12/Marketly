/**
 * Keşfet VR statik fallback kartları — geçerli mock post / profil rotaları.
 */
import { liveHrefForPostId } from "@/features/live/live-href";
import { pulseHrefForPostId } from "@/features/pulse/pulse-href";
import { MOCK_POST_SOURCES } from "@/mock/fixtures/posts";
import { MOCK_PROFILE_IDS } from "@/mock/fixtures/profiles";

function postType(p: (typeof MOCK_POST_SOURCES)[0]): string {
  return (p.type ?? "").toLowerCase();
}

function idsWhere(pred: (p: (typeof MOCK_POST_SOURCES)[0]) => boolean, limit: number): string[] {
  return MOCK_POST_SOURCES.filter(pred)
    .slice(0, limit)
    .map((p) => p.id);
}

const PULSE_IDS = idsWhere((p) => postType(p) === "pulse" || postType(p) === "short", 12);
const LIVE_IDS = idsWhere((p) => postType(p) === "live", 8);
const VIDEO_IDS = idsWhere((p) => postType(p) === "video", 12);
const SIGNAL_IDS = idsWhere((p) => postType(p) === "signal", 8);
const CREATOR_IDS = MOCK_PROFILE_IDS.slice(0, 12);

function pick(list: string[], index: number, fallback: string): string {
  return list[index % list.length] ?? list[0] ?? fallback;
}

export function vrPulseHref(index: number): string {
  const id = pick(PULSE_IDS, index, "mock-post-012");
  return pulseHrefForPostId(id);
}

export function vrLiveHref(index: number): string {
  const id = pick(LIVE_IDS, index, "mock-post-024");
  return liveHrefForPostId(id);
}

export function vrVideoHref(index: number): string {
  const id = pick(VIDEO_IDS, index, "mock-post-001");
  return `/watch/${encodeURIComponent(id)}`;
}

export function vrSignalHref(index: number): string {
  const id = pick(SIGNAL_IDS, index, "mock-post-031");
  return `/post/${encodeURIComponent(id)}`;
}

export function vrCreatorHref(index: number): string {
  const id = pick(CREATOR_IDS, index, CREATOR_IDS[0] ?? "mock-profile-01");
  return `/channel/${encodeURIComponent(id)}`;
}

export function vrMarketHref(symbol: string): string {
  return `/markets/${encodeURIComponent(symbol)}`;
}

export function vrResultsHref(query: string): string {
  return `/results?q=${encodeURIComponent(query)}`;
}
