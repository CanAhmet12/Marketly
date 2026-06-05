import type { StudioQuickAction } from "./types";

/** Navigasyon — mock/Supabase aynı; veri değil */
export const STUDIO_QUICK_ACTIONS: StudioQuickAction[] = [
  { id: "upload", label: "İçerik yükle", href: "/upload", variant: "primary" },
  { id: "content", label: "İçerik yönetimi", href: "/studio/content", variant: "secondary" },
  { id: "drafts", label: "Taslaklar", href: "/studio/drafts", variant: "secondary" },
  { id: "scheduled", label: "Zamanlanmış", href: "/studio/scheduled", variant: "secondary" },
  { id: "analytics", label: "Analitik", href: "/studio/analytics", variant: "ghost" },
  { id: "live", label: "Canlı planı", href: "/studio/live", variant: "ghost" },
  { id: "economy", label: "Creator ekonomisi", href: "/studio/economy", variant: "ghost" },
];
