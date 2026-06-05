/** Keşfet VR sekme tanımları — ağır mock data modülünden ayrı (code split). */
export type VRTabId = "live" | "pulse" | "videos" | "signals" | "creators";

export const VR_TABS: { id: VRTabId; label: string }[] = [
  { id: "live", label: "Canlı Yayınlar" },
  { id: "pulse", label: "Pulse" },
  { id: "videos", label: "Videolar" },
  { id: "signals", label: "Sinyaller" },
  { id: "creators", label: "Üreticiler" },
];
