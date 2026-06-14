"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    placeholderData: keepPreviousData,
    retry: 2,
  });

  const { data = [], isLoading, error } = query;

  return { assets: data, isLoading: enabled ? isLoading : false, error };
}
