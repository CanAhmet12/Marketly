"use client";

import { useMemo } from "react";

import { getMarketsRepository } from "@/features/markets/repository";
import type { EconomicCalendarRow } from "@/features/markets/repository/markets-repository";
import { getMockEconomicCalendar } from "@/mock/adapters/markets-dashboard";

export function useCryptoDetailMacroEvents(_symbol: string): readonly EconomicCalendarRow[] {
  const repo = useMemo(() => getMarketsRepository(), []);

  return useMemo(() => {
    try {
      const live = repo.getEconomicCalendar();
      if (live.length > 0) return live;
      return getMockEconomicCalendar();
    } catch {
      return getMockEconomicCalendar();
    }
  }, [repo]);
}
