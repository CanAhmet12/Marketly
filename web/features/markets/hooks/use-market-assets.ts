"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchMarketAssets } from "@/features/markets/fetch-market-assets";
import type { MarketAssetView } from "@/features/markets/types";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { isMockDataEnabled } from "@/mock/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Supabase asset_prices + assets tablosundan canlı fiyat verisi.
 * Mock modda veya Supabase yapılandırılmamışsa boş dizi döner.
 */
export function useMarketAssetsLive() {
  const mounted = useClientMounted();
  const enabled = mounted && !isMockDataEnabled() && isSupabaseConfigured();

  const query = useQuery<MarketAssetView[]>({
    queryKey: ["market-assets-live"],
    queryFn: () => fetchMarketAssets(getSupabaseBrowserClient()),
    enabled,
    networkMode: "always",
    refetchOnMount: "always",
    staleTime: 30_000,        // 30 saniye — Price API'nin kripto güncelleme hızı
    refetchInterval: 60_000,  // 60 saniyede otomatik yenile
    retry: 2,
  });

  const { data = [], isLoading, error } = query;

  useEffect(() => {
    if (!enabled) return;
    if (query.isError) return;
    if (query.fetchStatus !== "idle") return;
    if (data.length > 0) return;
    void query.refetch();
  }, [enabled, query.isError, data.length, query.fetchStatus, query.refetch]);

  return { assets: data, isLoading: enabled ? isLoading : false, error };
}
