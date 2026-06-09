import type { ChannelTabId } from "@/features/channel/types";

/** Kanal sekmesi → renk bölgesi (Studio zone modeli) */
export type ChannelZone = "profile" | "community" | "signals" | "media" | "live";

export type ChannelZoneMeta = {
  id: ChannelZone;
  label: string;
  chartPrimary: string;
};

export const CHANNEL_ZONE_META: Record<ChannelZone, ChannelZoneMeta> = {
  profile: { id: "profile", label: "Profil", chartPrimary: "#0d9488" },
  community: { id: "community", label: "Topluluk", chartPrimary: "#d97706" },
  signals: { id: "signals", label: "Sinyaller", chartPrimary: "#059669" },
  media: { id: "media", label: "Medya", chartPrimary: "#4f6bdb" },
  live: { id: "live", label: "Canlı", chartPrimary: "#dc2626" },
};

/** Aktif sekme → kanal renk bölgesi */
export function resolveChannelZone(tab: ChannelTabId): ChannelZone {
  switch (tab) {
    case "overview":
    case "about":
    case "playlists":
      return "profile";
    case "posts":
    case "discussions":
    case "rooms":
      return "community";
    case "signals":
      return "signals";
    case "videos":
    case "pulse":
      return "media";
    case "live":
      return "live";
  }
}

export function channelZoneChartColor(zone: ChannelZone): string {
  return CHANNEL_ZONE_META[zone].chartPrimary;
}
