import type { CSSProperties } from "react";

import {
  inferSymbolCategory,
  inferSymbolRailColor,
  RAIL_CATEGORY_COLORS,
} from "@/features/home/visual/rail-design-tokens";
import type { MarketAssetCategory } from "@/features/markets/types";

/** Bilinen varlıklar — marka glif + metin rengi (arka plan yok) */
const TICKER_BRAND: Record<string, { glyph: string; color: string }> = {
  BTC: { glyph: "₿", color: "#F7931A" },
  ETH: { glyph: "Ξ", color: "#627EEA" },
  SOL: { glyph: "◎", color: "#9945FF" },
  BNB: { glyph: "◆", color: "#F3BA2F" },
  XRP: { glyph: "✕", color: "#9AA4B2" },
  ADA: { glyph: "₳", color: "#0033AD" },
  DOGE: { glyph: "Ð", color: "#C2A633" },
  AVAX: { glyph: "▲", color: "#E84142" },
  THYAO: { glyph: "✈", color: "#5B8DEF" },
  GARAN: { glyph: "G", color: "#00A651" },
  AKBNK: { glyph: "A", color: "#E30613" },
  SISE: { glyph: "Ş", color: "#5B8DEF" },
  EREGL: { glyph: "E", color: "#2DD4A8" },
  BIMAS: { glyph: "B", color: "#FF8C42" },
  USDTRY: { glyph: "$", color: RAIL_CATEGORY_COLORS.forex },
  EURUSD: { glyph: "€", color: RAIL_CATEGORY_COLORS.forex },
  GBPUSD: { glyph: "£", color: RAIL_CATEGORY_COLORS.forex },
  EURTRY: { glyph: "€", color: RAIL_CATEGORY_COLORS.forex },
  XAUUSD: { glyph: "Au", color: RAIL_CATEGORY_COLORS.commodity },
  GOLD: { glyph: "Au", color: RAIL_CATEGORY_COLORS.commodity },
  OIL: { glyph: "◉", color: "#94A3B8" },
  BRENT: { glyph: "Br", color: "#64748B" },
  XU100: { glyph: "B", color: RAIL_CATEGORY_COLORS.index },
  BIST100: { glyph: "B", color: RAIL_CATEGORY_COLORS.index },
  SPX: { glyph: "S", color: RAIL_CATEGORY_COLORS.index },
  NDX: { glyph: "N", color: RAIL_CATEGORY_COLORS.index },
  DJI: { glyph: "D", color: RAIL_CATEGORY_COLORS.index },
};

export type TickerMarkVisual = {
  glyph: string;
  color: string;
  category: MarketAssetCategory | keyof typeof RAIL_CATEGORY_COLORS | null;
};

function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase().replace(/^#/, "").trim();
}

export function resolveTickerMark(
  symbol: string,
  category?: MarketAssetCategory | null,
): TickerMarkVisual {
  const sym = normalizeSymbol(symbol);
  const brand = TICKER_BRAND[sym];
  if (brand) {
    const cat = category ?? inferSymbolCategory(sym);
    return { glyph: brand.glyph, color: brand.color, category: cat };
  }

  const cat = category ?? inferSymbolCategory(sym);
  const color = cat ? RAIL_CATEGORY_COLORS[cat] : inferSymbolRailColor(sym);
  const glyph =
    cat === "crypto"
      ? sym.slice(0, 1)
      : cat === "forex"
        ? sym.includes("USD")
          ? "$"
          : sym.includes("EUR")
            ? "€"
            : sym.slice(0, 1)
        : sym.length <= 4
          ? sym.slice(0, 2)
          : sym.slice(0, 1);

  return { glyph, color, category: cat };
}

type Props = {
  symbol: string;
  category?: MarketAssetCategory | null;
  className?: string;
};

/** Arka plansız marka glif — ticker şeridi */
export function TickerMark({ symbol, category, className }: Props) {
  const mark = resolveTickerMark(symbol, category);

  return (
    <span
      className={className ?? "dvr-ticker-mark"}
      style={{ "--ticker-mark-color": mark.color } as CSSProperties}
      data-category={mark.category ?? undefined}
      aria-hidden
    >
      {mark.glyph}
    </span>
  );
}
