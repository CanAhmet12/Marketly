import { MOCK_TREND_MARKETS } from "@/mock/fixtures/markets";

import { getHomeRepository } from "@/features/home/repository";
import type { MarketAssetView } from "@/features/markets/types";

import type { HomeVisualMarketItem } from "../visual/mock-data";

function resultsHref(symbol: string): string {
  return `/results?q=${encodeURIComponent(symbol)}`;
}

function lookupPriceRow(symbol: string) {
  return MOCK_TREND_MARKETS.find((x) => x.symbol === symbol);
}

/** Movers satırı için şerit fiyat metni (mock fiyat tablosundan). */
function formatStripPrice(symbol: string, changePercent: number): string {
  const row = lookupPriceRow(symbol);
  if (!row) return "—";
  const p = row.price;
  if (symbol === "BTC" || symbol === "ETH") {
    return p >= 1000 ? p.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) : p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (symbol === "XU100" || symbol === "NDX" || symbol === "SPX") {
    return p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (symbol === "USDTRY" || symbol === "EURUSD" || symbol === "EURTRY") {
    return p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  if (symbol === "WTI" || symbol === "XAUUSD") {
    return p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  void changePercent;
  return p.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Piyasa şeridi — hareketlilerde yüzde + (mock’ta) fiyat tablosu; boşsa pulse.
 */
function formatLiveStripPrice(symbol: string, price: number): string {
  if (symbol === "BTC" || symbol === "ETH") {
    return price >= 1000 ? price.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) : price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

export function buildEditorialMarketStripItems(liveAssets?: MarketAssetView[]): HomeVisualMarketItem[] {
  if (liveAssets && liveAssets.length > 0) {
    return [...liveAssets]
      .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
      .slice(0, 14)
      .map((m) => ({
        symbol: m.symbol,
        name: m.name,
        price: formatLiveStripPrice(m.symbol, m.price),
        changePct: m.change_percent,
        href: resultsHref(m.symbol),
      }));
  }

  const repo = getHomeRepository();
  const movers = repo.getDiscoverMovers();
  if (movers.length > 0) {
    return movers.slice(0, 14).map((m) => ({
      symbol: m.symbol,
      name: m.name,
      price: formatStripPrice(m.symbol, m.change_percent),
      changePct: m.change_percent,
      href: resultsHref(m.symbol),
    }));
  }
  const pulse = repo.getMarketPulse();
  return pulse.slice(0, 12).map((p) => {
    const token = p.label.trim().split(/\s+/)[0] ?? p.label;
    return {
      symbol: token,
      name: p.label,
      price: "—",
      changePct: 0,
      href: p.href || resultsHref(token),
    };
  });
}
