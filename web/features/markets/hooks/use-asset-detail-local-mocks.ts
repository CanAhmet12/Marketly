"use client";

import { useCallback, useEffect, useState } from "react";

import { useRegisterPageLoad } from "@/hooks/use-register-page-load";

import {
  readAlertsForSymbol,
  writeAlertsForSymbol,
  type MockAssetAlert,
} from "@/features/markets/lib/asset-alerts-storage";

export type { MockAssetAlert } from "@/features/markets/lib/asset-alerts-storage";

const PORTFOLIO_KEY = "marketly-mock-portfolio-symbols";

function readPortfolio(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string").map((s) => s.toUpperCase()));
  } catch {
    return new Set();
  }
}

function writePortfolio(next: Set<string>) {
  try {
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify([...next]));
  } catch {
    /* */
  }
}

export function useAssetDetailLocalMocks(symbol: string) {
  const u = symbol.toUpperCase();
  const [hydrated, setHydrated] = useState(false);
  const [inPortfolio, setInPortfolio] = useState(false);
  const [alerts, setAlerts] = useState<MockAssetAlert[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      setInPortfolio(readPortfolio().has(u));
      setAlerts(readAlertsForSymbol(u));
      setHydrated(true);
    });
  }, [u]);

  useRegisterPageLoad(!hydrated);

  const togglePortfolio = useCallback(() => {
    setInPortfolio(() => {
      const base = readPortfolio();
      const next = new Set(base);
      if (next.has(u)) next.delete(u);
      else next.add(u);
      writePortfolio(next);
      return next.has(u);
    });
  }, [u]);

  const addPresetAlert = useCallback(
    (label: string) => {
      const row: MockAssetAlert = {
        id: `al-${Date.now()}`,
        label,
        createdAt: new Date().toISOString(),
      };
      setAlerts((prev) => {
        const next = [row, ...prev].slice(0, 8);
        writeAlertsForSymbol(u, next);
        return next;
      });
    },
    [u],
  );

  const removeAlert = useCallback(
    (id: string) => {
      setAlerts((prev) => {
        const next = prev.filter((a) => a.id !== id);
        writeAlertsForSymbol(u, next);
        return next;
      });
    },
    [u],
  );

  return { hydrated, inPortfolio, togglePortfolio, alerts, addPresetAlert, removeAlert };
}
