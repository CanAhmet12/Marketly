import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchMarketAssets } from "@/features/markets/fetch-market-assets";
import { fetchTrendingSignals } from "@/features/home/fetch-home-extras";
import type { HomeVisualRailLink } from "@/features/home/visual/mock-data";

export type HomeEditorialChips = {
  today: HomeVisualRailLink[];
  trending: HomeVisualRailLink[];
};

function formatPct(change: number): string {
  if (Math.abs(change) < 0.0001) return "0,00%";
  return `${change >= 0 ? "+" : ""}${change.toFixed(2).replace(".", ",")}%`;
}

/** asset_prices movers + signals → home today/trending chips */
export async function fetchHomeEditorialChips(client: SupabaseClient): Promise<HomeEditorialChips> {
  const [assets, signals] = await Promise.all([
    fetchMarketAssets(client),
    fetchTrendingSignals(client, 8),
  ]);

  const movers = [...assets]
    .filter((a) => Math.abs(a.change_percent) > 0.05)
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 8);

  const today: HomeVisualRailLink[] = movers.map((m) => {
    const sign = m.change_percent > 0.04 ? "up" : m.change_percent < -0.04 ? "down" : "neutral";
    return {
      label: m.symbol,
      meta: formatPct(m.change_percent),
      accent: sign === "neutral" ? undefined : sign,
      href: `/results?q=${encodeURIComponent(m.symbol)}`,
    };
  });

  const trending: HomeVisualRailLink[] = signals.slice(0, 8).map((s) => ({
    label: s.symbol,
    meta: s.direction,
    href: `/signals/${s.id}`,
  }));

  return { today, trending };
}
