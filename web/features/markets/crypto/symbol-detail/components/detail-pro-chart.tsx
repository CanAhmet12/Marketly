"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  createChart,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type SeriesMarker,
  type Time,
} from "lightweight-charts";

import {
  calcBollinger,
  calcEma,
  calcMacd,
  calcRsi,
  lineSeriesFromIndicator,
} from "@/features/markets/crypto/symbol-detail/lib/chart-indicators";
import type { ProChartSettings } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import { uid } from "@/features/markets/crypto/symbol-detail/lib/chart-pro-settings";
import { proChartScaleLayout } from "@/features/markets/crypto/symbol-detail/lib/chart-scale-layout";
import type { TerminalChartLayout } from "@/features/markets/crypto/symbol-detail/hooks/use-chart-container-size";
import { fmtPrice } from "@/features/markets/crypto/symbol-detail/lib/format";
import type { DetailKline } from "@/features/markets/crypto/symbol-detail/lib/types";
import { cn } from "@/lib/cn";

type Props = {
  candles: DetailKline[];
  accentColor: string;
  height?: number;
  stageHeight?: number;
  settings: ProChartSettings;
  onSettingsChange?: (next: ProChartSettings) => void;
  terminal?: boolean;
  terminalLayout?: TerminalChartLayout;
  fitRequest?: number;
};

const BOOT_MAX_TRIES = 48;

