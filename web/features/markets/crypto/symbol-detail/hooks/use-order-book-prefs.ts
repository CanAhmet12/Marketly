"use client";

import { useCallback, useEffect, useState } from "react";

import type { OrderBookDecimalPreset } from "@/features/markets/crypto/symbol-detail/lib/order-book-format";

const DECIMAL_KEY = "cdr-orderbook-decimals";
const DEFAULT_DECIMAL: OrderBookDecimalPreset = "auto";

function readDecimals(): OrderBookDecimalPreset {
  if (typeof window === "undefined") return DEFAULT_DECIMAL;
  const raw = localStorage.getItem(DECIMAL_KEY);
  if (raw === "0.01" || raw === "0.001" || raw === "0.0001" || raw === "auto") return raw;
  return DEFAULT_DECIMAL;
}

export function useOrderBookPrefs() {
  const [decimals, setDecimalsState] = useState<OrderBookDecimalPreset>(DEFAULT_DECIMAL);

  useEffect(() => {
    setDecimalsState(readDecimals());
  }, []);

  const setDecimals = useCallback((next: OrderBookDecimalPreset) => {
    setDecimalsState(next);
    localStorage.setItem(DECIMAL_KEY, next);
  }, []);

  return { decimals, setDecimals };
}
