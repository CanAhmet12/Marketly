"use client";

import { useEffect, useMemo, useState } from "react";

import { CRYPTO_CHART_RANGES } from "@/features/markets/crypto/detail/lib/crypto-chart-types";
import type { CryptoChartApiResponse, CryptoChartRangeId } from "@/features/markets/crypto/detail/lib/crypto-chart-types";

type Args = {
  symbol: string;
  rangeId: CryptoChartRangeId;
  price: number;
  changePercent: number;
  compareSymbol?: string | null;
};

type State = {
  candles: CryptoChartApiResponse["candles"];
  compareCandles: CryptoChartApiResponse["candles"];
  source: CryptoChartApiResponse["source"];
  compareSource: CryptoChartApiResponse["source"] | null;
  isLoading: boolean;
  error: string | null;
};

async function fetchChart(symbol: string, days: number, price: number, changePercent: number): Promise<CryptoChartApiResponse> {
  const params = new URLSearchParams({
    symbol,
    days: String(days),
    price: String(price),
    change: String(changePercent),
  });
  const res = await fetch(`/api/markets/crypto-chart?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("chart_fetch_failed");
  return res.json() as Promise<CryptoChartApiResponse>;
}

export function useCryptoChartData({ symbol, rangeId, price, changePercent, compareSymbol }: Args): State {
  const days = useMemo(
    () => CRYPTO_CHART_RANGES.find((r) => r.id === rangeId)?.days ?? 7,
    [rangeId],
  );

  const [state, setState] = useState<State>({
    candles: [],
    compareCandles: [],
    source: "fallback",
    compareSource: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      compareCandles: [],
      compareSource: null,
    }));

    const tasks: Promise<void>[] = [
      fetchChart(symbol, days, price, changePercent).then((data) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          candles: data.candles,
          source: data.source,
        }));
      }),
    ];

    if (compareSymbol && compareSymbol !== symbol) {
      tasks.push(
        fetchChart(compareSymbol, days, price, changePercent).then((data) => {
          if (cancelled) return;
          setState((prev) => ({
            ...prev,
            compareCandles: data.candles,
            compareSource: data.source,
          }));
        }),
      );
    } else {
      setState((prev) => ({ ...prev, compareCandles: [], compareSource: null }));
    }

    Promise.all(tasks)
      .then(() => {
        if (!cancelled) setState((prev) => ({ ...prev, isLoading: false }));
      })
      .catch(() => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Grafik verisi yüklenemedi",
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, days, price, changePercent, compareSymbol]);

  return state;
}
