import type { MarketNewsDbRow } from "@/features/markets/fetch-market-news";
import { marketAssetCategoryLabelTr } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";
import type { DiscoverSignalCardRow } from "@/features/signals/repository/types";

import type { HomeVisualRailLink } from "../visual/mock-data";

function formatPct(change: number): string {
  if (Math.abs(change) < 0.0001) return "0,0%";
  return `${change >= 0 ? "+" : ""}${change.toFixed(1).replace(".", ",")}%`;
}

/** asset_prices + signals → ilgi alanı chip'leri (kişiselleştirme boşken). */
export function buildLiveInterestsFromMarketData(
  assets: readonly MarketAssetView[],
  signals: readonly DiscoverSignalCardRow[],
): HomeVisualRailLink[] {
  const rows: HomeVisualRailLink[] = [];
  const seen = new Set<string>();

  const push = (label: string, meta?: string, chipStrength: "high" | "mid" | "low" = "mid") => {
    const key = label.trim().toUpperCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    rows.push({ label, meta, chipStrength });
  };

  const categoryCounts = new Map<string, number>();
  for (const asset of assets) {
    if (Math.abs(asset.change_percent) < 0.08) continue;
    const label = marketAssetCategoryLabelTr(asset.category);
    categoryCounts.set(label, (categoryCounts.get(label) ?? 0) + 1);
  }
  for (const [label, count] of [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)) {
    push(label, `${count} hareket`, count >= 3 ? "high" : "mid");
  }

  const symCounts = new Map<string, number>();
  for (const signal of signals) {
    const sym = signal.symbol?.trim().toUpperCase();
    if (!sym) continue;
    symCounts.set(sym, (symCounts.get(sym) ?? 0) + 1);
  }
  for (const [sym] of [...symCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)) {
    push(sym, "Sinyal", "mid");
  }

  const movers = [...assets]
    .filter((a) => Math.abs(a.change_percent) > 0.35)
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent));
  for (const mover of movers) {
    if (rows.length >= 7) break;
    push(mover.symbol, formatPct(mover.change_percent), Math.abs(mover.change_percent) > 2 ? "high" : "mid");
  }

  return rows.slice(0, 7);
}

/** Piyasa nabzı — tek cümle özet. */
export function buildHomeAmbientSummaryFromLive(
  assets: readonly MarketAssetView[],
  signals: readonly DiscoverSignalCardRow[],
  newsRows?: readonly MarketNewsDbRow[],
): string {
  const parts: string[] = [];
  const topMover = [...assets].sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))[0];
  if (topMover && Math.abs(topMover.change_percent) > 0.15) {
    const dir = topMover.change_percent >= 0 ? "yükselişte" : "düşüşte";
    parts.push(`${topMover.symbol} ${dir} (${formatPct(topMover.change_percent)})`);
  }

  const buy = signals.filter((s) => s.direction === "BUY").length;
  const sell = signals.filter((s) => s.direction === "SELL").length;
  if (buy + sell > 0) {
    if (buy > sell * 1.2) parts.push("aktif sinyaller alım ağırlıklı");
    else if (sell > buy * 1.2) parts.push("aktif sinyaller satış ağırlıklı");
    else parts.push("sinyal dengesi nötr");
  }

  const headline = newsRows?.[0]?.title?.trim();
  if (headline) {
    const clip = headline.length > 56 ? `${headline.slice(0, 56)}…` : headline;
    parts.push(`gündem: ${clip}`);
  }

  if (parts.length === 0) {
    return "Piyasa verisi güncelleniyor; keşfet ve izleme listesiyle akışını şekillendir.";
  }
  const first = parts[0]!;
  return `${first.charAt(0).toUpperCase()}${first.slice(1)}${parts.length > 1 ? `; ${parts.slice(1).join("; ")}` : ""}.`;
}

/** Canlı kısayol sembolleri — en hareketli varlıklar. */
export function buildLiveMarketPulseFromAssets(
  assets: readonly MarketAssetView[],
): { label: string; href: string }[] {
  const ranked = [...assets]
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, 6);
  if (ranked.length === 0) {
    return [
      { label: "BTC", href: "/results?q=BTC" },
      { label: "ETH", href: "/results?q=ETH" },
      { label: "XU100", href: "/results?q=XU100" },
    ];
  }
  return ranked.map((a) => ({
    label: a.symbol,
    href: `/results?q=${encodeURIComponent(a.symbol)}`,
  }));
}
