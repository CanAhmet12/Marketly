"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { deletePriceAlert, fetchPriceAlerts, type LivePriceAlert } from "@/features/markets/fetch-price-alerts";
import {
  readAllAssetAlerts,
  removeAlertById,
  type AssetAlertGroup,
} from "@/features/markets/lib/asset-alerts-storage";
import { isMockDataEnabled } from "@/mock/config";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type PriceAlertRow = {
  id: string;
  symbol: string;
  label: string;
  createdAt: string;
  source: "mock" | "live";
  condition?: "above" | "below";
  targetPrice?: number;
};

function mockGroupsToRows(groups: AssetAlertGroup[]): PriceAlertRow[] {
  return groups.flatMap((g) =>
    g.alerts.map((a) => ({
      id: a.id,
      symbol: g.symbol,
      label: a.label,
      createdAt: a.createdAt,
      source: "mock" as const,
    })),
  );
}

function liveToRows(rows: LivePriceAlert[]): PriceAlertRow[] {
  return rows.map((r) => ({
    id: r.id,
    symbol: r.symbol,
    label: r.label,
    createdAt: r.createdAt,
    source: "live" as const,
    condition: r.condition,
    targetPrice: r.targetPrice,
  }));
}

export function usePriceAlertsPage() {
  const { user, isInitialized } = useAuth();
  const mockOn = isMockDataEnabled();
  const qc = useQueryClient();
  const [mockRows, setMockRows] = useState<PriceAlertRow[]>([]);
  const [mockReady, setMockReady] = useState(false);

  const reloadMock = useCallback(() => {
    setMockRows(mockGroupsToRows(readAllAssetAlerts()));
  }, []);

  useEffect(() => {
    if (!mockOn) return;
    queueMicrotask(() => {
      reloadMock();
      setMockReady(true);
    });
  }, [mockOn, reloadMock]);

  const liveQuery = useQuery({
    queryKey: queryKeys.priceAlerts(user?.id ?? null),
    enabled: !mockOn && isInitialized && Boolean(user?.id) && isSupabaseConfigured(),
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      return fetchPriceAlerts(client, user!.id);
    },
  });

  const rows = mockOn ? mockRows : liveToRows(liveQuery.data ?? []);
  const ready = mockOn ? mockReady : isInitialized && (liveQuery.isSuccess || liveQuery.isError || !user);
  const loading = mockOn ? !mockReady : liveQuery.isLoading;

  const remove = useMutation({
    mutationFn: async ({ id, symbol, source }: { id: string; symbol: string; source: "mock" | "live" }) => {
      if (!user?.id) throw new Error("Giriş gerekli");
      if (source === "mock" || mockOn) {
        removeAlertById(symbol, id);
        return;
      }
      const client = getSupabaseBrowserClient();
      await deletePriceAlert(client, user.id, id);
    },
    onSuccess: () => {
      if (mockOn) reloadMock();
      else if (user?.id) void qc.invalidateQueries({ queryKey: queryKeys.priceAlerts(user.id) });
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<string, PriceAlertRow[]>();
    for (const row of rows) {
      const list = map.get(row.symbol) ?? [];
      list.push(row);
      map.set(row.symbol, list);
    }
    return [...map.entries()]
      .map(([symbol, alerts]) => ({ symbol, alerts }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [rows]);

  const error = useMemo(() => {
    if (mockOn || !liveQuery.error) return null;
    return liveQuery.error instanceof Error ? liveQuery.error.message : "Alarmlar yüklenemedi";
  }, [mockOn, liveQuery.error]);

  return { grouped, rows, totalCount: rows.length, ready, loading, error, remove, refetch: liveQuery.refetch };
}
