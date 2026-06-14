"use client";

import { useMemo } from "react";

import { buildForexSignalsPayload } from "@/features/markets/forex/lib/build-forex-signals";
import { activeForexSessionLabel } from "@/features/markets/forex/lib/forex-pulse-utils";
import {
  forexDisplayLabel,
  forexPairCategoryLabel,
  forexPairLabel,
  normalizeForexSymbol,
} from "@/features/markets/forex/lib/forex-symbol-meta";
import { DetailSignalsSection } from "@/features/markets/crypto/symbol-detail/components/detail-signals-section";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";

type Props = {
  bundle: AssetIntelligenceBundle;
  forexAssets: readonly MarketAssetView[];
};

export function ForexDetailSignalsSection({ bundle, forexAssets }: Props) {
  const sym = normalizeForexSymbol(bundle.asset.symbol);
  const pair = forexPairLabel(sym);
  const category = forexPairCategoryLabel(sym);
  const display = forexDisplayLabel(sym, bundle.asset.name);
  const session = activeForexSessionLabel();

  const marketSignals = useMemo(
    () => buildForexSignalsPayload(forexAssets),
    [forexAssets],
  );

  return (
    <div className="fx-signals-band" data-zone="signals-band">
      <div className="fx-signals-band__context" aria-label="Forex sinyal bağlamı">
        <div className="fx-signals-band__head">
          <span className="fx-signals-band__kicker">Forex · {category}</span>
          <strong className="fx-signals-band__title">
            {display} · {pair}
          </strong>
        </div>
        <div className="fx-signals-band__stats">
          <span className="fx-signals-band__pill">
            Piyasa bias <strong>{marketSignals.marketBiasLabel}</strong>
          </span>
          <span className="fx-signals-band__pill">
            Boğa <strong>%{marketSignals.bullPct}</strong>
          </span>
          <span className="fx-signals-band__pill">
            Aktif sinyal <strong>{marketSignals.totalActiveSignals}</strong>
          </span>
          <span className="fx-signals-band__pill">
            Seans <strong>{session}</strong>
          </span>
        </div>
      </div>
      <DetailSignalsSection bundle={bundle} variant="wide" />
    </div>
  );
}
