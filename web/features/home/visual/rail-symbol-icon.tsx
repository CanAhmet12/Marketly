import type { CSSProperties } from "react";

import {
  IconRailCrypto,
  IconRailDiscuss,
  IconRailForex,
  IconRailStocks,
  RAIL_SECTION_ICONS,
} from "./rail-icons";
import {
  inferSymbolCategory,
  RAIL_ACCENT_COLORS,
  RAIL_CATEGORY_COLORS,
} from "./rail-design-tokens";

type SymbolVisual = { glyph: string; bg: string; fg?: string };

/** Bilinen varlıklar — marka renkleri + glif */
const SYMBOL_VISUALS: Record<string, SymbolVisual> = {
  BTC: { glyph: "₿", bg: "#F7931A" },
  ETH: { glyph: "Ξ", bg: "#627EEA" },
  SOL: { glyph: "S", bg: "#9945FF" },
  BNB: { glyph: "B", bg: "#F3BA2F", fg: "#1a1a1a" },
  XRP: { glyph: "X", bg: "#23292F" },
  ADA: { glyph: "A", bg: "#0033AD" },
  DOGE: { glyph: "Ð", bg: "#C2A633", fg: "#1a1a1a" },
  AVAX: { glyph: "A", bg: "#E84142" },
  THYAO: { glyph: "TH", bg: "#5B8DEF" },
  GARAN: { glyph: "GA", bg: "#00A651" },
  AKBNK: { glyph: "AK", bg: "#E30613" },
  SISE: { glyph: "Ş", bg: "#5B8DEF" },
  EREGL: { glyph: "ER", bg: "#2DD4A8" },
  BIMAS: { glyph: "BI", bg: "#FF8C42" },
  USDTRY: { glyph: "$", bg: "#2DD4A8" },
  EURUSD: { glyph: "€", bg: "#2DD4A8" },
  GBPUSD: { glyph: "£", bg: "#2DD4A8" },
  EURTRY: { glyph: "€", bg: "#2DD4A8" },
  XAUUSD: { glyph: "Au", bg: "#FF8C42" },
  GOLD: { glyph: "Au", bg: "#FF8C42" },
  OIL: { glyph: "O", bg: "#1a1a1a" },
  BRENT: { glyph: "Br", bg: "#374151" },
  XU100: { glyph: "B", bg: "#A78BFA" },
  BIST100: { glyph: "B", bg: "#A78BFA" },
  SPX: { glyph: "S", bg: "#A78BFA" },
  NDX: { glyph: "N", bg: "#A78BFA" },
  DJI: { glyph: "D", bg: "#A78BFA" },
};

const CATEGORY_ICON_MAP = {
  crypto: IconRailCrypto,
  stocks: IconRailStocks,
  forex: IconRailForex,
  commodity: IconRailStocks,
  index: RAIL_SECTION_ICONS.index,
} as const;

function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase().replace(/^#/, "").trim();
}

function resolveAccentColor(symbol: string, color?: string): string {
  if (color) return color;
  const cat = inferSymbolCategory(symbol);
  if (cat) return RAIL_CATEGORY_COLORS[cat];
  return RAIL_ACCENT_COLORS.primary;
}

type RailSymbolIconProps = {
  symbol: string;
  color?: string;
  size?: number;
  className?: string;
};

/** Piyasa / sinyal / izleme satırları — sembol ikonu */
export function RailSymbolIcon({ symbol, color, size = 28, className }: RailSymbolIconProps) {
  const sym = normalizeSymbol(symbol);
  const visual = SYMBOL_VISUALS[sym];
  const accent = resolveAccentColor(sym, color);

  const style = {
    "--sym-icon-size": `${size}px`,
    "--sym-icon-bg": visual?.bg ?? `color-mix(in srgb, ${accent} 16%, transparent)`,
    "--sym-icon-fg": visual?.fg ?? (visual ? "#fff" : accent),
  } as CSSProperties;

  if (visual) {
    return (
      <span className={className ?? "hv-ref-rail__sym-icon"} style={style} aria-hidden>
        <span className="hv-ref-rail__sym-icon-glyph">{visual.glyph}</span>
      </span>
    );
  }

  const cat = inferSymbolCategory(sym);
  const CatIcon = cat ? CATEGORY_ICON_MAP[cat] : IconRailStocks;
  const initials = sym.length <= 4 ? sym.slice(0, 2) : sym.slice(0, 1);

  return (
    <span
      className={className ?? "hv-ref-rail__sym-icon hv-ref-rail__sym-icon--cat"}
      style={style}
      aria-hidden
    >
      {sym.length <= 5 ? (
        <span className="hv-ref-rail__sym-icon-glyph hv-ref-rail__sym-icon-glyph--sm">{initials}</span>
      ) : (
        <CatIcon className="hv-ref-rail__sym-icon-svg" size={Math.round(size * 0.52)} />
      )}
    </span>
  );
}

/** Trend konu — sembol etiketi veya tartışma ikonu */
export function RailTopicIcon({ label, className }: { label: string; className?: string }) {
  const raw = label.replace(/^#/, "").trim();
  const sym = normalizeSymbol(raw);
  const hasSymbolVisual = Boolean(SYMBOL_VISUALS[sym] || inferSymbolCategory(sym));

  if (hasSymbolVisual) {
    return <RailSymbolIcon symbol={sym} size={26} className={className ?? "hv-ref-rail__sym-icon hv-ref-rail__sym-icon--topic"} />;
  }

  return (
    <span className={className ?? "hv-ref-rail__sym-icon hv-ref-rail__sym-icon--topic hv-ref-rail__sym-icon--hash"} aria-hidden>
      <IconRailDiscuss className="hv-ref-rail__sym-icon-svg" size={14} />
    </span>
  );
}
