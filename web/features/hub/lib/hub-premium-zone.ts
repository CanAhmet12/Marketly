import type { HubZoneId } from "@/features/hub/lib/hub-zone";

/** Hub premium — bölge meta (sidebar grupları ile hizalı) */
export type HubPremiumZoneMeta = {
  id: HubZoneId;
  label: string;
  kickerPrefix: string;
  zone1: string;
  zone2: string;
  zone3: string;
  chartPrimary: string;
};

export const HUB_PREMIUM_ZONE_META: Record<HubZoneId, HubPremiumZoneMeta> = {
  profile: {
    id: "profile",
    label: "Kanalım",
    kickerPrefix: "Marketly · Kanalım",
    zone1: "#6366f1",
    zone2: "#4f46e5",
    zone3: "#a5b4fc",
    chartPrimary: "#6366f1",
  },
  finance: {
    id: "finance",
    label: "Finans",
    kickerPrefix: "Marketly · Finans",
    zone1: "#059669",
    zone2: "#047857",
    zone3: "#6ee7b7",
    chartPrimary: "#0f9d75",
  },
  connect: {
    id: "connect",
    label: "Bağlantılar",
    kickerPrefix: "Marketly · Bağlantılar",
    zone1: "#4f6bdb",
    zone2: "#3446a8",
    zone3: "#93a8f5",
    chartPrimary: "#4f6bdb",
  },
  inbox: {
    id: "inbox",
    label: "Gelen Kutusu",
    kickerPrefix: "Marketly · Mesajlar",
    zone1: "#2563eb",
    zone2: "#1d4ed8",
    zone3: "#93c5fd",
    chartPrimary: "#2563eb",
  },
  tools: {
    id: "tools",
    label: "Araçlar",
    kickerPrefix: "Marketly · Araçlar",
    zone1: "#7c6adb",
    zone2: "#5b4bb4",
    zone3: "#c4b5fd",
    chartPrimary: "#7c6adb",
  },
  overview: {
    id: "overview",
    label: "Kanalım",
    kickerPrefix: "Marketly · Kanalım",
    zone1: "#6366f1",
    zone2: "#4f46e5",
    zone3: "#a5b4fc",
    chartPrimary: "#6366f1",
  },
};

export function hubPremiumZoneMeta(zone: HubZoneId): HubPremiumZoneMeta {
  return HUB_PREMIUM_ZONE_META[zone];
}

export function hubPremiumKicker(zone: HubZoneId, segment?: string): string {
  const base = HUB_PREMIUM_ZONE_META[zone].kickerPrefix;
  return segment ? `${base} · ${segment}` : base;
}
