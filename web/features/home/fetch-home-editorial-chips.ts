import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchTrendingSignals, fetchTrendingTopicsFromPosts } from "@/features/home/fetch-home-extras";
import {
  buildHomeAmbientSummaryFromLive,
  buildLiveInterestsFromMarketData,
} from "@/features/home/lib/build-home-live-intelligence";
import type { HomeVisualRailLink } from "@/features/home/visual/mock-data";
import { fetchMarketAssets } from "@/features/markets/fetch-market-assets";
import { fetchMarketNewsRows, type MarketNewsDbRow } from "@/features/markets/fetch-market-news";
import { railSymbolPriority } from "@/features/home/visual/rail-design-tokens";
import { buildSparklineSeries } from "@/features/markets/lib/sparkline-series";
import { fmtPrice } from "@/features/markets/lib/live-category/live-category-shared";
import { marketSymbolPath } from "@/features/markets/markets-routes";

export type HomeEditorialChips = {
  today: HomeVisualRailLink[];
  trending: HomeVisualRailLink[];
  interests: HomeVisualRailLink[];
  discussions: HomeVisualRailLink[];
  pulseSummary: string;
  newsRows: MarketNewsDbRow[];
};

/** Rail güven skoru 1–5; DB 1–5 veya 0–100 ölçeğini destekler */
function railConfidenceStars(raw: number): number {
  if (!Number.isFinite(raw)) return 3;
  if (raw <= 5) return Math.min(5, Math.max(1, Math.round(raw)));
  return Math.min(5, Math.max(1, Math.round(raw / 20)));
}

function formatPct(change: number): string {
  if (Math.abs(change) < 0.0001) return "0,00%";
  return `${change >= 0 ? "+" : ""}${change.toFixed(2).replace(".", ",")}%`;
}

/** asset_prices movers + signals + news → home editorial chips */
export async function fetchHomeEditorialChips(client: SupabaseClient): Promise<HomeEditorialChips> {
  const [assets, signals, newsRows, discussions] = await Promise.all([
    fetchMarketAssets(client),
    fetchTrendingSignals(client, 8),
    fetchMarketNewsRows(client, 8),
    fetchTrendingTopicsFromPosts(client, 5),
  ]);

  const movers = [...assets]
    .filter((a) => Math.abs(a.change_percent) > 0.05)
    .sort((a, b) => {
      const priA = Math.min(
        railSymbolPriority(a.symbol, a.category),
        railSymbolPriority(a.symbol, "crypto"),
        railSymbolPriority(a.symbol, "stocks"),
        railSymbolPriority(a.symbol, "forex"),
      );
      const priB = Math.min(
        railSymbolPriority(b.symbol, b.category),
        railSymbolPriority(b.symbol, "crypto"),
        railSymbolPriority(b.symbol, "stocks"),
        railSymbolPriority(b.symbol, "forex"),
      );
      if (priA !== priB) return priA - priB;
      return Math.abs(b.change_percent) - Math.abs(a.change_percent);
    })
    .slice(0, 8);

  const today: HomeVisualRailLink[] = movers.map((m) => {
    const sign = m.change_percent > 0.04 ? "up" : m.change_percent < -0.04 ? "down" : "neutral";
    return {
      label: m.symbol,
      meta: formatPct(m.change_percent),
      accent: sign === "neutral" ? undefined : sign,
      href: marketSymbolPath(m.symbol),
      price: fmtPrice(m.price),
      sparkline: m.sparkline.length > 1 ? m.sparkline : buildSparklineSeries(m.symbol, m.trend, 16),
      sparkTrend: m.trend,
      assetName: m.name,
      volumeLabel: m.volume,
      signalCount: m.signal_active_count > 0 ? m.signal_active_count : undefined,
      isHot: Math.abs(m.change_percent) > 1.5,
    };
  });

  const trending: HomeVisualRailLink[] = signals.slice(0, 6).map((s, i) => {
    const dir = s.direction === "BUY" || s.direction === "SELL" || s.direction === "HOLD" ? s.direction : "HOLD";
    const trend: "up" | "down" | "flat" =
      dir === "BUY" ? "up" : dir === "SELL" ? "down" : "flat";
    const entryLabel =
      s.entry_price != null ? `Giriş ${fmtPrice(s.entry_price)}` : undefined;
    return {
      label: s.symbol,
      meta: s.timeframe ?? "1G",
      href: `/signals/${s.id}`,
      signalDirection: dir,
      confidence: railConfidenceStars(s.confidence),
      timeframe: s.timeframe ?? "1G",
      sparkline: buildSparklineSeries(`sig-${s.id}`, trend, 14),
      sparkTrend: trend,
      rank: i + 1,
      trendDelta: s.copies_count > 0 ? `${s.copies_count} kopya` : undefined,
      trendDeltaAccent: dir === "BUY" ? "up" : dir === "SELL" ? "down" : "neutral",
      detail: entryLabel,
      isHot: railConfidenceStars(s.confidence) >= 4,
      assetName: s.creatorDisplay,
    };
  });

  const interests = buildLiveInterestsFromMarketData(assets, signals);
  const pulseSummary = buildHomeAmbientSummaryFromLive(assets, signals, newsRows);

  return { today, trending, interests, discussions, pulseSummary, newsRows };
}
