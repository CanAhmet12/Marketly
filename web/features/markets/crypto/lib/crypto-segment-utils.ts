import type { CryptoHeatLevel, CryptoSegmentItem } from "@/features/markets/crypto/types";
import type { MarketAssetView } from "@/features/markets/types";

import { sparkOrFlat } from "@/features/markets/lib/live-category/live-category-shared";

import { sparkFromChange } from "./crypto-sparkline-utils";

const SEGMENT_DEFS: { id: string; name: string; match: (symbol: string) => boolean }[] = [
  {
    id: "l1",
    name: "Layer 1",
    match: (s) => /^(BTC|ETH|SOL|BNB|ADA|AVAX|NEAR|TIA|SUI|DOT|ATOM|XRP|LTC|BCH|ETC|ICP|APT|SEI|HBAR)$/i.test(s),
  },
  {
    id: "defi",
    name: "DeFi",
    match: (s) => /^(UNI|LINK|INJ|AAVE|MKR|CRV|COMP|SNX|LDO|RUNE|JUP|DYDX|PENDLE)$/i.test(s),
  },
  {
    id: "l2",
    name: "Layer 2",
    match: (s) => /^(ARB|OP|MATIC|POL|IMX|STRK|ZK|MANTA|METIS|BOBA)$/i.test(s),
  },
  {
    id: "ai",
    name: "AI Tokens",
    match: (s) => /^(FET|RNDR|RENDER|TAO|WLD|ARKM|AGIX|OCEAN|GRT|AI16Z|VIRTUAL)$/i.test(s),
  },
  {
    id: "meme",
    name: "Meme",
    match: (s) => /^(DOGE|SHIB|PEPE|BONK|WIF|FLOKI|BRETT|MEW|POPCAT)$/i.test(s),
  },
  {
    id: "gaming",
    name: "Gaming",
    match: (s) => /^(AXS|SAND|GALA|MANA|ENJ|ILV|BEAM|PRIME|PIXEL|PORTAL|SUPER)$/i.test(s),
  },
];

export function resolveCryptoSegmentLabel(symbol: string): string {
  return resolveCryptoSegment(symbol).name;
}

export function resolveCryptoSegment(symbol: string): { id: string; name: string } {
  const key = symbol.trim().toUpperCase().replace(/USDT$|USD$/, "");
  const hit = SEGMENT_DEFS.find((def) => def.match(key));
  return hit ? { id: hit.id, name: hit.name } : { id: "altcoin", name: "Altcoin" };
}

function normalizeCryptoSymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/USDT$|USD$/, "");
}

export function findCryptoSegmentPeers(
  symbol: string,
  assets: readonly MarketAssetView[],
  limit = 8,
): MarketAssetView[] {
  const key = normalizeCryptoSymbol(symbol);
  const segment = SEGMENT_DEFS.find((def) => def.match(key));
  const pool = assets.filter((a) => !/USDT|USDC|DAI|BUSD|TUSD|FDUSD/i.test(a.symbol));

  const matchesSegment = (sym: string) => {
    const k = normalizeCryptoSymbol(sym);
    if (segment) return segment.match(k);
    return !SEGMENT_DEFS.some((def) => def.match(k));
  };

  return pool
    .filter((a) => normalizeCryptoSymbol(a.symbol) !== key && matchesSegment(a.symbol))
    .sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent))
    .slice(0, limit);
}

function heatLevelFromChange(changePct: number): CryptoHeatLevel {
  if (changePct > 2) return "hot-strong";
  if (changePct > 0.5) return "hot-mild";
  if (changePct > -0.5) return "neutral";
  if (changePct > -2) return "cold-mild";
  return "cold-strong";
}

function attachBarPct(segments: CryptoSegmentItem[]): CryptoSegmentItem[] {
  const maxAbs = Math.max(...segments.map((s) => Math.abs(s.change24h)), 0.01);
  return segments.map((seg) => ({
    ...seg,
    barPct: Math.round((Math.abs(seg.change24h) / maxAbs) * 100),
  }));
}

export function buildCryptoSegmentHeatmap(assets: readonly MarketAssetView[]): CryptoSegmentItem[] {
  const stocks = assets.filter((a) => !/USDT|USDC|DAI|BUSD|TUSD|FDUSD/i.test(a.symbol));

  const segments = SEGMENT_DEFS.map((def) => {
    const pool = stocks.filter((a) => def.match(a.symbol.replace(/USDT|USDC$/i, "")));
    const change24h =
      pool.length > 0
        ? Math.round((pool.reduce((s, a) => s + a.change_percent, 0) / pool.length) * 100) / 100
        : 0;
    const leader = [...pool].sort((a, b) => b.change_percent - a.change_percent)[0];
    const leaderLabel = leader
      ? `${leader.symbol} ${leader.change_percent >= 0 ? "+" : ""}${leader.change_percent.toFixed(2)}%`
      : "—";

    return {
      id: def.id,
      name: def.name,
      change24h,
      leader: leaderLabel,
      heatLevel: heatLevelFromChange(change24h),
      barPct: 0,
      sparkline:
        leader && sparkOrFlat(leader).length > 1
          ? sparkOrFlat(leader)
          : sparkFromChange(change24h, 7),
    };
  });

  return attachBarPct(segments);
}
