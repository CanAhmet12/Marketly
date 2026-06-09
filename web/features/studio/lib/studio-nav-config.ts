export type StudioNavItem = {
  href: string;
  label: string;
  end?: boolean;
};

export type StudioNavGroup = {
  id: string;
  label: string;
  items: StudioNavItem[];
};

/** Sol rail + mobil subnav — tek kaynak */
export const STUDIO_NAV_GROUPS: StudioNavGroup[] = [
  {
    id: "overview",
    label: "Genel",
    items: [{ href: "/studio", label: "Genel Bakış", end: true }],
  },
  {
    id: "content",
    label: "İçerik",
    items: [
      { href: "/studio/content", label: "Kütüphane" },
      { href: "/studio/drafts", label: "Taslaklar" },
      { href: "/studio/scheduled", label: "Zamanlanmış" },
      { href: "/studio/playlists", label: "Oynatma Listeleri" },
    ],
  },
  {
    id: "growth",
    label: "Büyüme",
    items: [
      { href: "/studio/analytics", label: "Analitik" },
      { href: "/studio/economy", label: "Ekonomi" },
    ],
  },
  {
    id: "live",
    label: "Canlı",
    items: [{ href: "/studio/live", label: "Canlı Yayın" }],
  },
];

export const STUDIO_NAV_FLAT: StudioNavItem[] = STUDIO_NAV_GROUPS.flatMap((g) => g.items);