export function DetailProChart({
  candles,
  accentColor,
  height = 520,
  stageHeight,
  settings,
  onSettingsChange,
  terminal = false,
  terminalLayout,
  fitRequest,
}: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const ema9Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const ema21Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSignalRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdHistRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const trendSeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const trendPendingRef = useRef<{ time: number; price: number } | null>(null);
  const fitAnchorRef = useRef<number | null>(null);
  const [trendPending, setTrendPending] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const useTerminal = Boolean(terminalLayout);
  const inlineHeight = stageHeight ?? height;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let chart: IChartApi | null = null;
    let bootRaf = 0;
    let tries = 0;

    const onClick = (param: { point?: { x: number; y: number } }) => {
      const s = settingsRef.current;
      const onChange = onSettingsChange;
      if (!onChange || s.drawTool === "cursor" || !param.point || !chart) return;

      const series = candleRef.current;
      if (!series) return;

      const price = series.coordinateToPrice(param.point.y);
      const timeRaw = chart.timeScale().coordinateToTime(param.point.x);
      if (price == null || timeRaw == null) return;
      const time = timeRaw as number;

      if (s.drawTool === "hline") {
        onChange({
          ...s,
          drawings: {
            ...s.drawings,
            hlines: [...s.drawings.hlines, { id: uid("hl"), price, color: accentColor }],
          },
        });
        return;
      }

      if (s.drawTool === "vline") {
        onChange({
          ...s,
          drawings: {
            ...s.drawings,
            vlines: [...s.drawings.vlines, { id: uid("vl"), time, color: accentColor }],
          },
        });
        return;
      }

      if (s.drawTool === "trend") {
        if (!trendPendingRef.current) {
          trendPendingRef.current = { time, price };
          setTrendPending(true);
          return;
        }
        const p1 = trendPendingRef.current;
        trendPendingRef.current = null;
        setTrendPending(false);
        onChange({
          ...s,
          drawings: {
            ...s.drawings,
            trends: [
              ...s.drawings.trends,
              { id: uid("tr"), t1: p1.time, p1: p1.price, t2: time, p2: price, color: accentColor },
            ],
          },
        });
      }
    };

    const boot = () => {
      if (cancelled || !containerRef.current) return;
      const el = containerRef.current;
      const w = el.clientWidth;
      const h = el.clientHeight;

      if (w < 240 || h < 200) {
        tries += 1;
        if (tries < BOOT_MAX_TRIES) {
          bootRaf = requestAnimationFrame(boot);
        }
        return;
      }

      chart = createChart(el, {
        autoSize: true,
        layout: {
          background: { type: ColorType.Solid, color: terminal ? "#060608" : "#0b0b0d" },
          textColor: "rgba(161, 165, 176, 0.95)",
          fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
          fontSize: 11,
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.07)" },
          horzLines: { color: "rgba(255,255,255,0.07)" },
        },
        crosshair: {
          mode: settingsRef.current.magnetCrosshair ? CrosshairMode.Magnet : CrosshairMode.Normal,
          vertLine: {
            color: "rgba(255,255,255,0.22)",
            width: 1,
            style: 2,
            labelBackgroundColor: "#1a1a1e",
          },
          horzLine: {
            color: accentColor,
            width: 1,
            style: 2,
            labelBackgroundColor: "#1a1a1e",
          },
        },
        rightPriceScale: {
          borderColor: "rgba(255,255,255,0.1)",
          scaleMargins: proChartScaleLayout(settingsRef.current.indicators).main,
        },
        timeScale: {
          borderColor: "rgba(255,255,255,0.1)",
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 8,
        },
      });

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#00c853",
        downColor: "#ff5252",
        borderUpColor: "#00c853",
        borderDownColor: "#ff5252",
        wickUpColor: "#00c853",
        wickDownColor: "#ff5252",
      });

      chartRef.current = chart;
      candleRef.current = candleSeries;
      volumeRef.current = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      ema9Ref.current = chart.addSeries(LineSeries, {
        color: "#f5b800",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "EMA9",
      });
      ema21Ref.current = chart.addSeries(LineSeries, {
        color: "#a78bfa",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "EMA21",
      });
      bbUpperRef.current = chart.addSeries(LineSeries, {
        color: "rgba(56, 189, 248, 0.55)",
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "BB+",
      });
      bbLowerRef.current = chart.addSeries(LineSeries, {
        color: "rgba(56, 189, 248, 0.55)",
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "BB-",
      });
      rsiRef.current = chart.addSeries(LineSeries, {
        color: "#38bdf8",
        lineWidth: 2,
        priceScaleId: "rsi",
        priceLineVisible: false,
        lastValueVisible: true,
        title: "RSI",
      });
      macdRef.current = chart.addSeries(LineSeries, {
        color: "#22d3ee",
        lineWidth: 2,
        priceScaleId: "macd",
        priceLineVisible: false,
        lastValueVisible: false,
        title: "MACD",
      });
      macdSignalRef.current = chart.addSeries(LineSeries, {
        color: "#f472b6",
        lineWidth: 1,
        priceScaleId: "macd",
        priceLineVisible: false,
        lastValueVisible: false,
        title: "Signal",
      });
      macdHistRef.current = chart.addSeries(HistogramSeries, {
        priceScaleId: "macd",
        priceLineVisible: false,
        lastValueVisible: false,
      });

      const initialLayout = proChartScaleLayout(settingsRef.current.indicators);
      chart.priceScale("volume").applyOptions({
        scaleMargins: initialLayout.volume ?? { top: 0.92, bottom: 0.04 },
        borderVisible: false,
      });
      chart.priceScale("rsi").applyOptions({
        scaleMargins: initialLayout.rsi ?? { top: 0.92, bottom: 0.04 },
        borderVisible: false,
      });
      chart.priceScale("macd").applyOptions({
        scaleMargins: initialLayout.macd ?? { top: 0.92, bottom: 0.04 },
        borderVisible: false,
      });

      chart.subscribeClick(onClick);
      setChartReady(true);
    };

    setChartReady(false);
    bootRaf = requestAnimationFrame(boot);

    return () => {
      cancelled = true;
      cancelAnimationFrame(bootRaf);
      if (chart) {
        chart.unsubscribeClick(onClick);
        trendSeriesRef.current.forEach((s) => chart!.removeSeries(s));
        trendSeriesRef.current.clear();
        chart.remove();
      }
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      ema9Ref.current = null;
      ema21Ref.current = null;
      bbUpperRef.current = null;
      bbLowerRef.current = null;
      rsiRef.current = null;
      macdRef.current = null;
      macdSignalRef.current = null;
      macdHistRef.current = null;
      priceLinesRef.current = [];
      fitAnchorRef.current = null;
      setChartReady(false);
    };
  }, [accentColor, inlineHeight, onSettingsChange, terminal, useTerminal]);

  useEffect(() => {
    if (!useTerminal || !chartRef.current || !containerRef.current) return;
    const el = containerRef.current;
    const raf = requestAnimationFrame(() => {
      if (!chartRef.current || !el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 240 || h < 200) return;
      chartRef.current.timeScale().fitContent();
    });
    return () => cancelAnimationFrame(raf);
  }, [terminalLayout?.width, terminalLayout?.height, useTerminal]);

  useEffect(() => {
    if (settings.drawTool !== "trend") {
      trendPendingRef.current = null;
      setTrendPending(false);
    }
  }, [settings.drawTool]);

  useEffect(() => {
    chartRef.current?.applyOptions({
      crosshair: {
        mode: settings.magnetCrosshair ? CrosshairMode.Magnet : CrosshairMode.Normal,
      },
    });
  }, [settings.magnetCrosshair]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !chartReady) return;
    const layout = proChartScaleLayout(settings.indicators);
    chart.priceScale("right").applyOptions({ scaleMargins: layout.main });
    if (layout.volume) chart.priceScale("volume").applyOptions({ scaleMargins: layout.volume });
    if (layout.rsi) chart.priceScale("rsi").applyOptions({ scaleMargins: layout.rsi });
    if (layout.macd) chart.priceScale("macd").applyOptions({ scaleMargins: layout.macd });
  }, [settings.indicators, chartReady]);

  useEffect(() => {
    if (!fitRequest || !chartRef.current) return;
    chartRef.current.timeScale().fitContent();
  }, [fitRequest]);

  const applyVisibility = useCallback(
    (series: ISeriesApi<"Line" | "Histogram"> | null, visible: boolean) => {
      series?.applyOptions({ visible });
    },
    [],
  );

  useEffect(() => {
    const candleSeries = candleRef.current;
    const volumeSeries = volumeRef.current;
    const chart = chartRef.current;
    if (!chartReady || !candleSeries || !volumeSeries || !chart || candles.length === 0) return;

    const closes = candles.map((c) => c.close);
    const { indicators } = settings;
    const macdPack = calcMacd(closes);

    const candleData = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candleSeries.setData(candleData);

    if (indicators.volume) {
      volumeSeries.setData(
        candles.map((c) => ({
          time: c.time as Time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(0,200,83,0.38)" : "rgba(255,82,82,0.38)",
        })),
      );
    } else {
      volumeSeries.setData([]);
    }

    ema9Ref.current?.setData(
      indicators.ema9 ? lineSeriesFromIndicator(candles, calcEma(closes, 9)) : [],
    );
    ema21Ref.current?.setData(
      indicators.ema21 ? lineSeriesFromIndicator(candles, calcEma(closes, 21)) : [],
    );

    const bb = calcBollinger(closes, 20, 2);
    bbUpperRef.current?.setData(indicators.bollinger ? lineSeriesFromIndicator(candles, bb.upper) : []);
    bbLowerRef.current?.setData(indicators.bollinger ? lineSeriesFromIndicator(candles, bb.lower) : []);

    rsiRef.current?.setData(indicators.rsi ? lineSeriesFromIndicator(candles, calcRsi(closes, 14)) : []);

    if (indicators.macd) {
      macdRef.current?.setData(lineSeriesFromIndicator(candles, macdPack.macd));
      macdSignalRef.current?.setData(lineSeriesFromIndicator(candles, macdPack.signal));
      macdHistRef.current?.setData(
        candles
          .map((c, i) => {
            const v = macdPack.hist[i];
            if (v == null) return null;
            return {
              time: c.time as Time,
              value: v,
              color: v >= 0 ? "rgba(34,211,238,0.45)" : "rgba(244,114,182,0.45)",
            };
          })
          .filter(Boolean) as { time: Time; value: number; color: string }[],
      );
    } else {
      macdRef.current?.setData([]);
      macdSignalRef.current?.setData([]);
      macdHistRef.current?.setData([]);
    }

    applyVisibility(ema9Ref.current, indicators.ema9);
    applyVisibility(ema21Ref.current, indicators.ema21);
    applyVisibility(bbUpperRef.current, indicators.bollinger);
    applyVisibility(bbLowerRef.current, indicators.bollinger);
    applyVisibility(rsiRef.current, indicators.rsi);
    applyVisibility(macdRef.current, indicators.macd);
    applyVisibility(macdSignalRef.current, indicators.macd);
    applyVisibility(macdHistRef.current, indicators.macd);
    applyVisibility(volumeRef.current, indicators.volume);

    const markers: SeriesMarker<Time>[] = settings.drawings.vlines.map((v) => ({
      time: v.time as Time,
      position: "inBar",
      color: v.color,
      shape: "circle",
      text: "",
    }));
    if ("setMarkers" in candleSeries && typeof candleSeries.setMarkers === "function") {
      candleSeries.setMarkers(markers);
    }

    for (const pl of priceLinesRef.current) candleSeries.removePriceLine(pl);
    priceLinesRef.current = settings.drawings.hlines.map((h) =>
      candleSeries.createPriceLine({
        price: h.price,
        color: h.color,
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "H",
      }),
    );

    const chartApi = chartRef.current;
    if (chartApi) {
      const existing = trendSeriesRef.current;
      for (const id of [...existing.keys()]) {
        if (!settings.drawings.trends.find((t) => t.id === id)) {
          chartApi.removeSeries(existing.get(id)!);
          existing.delete(id);
        }
      }
      for (const tr of settings.drawings.trends) {
        let series = existing.get(tr.id);
        if (!series) {
          series = chartApi.addSeries(LineSeries, {
            color: tr.color,
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          existing.set(tr.id, series);
        }
        series.setData([
          { time: tr.t1 as Time, value: tr.p1 },
          { time: tr.t2 as Time, value: tr.p2 },
        ]);
      }
    }

    const anchor = candles[0]?.time ?? null;
    if (fitAnchorRef.current !== anchor) {
      chart.timeScale().fitContent();
      fitAnchorRef.current = anchor;
    } else if (candles.length > 0) {
      chart.timeScale().scrollToRealTime();
    }
  }, [candles, settings, applyVisibility, accentColor, chartReady]);

  const hostStyle =
    useTerminal || stageHeight
      ? ({ width: "100%", height: useTerminal ? "100%" : inlineHeight } as const)
      : ({ height: inlineHeight } as const);

  const drawHint =
    settings.drawTool === "trend" && trendPending
      ? "Trend: ikinci noktayı seçin"
      : settings.drawTool === "trend"
        ? "Trend: başlangıç noktasına tıklayın"
        : settings.drawTool === "hline"
          ? "Grafiğe tıklayarak yatay çizgi ekleyin"
          : settings.drawTool === "vline"
            ? "Grafiğe tıklayarak dikey işaret ekleyin"
            : null;

  return (
    <div
      ref={shellRef}
      className={cn(
        "cdr-pro-chart",
        (stageHeight != null || useTerminal) && "cdr-pro-chart--fill",
        terminal && "cdr-pro-chart--terminal",
      )}
      style={stageHeight && !useTerminal ? { height: inlineHeight } : undefined}
    >
      {drawHint && onSettingsChange ? (
        <div
          className={cn(
            "cdr-pro-chart__draw-hint",
            !useTerminal && "cdr-pro-chart__draw-hint--below-overlay",
            useTerminal && "cdr-pro-chart__draw-hint--terminal",
          )}
          role="status"
        >
          {drawHint}
        </div>
      ) : null}
      <div
        ref={containerRef}
        className={cn(
          "cdr-chart-card__canvas-inner cdr-chart-card__canvas-inner--pro",
          (stageHeight != null || useTerminal) && "cdr-chart-card__canvas-inner--fill",
          useTerminal && "cdr-chart-card__canvas-inner--terminal-host",
        )}
        style={hostStyle}
      />
      {candles.length > 0 ? (
        <span className="cdr-sr-only">Son fiyat {fmtPrice(candles[candles.length - 1]!.close)}</span>
      ) : null}
    </div>
  );
}
