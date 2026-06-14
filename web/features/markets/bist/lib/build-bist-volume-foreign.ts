import type { BistVolumeForeignResponse } from "@/features/markets/bist/lib/bist-detail-types";
import { resolveBistScreenerSector } from "@/features/markets/bist/lib/bist-regime-utils";
import {
  isBistIndexSymbol,
  normalizeBistSymbol,
  yahooTickerFor,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { fetchYahooChart } from "@/features/markets/commodities/lib/commodity-yahoo";

function formatVolumeTr(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} Mr TL`;
  if (n >= 1e6) return `${(n / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} Mn TL`;
  if (n >= 1e3) return `${(n / 1e3).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} B TL`;
  return `${n.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} TL`;
}

function foreignFlowLabel(changePp: number): string {
  if (changePp > 0.4) return "Net alım";
  if (changePp < -0.4) return "Net satış";
  return "Nötr akış";
}

function estimateForeignRatio(symbol: string, changePct: number): { ratio: number; changePp: number } {
  const sym = normalizeBistSymbol(symbol);
  const sector = resolveBistScreenerSector(sym);
  let base = 36;
  if (sector === "bankacilik") base = 42;
  if (isBistIndexSymbol(sym)) base = 38;
  if (sector === "teknoloji" || sector === "holding") base = 34;
  const ratio = Math.min(58, Math.max(18, Math.round(base + changePct * 1.2)));
  const changePp = Math.round(changePct * 0.35 * 10) / 10;
  return { ratio, changePp };
}

export async function fetchBistVolumeForeign(
  symbol: string,
  fallbackChangePct = 0,
): Promise<BistVolumeForeignResponse | null> {
  const sym = normalizeBistSymbol(symbol);
  const ticker = yahooTickerFor(sym);
  if (!ticker) return null;

  const daily = await fetchYahooChart(ticker, "1d", "1mo");
  if (!daily?.length) {
    const foreign = estimateForeignRatio(sym, fallbackChangePct);
    return {
      symbol: sym,
      source: "computed",
      updatedAt: Date.now(),
      volume: {
        dailyLabel: "—",
        avg20dLabel: "—",
        changePct: fallbackChangePct,
        turnoverLabel: "—",
      },
      foreign: {
        ratioPct: foreign.ratio,
        changePp: foreign.changePp,
        label: "Günlük",
        flowLabel: foreignFlowLabel(foreign.changePp),
      },
      rows: [],
    };
  }

  const last = daily[daily.length - 1]!;
  const prev = daily.length >= 2 ? daily[daily.length - 2]! : last;
  const dailyVol = last.volume;
  const recent20 = daily.slice(-20);
  const avgVol = recent20.reduce((s, k) => s + k.volume, 0) / recent20.length;
  const volChange = avgVol > 0 ? ((dailyVol - avgVol) / avgVol) * 100 : 0;
  const turnover = dailyVol * last.close;
  const foreign = estimateForeignRatio(sym, last.close > 0 ? ((last.close - prev.close) / prev.close) * 100 : fallbackChangePct);

  const slice = daily.slice(-5);
  const periodLabels = ["4g", "3g", "2g", "Dün", "Bugün"];
  const labelOffset = Math.max(0, periodLabels.length - slice.length);

  const rows = slice.map((k, i) => {
    const prevK = i > 0 ? slice[i - 1]! : k;
    const dayChange = prevK.close > 0 ? ((k.close - prevK.close) / prevK.close) * 100 : 0;
    const f = estimateForeignRatio(sym, dayChange);
    return {
      period: periodLabels[labelOffset + i] ?? `${i + 1}g`,
      volumeLabel: formatVolumeTr(k.volume * k.close),
      foreignPct: f.ratio,
    };
  });

  return {
    symbol: sym,
    source: "yahoo",
    updatedAt: Date.now(),
    volume: {
      dailyLabel: formatVolumeTr(turnover),
      avg20dLabel: formatVolumeTr(avgVol * last.close),
      changePct: Math.round(volChange * 10) / 10,
      turnoverLabel: formatVolumeTr(turnover),
    },
    foreign: {
      ratioPct: foreign.ratio,
      changePp: foreign.changePp,
      label: "Günlük",
      flowLabel: foreignFlowLabel(foreign.changePp),
    },
    rows,
  };
}
