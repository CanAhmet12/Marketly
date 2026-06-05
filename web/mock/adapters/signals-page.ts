import type { SignalsPageRow } from "@/features/signals/repository/types";
import type { ChannelSignal } from "@/features/channel/types";
import { displayAssetNameForSymbol, getMockSignalCatalog } from "./signals-source";

import { MOCK_PROFILE_BY_ID } from "../fixtures/profiles";

export type { SignalsPageRow } from "@/features/signals/repository/types";

/** Sinyaller sayfası — mock katalog; UI fixture import etmez */
export function getMockSignalsPageRows(): SignalsPageRow[] {
  return [...getMockSignalCatalog()]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((s: ChannelSignal) => {
      const prof = MOCK_PROFILE_BY_ID[s.creator_id];
      const creator_display = prof?.full_name ?? prof?.username ?? "Analist";
      const asset_display_name = displayAssetNameForSymbol(s.symbol);
      return {
        ...s,
        creator_display,
        asset_display_name,
        detail_href: `/signals?asset=${encodeURIComponent(s.symbol)}`,
      };
    });
}
