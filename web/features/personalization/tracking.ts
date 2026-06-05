import type { PersonalizationContentFormat, PersonalizationEvent, PersonalizationEventKind } from "@/features/personalization/domain/personalization-types";
import { getPersonalizationRepository } from "@/features/personalization/repository";

function repo() {
  return getPersonalizationRepository();
}

export function trackPersonalization(kind: PersonalizationEventKind, fields: Omit<PersonalizationEvent, "kind" | "ts">): void {
  if (typeof window === "undefined") return;
  repo().recordInteraction({ kind, ...fields, ts: Date.now() });
}

export function trackAssetView(symbol: string, surface?: string): void {
  const s = symbol.trim().toUpperCase();
  if (!s) return;
  trackPersonalization("asset_view", { assetSymbol: s, surface });
}

export function trackCreatorView(creatorId: string, surface?: string): void {
  if (!creatorId) return;
  trackPersonalization("creator_view", { creatorId, surface });
}

export function trackContentView(fields: {
  creatorId?: string;
  assetSymbol?: string;
  contentFormat?: PersonalizationContentFormat;
  surface?: string;
  quality?: number;
}): void {
  trackPersonalization("content_view", fields);
}

export function trackWatchProgress(fields: {
  creatorId?: string;
  assetSymbol?: string;
  contentFormat?: PersonalizationContentFormat;
  quality?: number;
  surface?: string;
}): void {
  trackPersonalization("watch_progress", fields);
}

export function trackDiscussionOpen(postId: string, creatorId?: string | null, assetTag?: string | null): void {
  trackPersonalization("discussion_open", {
    discussionId: postId,
    creatorId: creatorId ?? undefined,
    assetSymbol: assetTag?.trim().toUpperCase() || undefined,
    contentFormat: "discussion",
  });
}

export function trackSearchQuery(query: string, surface?: string): void {
  const q = query.trim();
  if (q.length < 2) return;
  trackPersonalization("search_query", { query: q, surface });
}

export function trackSignalCopy(signalId: string, symbol: string, creatorId: string): void {
  trackPersonalization("signal_copy", {
    signalId,
    assetSymbol: symbol.trim().toUpperCase(),
    creatorId,
    contentFormat: "signal",
  });
}

export function trackRoomOpen(roomId: string, surface?: string): void {
  trackPersonalization("room_open", { roomId, surface });
}

export function trackRecommendationClick(surface: string, fields?: { creatorId?: string; assetSymbol?: string }): void {
  trackPersonalization("recommendation_click", {
    surface,
    creatorId: fields?.creatorId,
    assetSymbol: fields?.assetSymbol,
  });
}
