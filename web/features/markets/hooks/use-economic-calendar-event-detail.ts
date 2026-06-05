"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  buildEconomicCalendarBundle,
  fetchEconomicEventById,
  fetchEconomicEventRows,
} from "@/features/markets/fetch-economic-calendar";
import { useMarketsWatchlist } from "@/features/markets/hooks/use-markets-watchlist";
import { getMarketsRepository } from "@/features/markets/repository";
import type { EconomicCalendarIntelEvent } from "@/features/markets/types/news-calendar-intelligence";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useEconomicCalendarEventDetail(eventId: string) {
  const mockOn = isMockDataEnabled();
  const liveMode = !mockOn && isSupabaseConfigured();
  const repo = useMemo(() => getMarketsRepository(), []);
  const { watchlist, hydrated } = useMarketsWatchlist(mockOn ? repo.getWatchlistSeed() : undefined);

  const watchedArr = useMemo(
    () => [...watchlist].map((s) => s.trim().toUpperCase()).sort(),
    [watchlist],
  );
  const portfolioSyms = mockOn ? repo.getPortfolioIntelligenceBundle().portfolioSymbols : [];

  const mockBundle = useMemo(() => {
    if (!mockOn || !hydrated) return null;
    return repo.getEconomicCalendarIntelligenceBundle(watchedArr, portfolioSyms);
  }, [repo, mockOn, hydrated, watchedArr, portfolioSyms]);

  const liveQuery = useQuery({
    queryKey: queryKeys.economicCalendarDetail(eventId),
    queryFn: async () => {
      const client = getSupabaseBrowserClient();
      const portfolio = repo.getPortfolioIntelligenceBundle().portfolioSymbols;
      const row = await fetchEconomicEventById(client, eventId);
      if (!row) return { event: null, related: [] as EconomicCalendarIntelEvent[], narrativeShift: "—" };
      const bundle = buildEconomicCalendarBundle([row], watchedArr, portfolio);
      const event = bundle.events[0] ?? null;
      const rows = await fetchEconomicEventRows(client);
      const allBundle = buildEconomicCalendarBundle(rows, watchedArr, portfolio);
      const related = allBundle.events
        .filter((e) => e.id !== eventId && event && e.country === event.country)
        .slice(0, 5);
      return { event, related, narrativeShift: allBundle.narrativeShift };
    },
    enabled: liveMode && hydrated && Boolean(eventId),
    staleTime: 120_000,
  });

  const event = mockOn
    ? (mockBundle?.events.find((e) => e.id === eventId) ?? null)
    : (liveQuery.data?.event ?? null);

  const related = mockOn
    ? (mockBundle?.events.filter((e) => e.id !== eventId && event && e.country === event.country).slice(0, 5) ?? [])
    : (liveQuery.data?.related ?? []);

  return {
    event,
    related,
    narrativeShift: mockOn ? (mockBundle?.narrativeShift ?? "—") : (liveQuery.data?.narrativeShift ?? "—"),
    mockOn,
    liveMode,
    hydrated,
    isLoading: mockOn ? !hydrated : liveQuery.isLoading,
    notFound: mockOn ? hydrated && !event : hydrated && !liveQuery.isLoading && !event,
    isEmpty: liveMode && hydrated && !liveQuery.isLoading && !event,
  };
}
