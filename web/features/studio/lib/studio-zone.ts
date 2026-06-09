/** Studio alt sayfa renk bölgeleri — pathname → zone */
import { normalizeStudioPath } from "@/features/studio/lib/studio-route-base";

export type StudioZone = "overview" | "content" | "analytics" | "economy" | "live";

export type StudioZoneMeta = {
  id: StudioZone;
  label: string;
  /** SVG stroke için birincil grafik rengi */
  chartPrimary: string;
};

export const STUDIO_ZONE_META: Record<StudioZone, StudioZoneMeta> = {
  overview: { id: "overview", label: "Genel Bakış", chartPrimary: "#0d9488" },
  content: { id: "content", label: "İçerik", chartPrimary: "#4f6bdb" },
  analytics: { id: "analytics", label: "Analitik", chartPrimary: "#0891b2" },
  economy: { id: "economy", label: "Ekonomi", chartPrimary: "#d4920a" },
  live: { id: "live", label: "Canlı Yayın", chartPrimary: "#dc2626" },
};

const CONTENT_PREFIXES = [
  "/studio/content",
  "/studio/drafts",
  "/studio/scheduled",
  "/studio/playlists",
] as const;

/** Aktif route → studio renk bölgesi */
export function resolveStudioZone(pathname: string): StudioZone {
  pathname = normalizeStudioPath(pathname);
  if (pathname === "/studio" || pathname === "/studio/") return "overview";
  if (pathname.startsWith("/studio/analytics")) return "analytics";
  if (pathname.startsWith("/studio/economy")) return "economy";
  if (pathname.startsWith("/studio/live")) return "live";
  if (CONTENT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return "content";
  }
  return "overview";
}

export function studioZoneChartColor(zone: StudioZone): string {
  return STUDIO_ZONE_META[zone].chartPrimary;
}
