"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isMockDataEnabled } from "@/mock/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { fetchMarketAssets } from "@/features/markets/fetch-market-assets";
import type { MarketAssetView } from "@/features/markets/types";

/**
 * Supabase asset_prices + assets tablosundan canlı fiyat verisi.
 * Mock modda veya Supabase yapılandırılmamışsa boş dizi döner.
 */
export function useMarketAssetsLive() {
  const enabled = !isMockDataEnabled() && isSupabaseConfigured();

  const { data = [], isLoading, error } = useQuery<MarketAssetView[]>({
    queryKey: ["market-assets-live"],
    queryFn: () => fetchMarketAssets(getSupabaseBrowserClient()),
    enabled,
    staleTime: 30_000,        // 30 saniye — Price API'nin kripto güncelleme hızı
    refetchInterval: 60_000,  // 60 saniyede otomatik yenile
    retry: 2,
  });

  return { assets: data, isLoading: enabled ? isLoading : false, error };
}
