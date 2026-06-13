import type { CreatorDirectoryRow } from "@/features/creators/types";
import { getCardTagTone, type CardTagTone } from "@/features/discover/visual-reference/discover-card-tones";
import { formatCompactCount } from "@/lib/format-compact-count";

export type AnalystAccentTone = CardTagTone;

export function getAnalystAccentTone(row: CreatorDirectoryRow): AnalystAccentTone {
  const tag = row.assetTags[0] ?? row.bestSignalSymbol ?? row.specialties[0] ?? "";
  return getCardTagTone(tag);
}

export function creatorProfileHref(row: CreatorDirectoryRow): string {
  return row.channelHref;
}

/** Canlı yayın veya kanal — içerik odaklı CTA */
export function creatorPrimaryHref(row: CreatorDirectoryRow): string {
  if (row.isLive && row.liveHref) return row.liveHref;
  return row.channelHref;
}

export function accuracyBand(value: number | null): "high" | "mid" | "low" | "none" {
  if (value == null || value <= 0) return "none";
  if (value >= 75) return "high";
  if (value >= 55) return "mid";
  return "low";
}

export function tierLabel(tier: string): string {
  if (tier === "elite") return "Elite";
  if (tier === "pro") return "Pro";
  return "Analist";
}

export function formatProofLine(row: CreatorDirectoryRow): string {
  const parts: string[] = [];
  if (row.activeSignalsCount > 0) parts.push(`${row.activeSignalsCount} aktif sinyal`);
  parts.push(`${formatCompactCount(row.followerCount)} takipçi`);
  if (row.contentFormats.includes("live")) parts.push("Canlı yayın");
  return parts.slice(0, 3).join(" · ");
}

export const MARKET_LABELS: Record<AnalystAccentTone, string> = {
  bist: "BIST",
  crypto: "Kripto",
  forex: "Döviz",
  commodity: "Emtia",
  deriv: "Türev",
  macro: "Makro",
  default: "Piyasa",
};
