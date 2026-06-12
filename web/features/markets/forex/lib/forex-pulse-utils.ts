import type { ForexPairItem, ForexPulseMetrics, ForexSession } from "@/features/markets/forex/types";
import type { MarketAssetView } from "@/features/markets/types";

import {
  avgChange,
  findAsset,
  pairLabel,
  sparkOrFlat,
} from "@/features/markets/lib/live-category/live-category-shared";

import { sparkFromChange } from "./forex-sparkline-utils";

const DXY_BASE = 104.2;

const SESSION_DEFS = [
  { name: "Tokyo" as const, label: "Tokyo", openUtc: 0, closeUtc: 9, time: "00:00–09:00 UTC" },
  { name: "London" as const, label: "Londra", openUtc: 8, closeUtc: 17, time: "08:00–17:00 UTC" },
  { name: "NewYork" as const, label: "New York", openUtc: 13, closeUtc: 22, time: "13:00–22:00 UTC" },
] as const;

function sessionStatus(openUtc: number, closeUtc: number, hourUtc: number): ForexSession["status"] {
  if (hourUtc >= openUtc && hourUtc < closeUtc) return "active";
  const soonHour = (openUtc + 23) % 24;
  if (hourUtc === soonHour) return "soon";
  return "closed";
}

export function buildForexSessions(now = new Date()): ForexSession[] {
  const hourUtc = now.getUTCHours();
  return SESSION_DEFS.map((s) => ({
    name: s.name,
    label: s.label,
    status: sessionStatus(s.openUtc, s.closeUtc, hourUtc),
    time: s.time,
  }));
}

function pairItem(asset: MarketAssetView): ForexPairItem {
  return {
    pair: pairLabel(asset.symbol),
    rate: asset.price,
    changePct: asset.change_percent,
    sparkline: sparkOrFlat(asset),
  };
}

function emptyPair(pair: string): ForexPairItem {
  return { pair, rate: 0, changePct: 0, sparkline: [] };
}

/** Canlı DXY varsa kullan; yoksa majör USD paritelerinden sentetik endeks */
export function resolveForexDxy(assets: readonly MarketAssetView[]): ForexPulseMetrics["dxy"] {
  const dxyAsset = findAsset(assets, "DXY");
  if (dxyAsset) {
    return {
      value: dxyAsset.price,
      changePct: dxyAsset.change_percent,
      sparkline: sparkOrFlat(dxyAsset),
    };
  }

  const eur = findAsset(assets, "EURUSD");
  const gbp = findAsset(assets, "GBPUSD");
  const jpy = findAsset(assets, "USDJPY");

  let synthChange = 0;
  let count = 0;
  if (eur) {
    synthChange -= eur.change_percent;
    count++;
  }
  if (gbp) {
    synthChange -= gbp.change_percent;
    count++;
  }
  if (jpy) {
    synthChange += jpy.change_percent;
    count++;
  }

  const changePct = count ? synthChange / count : avgChange(assets);
  const value = DXY_BASE * (1 + changePct / 100);

  return {
    value,
    changePct,
    sparkline: sparkFromChange(changePct, 9),
  };
}

export function computeFxVolatility(assets: readonly MarketAssetView[]): ForexPulseMetrics["volatility"] {
  if (!assets.length) return { value: 0, label: "Düşük" };

  const absChanges = assets.map((a) => Math.abs(a.change_percent));
  const avgAbs = absChanges.reduce((s, v) => s + v, 0) / absChanges.length;
  const maxAbs = Math.max(...absChanges);
  const value = Math.min(100, Math.round(avgAbs * 35 + maxAbs * 8));

  const label = value >= 65 ? "Yüksek" : value >= 35 ? "Orta" : "Düşük";
  return { value, label };
}

export function buildForexPulseMetrics(assets: readonly MarketAssetView[]): ForexPulseMetrics {
  const eurusd = findAsset(assets, "EURUSD") ?? assets[0]!;
  const gbpusd = findAsset(assets, "GBPUSD") ?? assets[1] ?? assets[0]!;
  const usdtry = findAsset(assets, "USDTRY");
  const usdjpy = findAsset(assets, "USDJPY");

  return {
    eurusd: pairItem(eurusd),
    gbpusd: pairItem(gbpusd),
    usdtry: usdtry ? pairItem(usdtry) : emptyPair("USD/TRY"),
    usdjpy: usdjpy ? pairItem(usdjpy) : emptyPair("USD/JPY"),
    dxy: resolveForexDxy(assets),
    sessions: buildForexSessions(),
    volatility: computeFxVolatility(assets),
  };
}
