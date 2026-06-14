"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";

import type { TerminalChartLayout } from "@/features/markets/crypto/symbol-detail/hooks/use-chart-container-size";
import type { DetailKline } from "@/features/markets/crypto/symbol-detail/lib/types";
import { fmtPrice } from "@/features/markets/crypto/symbol-detail/lib/format";
import { cn } from "@/lib/cn";

type Props = {
  candles: DetailKline[];
  accentColor: string;
  height?: number;
  stageHeight?: number;
  terminal?: boolean;
  terminalLayout?: TerminalChartLayout;
};

const BOOT_MAX_TRIES = 48;

export function DetailCandlestickChart({
  candles,
  accentColor,
  height = 520,
  stageHeight,
  terminal = false,
  terminalLayout,
}: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const fitAnchorRef = useRef<number | null>(null);
  const candlesRef = useRef(candles);
  const prevCandlesRef = useRef<DetailKline[]>([]);
  candlesRef.current = candles;
  const [chartReady, setChartReady] = useState(false);

  const useTerminal = Boolean(terminalLayout);
  const inlineHeight = stageHeight ?? height;

  const applyData = () => {
    const candleSeries = candleRef.current;
    const volumeSeries = volumeRef.current;
    const chart = chartRef.current;
    const rows = candlesRef.current;
    const prevRows = prevCandlesRef.current;
    if (!candleSeries || !volumeSeries || !chart || rows.length === 0) return;

    const sameWindow =
      prevRows.length > 0 &&
      rows.length > 0 &&
      prevRows[0]?.time === rows[0]?.time &&
      prevRows.length === rows.length;

    if (sameWindow) {
      const last = rows[rows.length - 1]!;
      candleSeries.update({
        time: last.time as Time,
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
      });
      volumeSeries.update({
        time: last.time as Time,
        value: last.volume,
        color: last.close >= last.open ? "rgba(0,200,83,0.35)" : "rgba(255,82,82,0.35)",
      });
    } else if (
      prevRows.length > 0 &&
      rows.length === prevRows.length + 1 &&
      prevRows[0]?.time === rows[0]?.time
    ) {
      const last = rows[rows.length - 1]!;
      candleSeries.update({
        time: last.time as Time,
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
      });
      volumeSeries.update({
        time: last.time as Time,
        value: last.volume,
        color: last.close >= last.open ? "rgba(0,200,83,0.35)" : "rgba(255,82,82,0.35)",
      });
    } else {
      candleSeries.setData(
        rows.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })),
      );

      volumeSeries.setData(
        rows.map((c) => ({
          time: c.time as Time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(0,200,83,0.35)" : "rgba(255,82,82,0.35)",
        })),
      );
    }

    prevCandlesRef.current = rows;

    const anchor = rows[0]?.time ?? null;
    if (fitAnchorRef.current !== anchor) {
      chart.timeScale().fitContent();
      fitAnchorRef.current = anchor;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let chart: IChartApi | null = null;
    let bootRaf = 0;
    let tries = 0;

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
          background: { type: ColorType.Solid, color: terminal ? "#060608" : "transparent" },
          textColor: "rgba(161, 165, 176, 0.92)",
          fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
          fontSize: 11,
        },
        grid: {
          vertLines: { visible: terminal, color: "rgba(255,255,255,0.07)" },
          horzLines: { color: terminal ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.05)" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: "rgba(255,255,255,0.12)", width: 1, style: 2 },
          horzLine: { color: accentColor, width: 1, style: 2, labelBackgroundColor: "#1a1a1e" },
        },
        rightPriceScale: {
          borderColor: terminal ? "rgba(255,255,255,0.1)" : undefined,
          borderVisible: terminal,
          scaleMargins: { top: 0.08, bottom: 0.22 },
        },
        timeScale: {
          borderColor: terminal ? "rgba(255,255,255,0.1)" : undefined,
          borderVisible: terminal,
          timeVisible: true,
          secondsVisible: false,
          rightOffset: terminal ? 8 : 0,
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

      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
        borderVisible: false,
      });

      chartRef.current = chart;
      candleRef.current = candleSeries;
      volumeRef.current = volumeSeries;
      setChartReady(true);
      requestAnimationFrame(applyData);
    };

    setChartReady(false);
    bootRaf = requestAnimationFrame(boot);

    return () => {
      cancelled = true;
      cancelAnimationFrame(bootRaf);
      chart?.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      fitAnchorRef.current = null;
      setChartReady(false);
    };
  }, [accentColor, inlineHeight, terminal, useTerminal]);

  useEffect(() => {
    if (!useTerminal || !chartRef.current || !containerRef.current) return;
    const raf = requestAnimationFrame(() => {
      if (!chartRef.current) return;
      chartRef.current.timeScale().fitContent();
    });
    return () => cancelAnimationFrame(raf);
  }, [terminalLayout?.width, terminalLayout?.height, useTerminal]);

  useEffect(() => {
    if (!chartReady) return;
    applyData();
  }, [candles, chartReady]);

  const hostStyle =
    useTerminal || stageHeight
      ? ({ width: "100%", height: useTerminal ? "100%" : inlineHeight } as const)
      : ({ height: inlineHeight } as const);

  return (
    <div
      ref={shellRef}
      className={cn(
        "cdr-chart-card__canvas",
        (stageHeight != null || useTerminal) && "cdr-chart-card__canvas--fill",
        terminal && "cdr-chart-card__canvas--terminal",
      )}
      style={stageHeight && !useTerminal ? { height: inlineHeight } : undefined}
    >
      <div
        ref={containerRef}
        className={cn(
          "cdr-chart-card__canvas-inner",
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
