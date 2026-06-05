/**
 * Tek mock sinyal kataloğu — discover / marketplace / kanal / asset filtreleri buradan türetilir.
 * Üretimde aynı şekil: repository katmanı `signals` tablosu + JOIN.
 */
import type { ChannelSignal } from "@/features/channel/types";

import { MOCK_TREND_MARKETS } from "../fixtures/markets";
import { MOCK_SIGNAL_ROWS } from "../fixtures/signals";

export function getMockSignalCatalog(): ChannelSignal[] {
  return MOCK_SIGNAL_ROWS;
}

export function displayAssetNameForSymbol(symbol: string): string {
  const u = symbol.trim().toUpperCase();
  return MOCK_TREND_MARKETS.find((m) => m.symbol.toUpperCase() === u)?.name ?? symbol;
}

/** Keşfet — trend skoru: etkileşim + güven */
export function signalDiscoveryScore(s: ChannelSignal): number {
  return s.likes_count + s.copies_count * 2 + s.confidence * 0.4;
}

export function getMockSignalsForDiscover(limit: number): ChannelSignal[] {
  return [...MOCK_SIGNAL_ROWS].sort((a, b) => signalDiscoveryScore(b) - signalDiscoveryScore(a)).slice(0, limit);
}

export function getMockSignalsForCreator(creatorId: string): ChannelSignal[] {
  return MOCK_SIGNAL_ROWS.filter((s) => s.creator_id === creatorId);
}

export function getMockSignalsForAssetSymbol(symbol: string): ChannelSignal[] {
  const u = symbol.trim().toUpperCase();
  return MOCK_SIGNAL_ROWS.filter((s) => s.symbol.toUpperCase() === u);
}
