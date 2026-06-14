import type { ProChartIndicators } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";

export type ChartScaleMargins = { top: number; bottom: number };

export type ProChartScaleLayout = {
  main: ChartScaleMargins;
  volume?: ChartScaleMargins;
  rsi?: ChartScaleMargins;
  macd?: ChartScaleMargins;
};

const SUB_PANEL_HEIGHT = 0.115;
const SUB_PANEL_GAP = 0.012;
const TIME_AXIS = 0.045;
const MAIN_TOP = 0.04;

/** İndikatör panellerini üst üste binmeden dikey bantlara ayırır. */
export function proChartScaleLayout(indicators: ProChartIndicators): ProChartScaleLayout {
  const subs: Array<"volume" | "rsi" | "macd"> = [];
  if (indicators.volume) subs.push("volume");
  if (indicators.rsi) subs.push("rsi");
  if (indicators.macd) subs.push("macd");

  const subBlock =
    subs.length > 0
      ? subs.length * SUB_PANEL_HEIGHT + Math.max(0, subs.length - 1) * SUB_PANEL_GAP + 0.02
      : 0;

  const mainBottom = Math.min(0.62, subBlock + TIME_AXIS + 0.03);

  const layout: ProChartScaleLayout = {
    main: { top: MAIN_TOP, bottom: mainBottom },
  };

  let offsetFromBottom = TIME_AXIS;
  for (let i = subs.length - 1; i >= 0; i -= 1) {
    const id = subs[i]!;
    layout[id] = {
      top: 1 - offsetFromBottom - SUB_PANEL_HEIGHT,
      bottom: offsetFromBottom,
    };
    offsetFromBottom += SUB_PANEL_HEIGHT + SUB_PANEL_GAP;
  }

  return layout;
}
