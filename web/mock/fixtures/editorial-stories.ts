import type { StoryRing } from "@/features/home/repository/types";

/**
 * Hikâye şeridi — farklı uzunluklar, canlı/yeni durumları hissi (mock).
 * href: ilgili creator veya arama bağlamı.
 */
export const MOCK_STORY_RINGS: StoryRing[] = [
  { id: "st-fed", label: "Fed canlı not", thumbnail_url: "https://i.pravatar.cc/120?img=52", href: "/results?q=Fed" },
  { id: "st-xu", label: "XU100 açılış", thumbnail_url: "https://i.pravatar.cc/120?img=33", href: "/results?q=XU100" },
  { id: "st-makro", label: "Makro özet", thumbnail_url: "https://i.pravatar.cc/120?img=19", href: "/discover" },
  { id: "st-btc", label: "BTC seviye", thumbnail_url: "https://i.pravatar.cc/120?img=12", href: "/results?q=BTC" },
  { id: "st-viop", label: "VIOP straddle", thumbnail_url: "https://i.pravatar.cc/120?img=47", href: "/results?q=VIOP" },
  { id: "st-earn", label: "KAP — bilanço", thumbnail_url: "https://i.pravatar.cc/120?img=27", href: "/discover?tab=pulse" },
  { id: "st-fx", label: "EUR/TRY bandı", thumbnail_url: "https://i.pravatar.cc/120?img=41", href: "/results?q=EURTRY" },
  { id: "st-ai", label: "AI semis", thumbnail_url: "https://i.pravatar.cc/120?img=8", href: "/results?q=NVDA" },
  { id: "st-etf", label: "Altın ETF", thumbnail_url: "https://i.pravatar.cc/120?img=15", href: "/results?q=GLD" },
];
