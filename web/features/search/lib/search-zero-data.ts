import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";

export type SearchTrendTone = "crypto" | "bist" | "equity" | "commodity" | "index";

export type SearchTrendTile = {
  q: string;
  label: string;
  symbol: string;
  tag: string;
  tone: SearchTrendTone;
};

export type SearchZeroShortcut = {
  href: string;
  label: string;
  desc: string;
  icon: "creators" | "videos" | "signals" | "markets";
};

export const SEARCH_TREND_TILES: SearchTrendTile[] = [
  { q: "Bitcoin", label: "Bitcoin", symbol: "BTC", tag: "Kripto", tone: "crypto" },
  { q: "BIST100", label: "BIST 100", symbol: "XU100", tag: "Endeks", tone: "bist" },
  { q: "ETH", label: "Ethereum", symbol: "ETH", tag: "Kripto", tone: "crypto" },
  { q: "TSLA", label: "Tesla", symbol: "TSLA", tag: "Hisse", tone: "equity" },
  { q: "Altın", label: "Altın", symbol: "XAU", tag: "Emtia", tone: "commodity" },
  { q: "Nasdaq", label: "Nasdaq", symbol: "NDX", tag: "Endeks", tone: "index" },
];

export const SEARCH_ZERO_SHORTCUTS: SearchZeroShortcut[] = [
  { href: DISCOVER_VERTICAL_ROUTES.creators, label: "Üreticiler", desc: "Analist & kanal", icon: "creators" },
  { href: DISCOVER_VERTICAL_ROUTES.videos, label: "Videolar", desc: "Eğitim & analiz", icon: "videos" },
  { href: DISCOVER_VERTICAL_ROUTES.signals, label: "Sinyaller", desc: "Canlı fikirler", icon: "signals" },
  { href: "/markets", label: "Piyasalar", desc: "Sembol & fiyat", icon: "markets" },
];
