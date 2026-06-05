import type { MarketAssetView, MarketLensId, MarketSegmentId } from "@/features/markets/types";

export function parseVolumeRough(vol: string): number {
  if (!vol || vol === "—") return 0;
  const t = vol.trim().toUpperCase().replace(/\s/g, "");
  const n = parseFloat(t.replace(/[^\d.]/g, ""));
  if (Number.isNaN(n)) return 0;
  if (t.includes("B")) return n * 1e9;
  if (t.includes("M")) return n * 1e6;
  if (t.includes("K")) return n * 1e3;
  return n;
}

export function segmentAssetCounts(assets: readonly MarketAssetView[]): Record<MarketSegmentId, number> {
  return {
    all: assets.length,
    crypto: assets.filter((a) => a.category === "crypto").length,
    stocks: assets.filter((a) => a.category === "stocks").length,
    forex: assets.filter((a) => a.category === "forex").length,
    commodity: assets.filter((a) => a.category === "commodity").length,
    index: assets.filter((a) => a.category === "index").length,
    watchlist: 0,
  };
}

export function applyMarketSegment(
  list: MarketAssetView[],
  segment: MarketSegmentId,
  watchlist: Set<string>,
): MarketAssetView[] {
  if (segment === "all") return [...list];
  if (segment === "watchlist") return list.filter((a) => watchlist.has(a.symbol));
  return list.filter((a) => a.category === segment);
}

export function applyMarketLens(
  list: MarketAssetView[],
  lens: MarketLensId,
  watch: Set<string>,
  pin: Set<string>,
): MarketAssetView[] {
  let out = [...list];
  switch (lens) {
    case "none":
      break;
    case "favorites":
      out = out.filter((a) => watch.has(a.symbol));
      break;
    case "gainers":
      out = out.filter((a) => a.change_percent > 0).sort((a, b) => b.change_percent - a.change_percent);
      break;
    case "losers":
      out = out.filter((a) => a.change_percent < 0).sort((a, b) => a.change_percent - b.change_percent);
      break;
    case "active":
      out.sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent));
      break;
    case "volume":
      out.sort((a, b) => parseVolumeRough(b.volume) - parseVolumeRough(a.volume));
      break;
    case "volatile":
      out.sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent));
      break;
    case "signals":
      out.sort((a, b) => b.signal_active_count - a.signal_active_count);
      break;
    case "watchlist":
      out = out.filter((a) => pin.has(a.symbol));
      break;
    default:
      break;
  }
  return out;
}
