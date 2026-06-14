import { resolveCommodityCategory } from "@/features/markets/commodities/lib/commodity-regime-utils";
import { commodityDisplayLabel } from "@/features/markets/commodities/lib/map-commodity-tickers";
import { inferMarketAssetCategory } from "@/lib/market-category";

export type CommodityVenueDef = {
  id: string;
  name: string;
  yahoo: string;
  pair: string;
  isBenchmark?: boolean;
};

const YAHOO_TICKERS: Record<string, string> = {
  XAUUSD: "GC=F",
  XAU: "GC=F",
  XAGUSD: "SI=F",
  XAG: "SI=F",
  XPTUSD: "PL=F",
  XPDUSD: "PA=F",
  WTI: "CL=F",
  BRENT: "BZ=F",
  NGAS: "NG=F",
  NATGAS: "NG=F",
  COPPER: "HG=F",
  WHEAT: "ZW=F",
  CORN: "ZC=F",
  SOYBEAN: "ZS=F",
  COFFEE: "KC=F",
  SUGAR: "SB=F",
  COTTON: "CT=F",
  COCOA: "CC=F",
  ZINC: "ZN=F",
  NICKEL: "NI=F",
  ALUMINUM: "ALI=F",
};

const UNIT_BY_SYMBOL: Record<string, string> = {
  XAUUSD: "$/oz",
  XAU: "$/oz",
  XAGUSD: "$/oz",
  XAG: "$/oz",
  XPTUSD: "$/oz",
  XPDUSD: "$/oz",
  WTI: "$/bbl",
  BRENT: "$/bbl",
  NGAS: "$/mmbtu",
  NATGAS: "$/mmbtu",
  COPPER: "$/lb",
  WHEAT: "c/bu",
  CORN: "c/bu",
  SOYBEAN: "c/bu",
};

export function parseCommoditySymbol(raw: string | null): string | null {
  if (!raw) return null;
  const sym = raw.trim().toUpperCase().replace("/", "");
  if (!/^[A-Z0-9]{2,12}$/.test(sym)) return null;
  if (inferMarketAssetCategory(sym) !== "commodity") return null;
  return sym;
}

export function yahooTickerFor(symbol: string): string | null {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  if (YAHOO_TICKERS[sym]) return YAHOO_TICKERS[sym];
  for (const [key, ticker] of Object.entries(YAHOO_TICKERS)) {
    if (sym.includes(key) || key.includes(sym)) return ticker;
  }
  return null;
}

export function unitForCommoditySymbol(symbol: string): string {
  const sym = symbol.trim().toUpperCase().replace("/", "");
  if (UNIT_BY_SYMBOL[sym]) return UNIT_BY_SYMBOL[sym]!;
  for (const [key, unit] of Object.entries(UNIT_BY_SYMBOL)) {
    if (sym.includes(key.replace("USD", ""))) return unit;
  }
  const cat = resolveCommodityCategory(sym);
  if (cat === "degerli-metal") return "$/oz";
  if (cat === "enerji") return "$/bbl";
  if (cat === "tarim") return "c/bu";
  return "$/lb";
}

export function commodityNameFor(symbol: string, fallback?: string): string {
  return commodityDisplayLabel(symbol, fallback);
}

export function venueGroupFor(symbol: string): CommodityVenueDef[] {
  const sym = symbol.trim().toUpperCase().replace("/", "");

  if (sym.includes("XAU")) {
    return [
      { id: "comex", name: "COMEX", yahoo: "GC=F", pair: "Altın Fut", isBenchmark: true },
      { id: "lbma", name: "Spot Referans", yahoo: "GC=F", pair: "XAU/USD" },
      { id: "silver-ref", name: "Gümüş (ref)", yahoo: "SI=F", pair: "XAG/USD" },
    ];
  }

  if (sym.includes("XAG")) {
    return [
      { id: "comex-si", name: "COMEX", yahoo: "SI=F", pair: "Gümüş Fut", isBenchmark: true },
      { id: "gold-ref", name: "Altın (ref)", yahoo: "GC=F", pair: "XAU/USD" },
      { id: "plat-ref", name: "Platin (ref)", yahoo: "PL=F", pair: "XPT/USD" },
    ];
  }

  if (sym.includes("WTI") || sym === "CL") {
    return [
      { id: "nymex", name: "NYMEX WTI", yahoo: "CL=F", pair: "WTI Fut", isBenchmark: true },
      { id: "brent", name: "ICE Brent", yahoo: "BZ=F", pair: "Brent Fut" },
      { id: "gas", name: "Doğal Gaz", yahoo: "NG=F", pair: "NG Fut" },
    ];
  }

  if (sym.includes("BRENT")) {
    return [
      { id: "brent-bench", name: "ICE Brent", yahoo: "BZ=F", pair: "Brent Fut", isBenchmark: true },
      { id: "wti-ref", name: "NYMEX WTI", yahoo: "CL=F", pair: "WTI Fut" },
      { id: "gas-ref", name: "Doğal Gaz", yahoo: "NG=F", pair: "NG Fut" },
    ];
  }

  if (sym.includes("NG") || sym.includes("GAS")) {
    return [
      { id: "nymex-ng", name: "NYMEX NG", yahoo: "NG=F", pair: "NG Fut", isBenchmark: true },
      { id: "wti-ref", name: "WTI (ref)", yahoo: "CL=F", pair: "WTI Fut" },
      { id: "brent-ref", name: "Brent (ref)", yahoo: "BZ=F", pair: "Brent Fut" },
    ];
  }

  if (sym.includes("COPPER") || sym.includes("HG")) {
    return [
      { id: "comex-hg", name: "COMEX", yahoo: "HG=F", pair: "Bakır Fut", isBenchmark: true },
      { id: "zinc-ref", name: "Çinko (ref)", yahoo: "ZN=F", pair: "Zn Fut" },
      { id: "nickel-ref", name: "Nikel (ref)", yahoo: "NI=F", pair: "Ni Fut" },
    ];
  }

  if (sym.includes("WHEAT")) {
    return [
      { id: "cbot-zw", name: "CBOT", yahoo: "ZW=F", pair: "Buğday Fut", isBenchmark: true },
      { id: "corn-ref", name: "Mısır (ref)", yahoo: "ZC=F", pair: "Corn Fut" },
      { id: "soy-ref", name: "Soya (ref)", yahoo: "ZS=F", pair: "Soy Fut" },
    ];
  }

  const primary = yahooTickerFor(sym);
  if (!primary) return [];

  return [
    {
      id: "primary",
      name: commodityNameFor(sym),
      yahoo: primary,
      pair: sym,
      isBenchmark: true,
    },
  ];
}
