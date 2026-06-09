import type { OnboardingCatalog } from "@/features/onboarding/domain/types";

export type CatalogCreator = { id: string; label: string; handle: string };

/** Statik katalog — mock ve canlı Supabase ortak */
export function buildOnboardingCatalog(creators: CatalogCreator[] = []): OnboardingCatalog {
  return {
    identities: [
      { id: "investor", label: "Yatırımcı", sub: "Uzun vade, temel analiz, portföy" },
      { id: "trader", label: "Trader", sub: "Kısa vade, risk yönetimi, disiplin" },
      { id: "analyst", label: "Analist", sub: "Sinyal, model ve veri odaklı" },
      { id: "creator", label: "Üretici", sub: "İçerik + ekonomi vitrininizi büyütün" },
      { id: "explorer", label: "Keşifçi", sub: "Hafif tempo, çeşitli akışlar" },
    ],
    topics: [
      { id: "kripto", label: "Kripto" },
      { id: "bist", label: "BIST" },
      { id: "makro", label: "Makro" },
      { id: "fx", label: "Döviz" },
      { id: "emtia", label: "Emtia" },
      { id: "viop", label: "Viop" },
      { id: "teknoloji", label: "Teknoloji" },
      { id: "bankacilik", label: "Bankacılık" },
    ],
    market_themes: [
      { id: "risk_on", label: "Risk-on" },
      { id: "risk_off", label: "Risk-off" },
      { id: "vol", label: "Volatilite" },
      { id: "earnings", label: "Kazanç" },
    ],
    signal_styles: [
      { id: "swing", label: "Swing" },
      { id: "scalp", label: "Kısa vade" },
      { id: "balanced", label: "Dengeli" },
    ],
    strategies: [
      { id: "value", label: "Değer" },
      { id: "momentum", label: "Momentum" },
      { id: "macro", label: "Makro" },
      { id: "mixed", label: "Karma" },
    ],
    creators: creators.slice(0, 12),
    personas: [
      {
        id: "p-crypto",
        label: "Kripto",
        subline: "BTC · ETH · volatilite",
        preset: {
          identity: "trader",
          interest_topic_ids: ["kripto"],
          watchlist_symbols: ["BTC", "ETH"],
          signal_style: "scalp",
          strategy: "momentum",
        },
      },
      {
        id: "p-bist",
        label: "BIST",
        subline: "Endeks + hisse",
        preset: {
          identity: "investor",
          interest_topic_ids: ["bist", "bankacilik"],
          watchlist_symbols: ["XU100", "THYAO"],
          signal_style: "balanced",
          strategy: "value",
        },
      },
    ],
    creator_hints: [
      "Studio → Ekonomi ile abonelik katmanlarını düzenleyin.",
      "Haftalık canlı yayın + tartışma kuyruğu ile başlayın.",
    ],
    nav_after: [
      { href: "/", label: "Ana akış" },
      { href: "/discover", label: "Keşfet" },
      { href: "/watchlist", label: "Watchlist" },
    ],
    watchlist_starter_symbols: ["BTC", "ETH", "XU100", "AAPL", "THYAO", "GLD", "NVDA", "USDTRY"],
  };
}
