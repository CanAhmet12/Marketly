export type HubNavItem = {
  href: string;
  label: string;
  description?: string;
  end?: boolean;
  external?: boolean;
};

export type HubNavGroupId = "core" | "finance" | "connect" | "tools";

export type HubNavGroup = {
  id: HubNavGroupId;
  label: string;
  /** Bölüm başlık rengi */
  accent: string;
  /** İlk açılış — localStorage yoksa */
  defaultOpen: boolean;
  items: HubNavItem[];
};

/**
 * Kanalım navigasyon — 4 mantıksal blok (7 yerine)
 * core → finans → bağlantılar → araçlar
 */
export const HUB_NAV_GROUPS: HubNavGroup[] = [
  {
    id: "core",
    label: "Kanalım",
    accent: "#6366f1",
    defaultOpen: true,
    items: [
      { href: "/hub/profile", label: "Profil", end: true },
    ],
  },
  {
    id: "finance",
    label: "Finans",
    accent: "#059669",
    defaultOpen: true,
    items: [
      { href: "/hub/portfolio", label: "Portföy" },
      { href: "/hub/watchlist", label: "Takip Listem" },
      { href: "/hub/price-alerts", label: "Fiyat Alarmları" },
    ],
  },
  {
    id: "connect",
    label: "Bağlantılar",
    accent: "#4f6bdb",
    defaultOpen: true,
    items: [
      { href: "/hub/messages", label: "Mesajlar" },
      { href: "/hub/notifications", label: "Bildirimler" },
      { href: "/hub/saved", label: "Kaydedilenler" },
      { href: "/hub/subscriptions", label: "Abonelikler" },
      { href: "/hub/close-friends", label: "Yakın Arkadaşlar" },
    ],
  },
  {
    id: "tools",
    label: "Araçlar",
    accent: "#7c6adb",
    defaultOpen: false,
    items: [
      { href: "/hub/studio", label: "Creator Studio" },
      { href: "/hub/upload", label: "İçerik Oluştur" },
      { href: "/hub/settings", label: "Ayarlar" },
    ],
  },
];

export const HUB_NAV_FLAT: HubNavItem[] = HUB_NAV_GROUPS.flatMap((g) => g.items);

export const HUB_PROFILE_PATH = "/hub/profile";
export const HUB_HOME_PATH = HUB_PROFILE_PATH;

export function hubGroupForPath(pathname: string): HubNavGroupId | null {
  for (const group of HUB_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.external) continue;
      if (item.end ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return group.id;
      }
    }
  }
  return null;
}
