import type { DiscoverTabId } from "@/features/feed/discover-feed-filters";

/**
 * Piyasa şeridi: yalnızca gönderi akışı sekmelerinde.
 * CANONICAL: creators ve signals sekmelerinde gizlenir (non-feed views).
 */
export function discoverShowsMarketPulseStrip(tab: DiscoverTabId): boolean {
  if (tab === "creators" || tab === "signals") return false;
  return true;
}

/**
 * CANONICAL DISCOVER INTRO (app parity)
 * 6 canonical tabs — clear content boundaries
 */
const UNLOCKED_INTRO: Record<DiscoverTabId, string> = {
  trending: "Platform genelinde öne çıkan içerik — videolar, pulse, canlı yayınlar ve sinyal keşfi.",
  pulse: "Kısa form içerik (<60 saniye) — dikey akış, TikTok tarzı keşif.",
  videos: "Uzun form videolar (>60 saniye) — YouTube tarzı keşif ve izleme.",
  live: "Şu an canlı yayınlar — gerçek zamanlı broadcast keşfi.",
  signals: "Ticaret sinyali keşfi — analiz ve alım/satım önerileri. Abonelik için Sinyal Pazarı.",
  creators: "İçerik üreticileri keşfi — analist, creator ve kanal profilleri.",
};

export function discoverUnlockedIntro(tab: DiscoverTabId): string {
  return UNLOCKED_INTRO[tab] ?? UNLOCKED_INTRO.trending;
}

/**
 * LOCKED TAB INTRO — ayrı rotalarda (/pulse, /videos, /live) gösterilecek açıklamalar
 */
const LOCKED_INTRO: Partial<Record<DiscoverTabId, string>> = {
  pulse: "Kısa form içerik keşfi — dikey akış, <60 saniye. Diğer içerik türleri için Keşfet sekmelerine geçin.",
  videos: "Uzun form video keşfi — >60 saniye, YouTube tarzı. Canlı ve Pulse için ayrı sekmeler.",
  live: "Canlı yayın keşfi — gerçek zamanlı broadcast'ler. Video ve Pulse için ayrı sekmeler.",
};

export function discoverLockedIntro(lockedTab: DiscoverTabId): string {
  return LOCKED_INTRO[lockedTab] ?? "Bu sayfa seçili içerik türünü listeler.";
}
