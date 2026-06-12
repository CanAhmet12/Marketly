import type { ForexMarketRegimePayload, ForexRegimeType } from "@/features/markets/forex/types";
import type { MarketAssetView } from "@/features/markets/types";

import { avgChange, findAsset } from "@/features/markets/lib/live-category/live-category-shared";

import {
  buildForexCurrencyHeatmap,
  computeCurrencyDistribution,
} from "./forex-currency-utils";
import { computeFxVolatility, resolveForexDxy } from "./forex-pulse-utils";

const REGIME_HEADLINE: Record<ForexRegimeType, string> = {
  "usd-dominant": "USD BASKIN",
  "risk-on": "RISK-ON",
  "risk-off": "RISK-OFF",
  range: "YATAY PİYASA",
};

function avgRiskyChange(assets: readonly MarketAssetView[]): number {
  const risky = ["AUDUSD", "NZDUSD", "GBPUSD"].map((s) => findAsset(assets, s)).filter(Boolean);
  if (!risky.length) return avgChange(assets);
  return risky.reduce((s, a) => s + a!.change_percent, 0) / risky.length;
}

function avgAbsChange(assets: readonly MarketAssetView[]): number {
  if (!assets.length) return 0;
  return assets.reduce((s, a) => s + Math.abs(a.change_percent), 0) / assets.length;
}

export function resolveForexRegimeType(
  assets: readonly MarketAssetView[],
  dxyChange: number,
): ForexRegimeType {
  const eur = findAsset(assets, "EURUSD");
  const gbp = findAsset(assets, "GBPUSD");
  const aud = findAsset(assets, "AUDUSD");
  const usdjpy = findAsset(assets, "USDJPY");

  const dxyUp = dxyChange > 0.15;
  const dxyDown = dxyChange < -0.15;
  const riskOn = (gbp && gbp.change_percent > 0.2) || (aud && aud.change_percent > 0.2);
  const riskOff =
    (usdjpy && usdjpy.change_percent > 0.2) ||
    (dxyUp && aud && aud.change_percent < -0.05);

  if (dxyUp && eur && eur.change_percent < -0.05) return "usd-dominant";
  if (riskOn && !dxyUp) return "risk-on";
  if (riskOff) return "risk-off";
  if (dxyDown && eur && eur.change_percent > 0.1) return "risk-on";
  return "range";
}

function buildRegimeStats(
  assets: readonly MarketAssetView[],
  dxyChange: number,
  regime: ForexRegimeType,
): ForexMarketRegimePayload["stats"] {
  const riskyAvg = avgRiskyChange(assets);
  const absAvg = avgAbsChange(assets);
  const vol = computeFxVolatility(assets);
  const aud = findAsset(assets, "AUDUSD");
  const tryPair = findAsset(assets, "USDTRY");

  const fedTutumu =
    dxyChange > 0.25 ? "Şahin USD" : dxyChange < -0.25 ? "Güvercin" : "Nötr";

  const riskIstahi =
    riskyAvg > 0.25 ? "Yüksek" : riskyAvg < -0.25 ? "Düşük" : "Ilımlı";

  const carryActive =
    (aud && aud.change_percent > 0.1) || (tryPair && tryPair.change_percent > 0.15);
  const carryTrade =
    carryActive && vol.value < 65 ? "Aktif" : vol.value >= 65 ? "Baskı altında" : "Zayıf";

  const trendGucu =
    absAvg > 0.5 ? "Güçlü" : absAvg > 0.2 ? "Orta" : regime === "range" ? "Yatay" : "Zayıf";

  return { fedTutumu, riskIstahi, carryTrade, trendGucu };
}

function buildRegimeSummary(
  assets: readonly MarketAssetView[],
  regime: ForexRegimeType,
  dxyChange: number,
): string {
  const avg = avgChange(assets);
  const tone =
    regime === "usd-dominant"
      ? "Dolar güçleniyor"
      : regime === "risk-on"
        ? "Risk iştahı yükseliyor"
        : regime === "risk-off"
          ? "Güvenli liman akışı"
          : "Majör pariteler yatay";

  return `${tone}. ${assets.length} parite izleniyor; ortalama değişim ${avg.toFixed(2)}%, DXY ${dxyChange >= 0 ? "+" : ""}${dxyChange.toFixed(2)}%.`;
}

export function buildForexRegime(
  assets: readonly MarketAssetView[],
  dxy: ReturnType<typeof resolveForexDxy>,
): ForexMarketRegimePayload {
  const currencies = buildForexCurrencyHeatmap(assets);
  const regime = resolveForexRegimeType(assets, dxy.changePct);
  const distribution =
    currencies.length >= 3
      ? computeCurrencyDistribution(currencies)
      : { safe: 34, risky: 33, em: 33 };

  return {
    regime,
    headline: REGIME_HEADLINE[regime],
    summary: buildRegimeSummary(assets, regime, dxy.changePct),
    dxyValue: dxy.value,
    dxyChange: dxy.changePct,
    stats: buildRegimeStats(assets, dxy.changePct, regime),
    distribution,
  };
}

/** Risk bias — 0–100, risk-on paritelerden türetilir */
export function computeForexRiskBias(assets: readonly MarketAssetView[]): {
  value: number;
  label: string;
} {
  const riskyAvg = avgRiskyChange(assets);
  const value = Math.min(100, Math.max(0, Math.round(50 + riskyAvg * 12)));
  const label = riskyAvg > 0.2 ? "Risk-on" : riskyAvg < -0.2 ? "Risk-off" : "Nötr";
  return { value, label };
}

export function volatilityBandFromValue(value: number): "low" | "medium" | "high" {
  if (value >= 65) return "high";
  if (value >= 35) return "medium";
  return "low";
}
