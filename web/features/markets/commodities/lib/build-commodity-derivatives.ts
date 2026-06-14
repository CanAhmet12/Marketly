import type { CommodityDerivativesResponse } from "@/features/markets/commodities/lib/commodity-detail-types";
import { resolveCommodityCategory } from "@/features/markets/commodities/lib/commodity-regime-utils";
import {
  unitForCommoditySymbol,
  yahooTickerFor,
} from "@/features/markets/commodities/lib/commodity-symbol-meta";
import { fetchYahooQuote } from "@/features/markets/commodities/lib/commodity-yahoo";

function contractLabel(symbol: string): string {
  const sym = symbol.trim().toUpperCase();
  if (sym.includes("XAU")) return "COMEX GC (front)";
  if (sym.includes("XAG")) return "COMEX SI (front)";
  if (sym.includes("WTI") || sym === "CL") return "NYMEX CL (front)";
  if (sym.includes("BRENT")) return "ICE Brent (front)";
  if (sym.includes("NG") || sym.includes("GAS")) return "NYMEX NG (front)";
  if (sym.includes("COPPER")) return "COMEX HG (front)";
  if (sym.includes("WHEAT")) return "CBOT ZW (front)";
  const cat = resolveCommodityCategory(sym);
  if (cat === "degerli-metal") return "COMEX front";
  if (cat === "enerji") return "NYMEX front";
  if (cat === "tarim") return "CBOT front";
  return "CME front";
}

function biasFromContango(contangoPct: number): {
  bias: CommodityDerivativesResponse["bias"];
  biasLabel: string;
} {
  if (contangoPct > 0.35) {
    return { bias: "short", biasLabel: "Contango — roll maliyeti" };
  }
  if (contangoPct < -0.25) {
    return { bias: "long", biasLabel: "Backwardation — arz sıkı" };
  }
  return { bias: "neutral", biasLabel: "Nötr vade eğrisi" };
}

export async function fetchCommodityDerivatives(
  symbol: string,
): Promise<CommodityDerivativesResponse | null> {
  const sym = symbol.trim().toUpperCase();
  const futuresTicker = yahooTickerFor(sym);
  if (!futuresTicker) return null;

  const venues = [
    futuresTicker,
    sym.includes("WTI") ? "BZ=F" : null,
    sym.includes("XAU") ? "SI=F" : null,
  ].filter((t): t is string => Boolean(t));

  const quotes = await Promise.all(venues.map((t) => fetchYahooQuote(t)));
  const front = quotes[0];
  if (!front) return null;

  const spotProxy = quotes[1] ?? front;
  const basisPct =
    spotProxy.price > 0 ? ((front.price - spotProxy.price) / spotProxy.price) * 100 : 0;
  const contangoPct = basisPct;
  const rollYieldAnnualPct = -contangoPct * 12;
  const { bias, biasLabel } = biasFromContango(contangoPct);

  return {
    symbol: sym,
    unit: unitForCommoditySymbol(sym),
    source: "yahoo",
    updatedAt: Date.now(),
    contract: contractLabel(sym),
    markPrice: front.price,
    change24hPct: front.change24hPct,
    basisPct,
    contangoPct,
    rollYieldAnnualPct,
    openInterestLabel: "CME açık",
    bias,
    biasLabel,
  };
}
