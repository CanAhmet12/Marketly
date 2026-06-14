"use client";

import { useMemo } from "react";

import { buildNasdaqSignalsPayload } from "@/features/markets/nasdaq/lib/build-nasdaq-signals";
import {
  isNasdaqIndexSymbol,
  nasdaqSectorLabel,
} from "@/features/markets/nasdaq/lib/nasdaq-symbol-meta";
import { DetailSignalsSection } from "@/features/markets/crypto/symbol-detail/components/detail-signals-section";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";

type Props = {
  bundle: AssetIntelligenceBundle;
  nasdaqAssets: readonly MarketAssetView[];
};

export function NasdaqDetailSignalsSection({ bundle, nasdaqAssets }: Props) {
  const sym = bundle.asset.symbol.trim().toUpperCase();
  const sector = nasdaqSectorLabel(sym);
  const kind = isNasdaqIndexSymbol(sym) ? "Endeks" : "Hisse";

  const marketSignals = useMemo(
    () => buildNasdaqSignalsPayload(nasdaqAssets),
    [nasdaqAssets],
  );

  return (
    <div className="nqx-signals-band" data-zone="signals-band">
      <div className="nqx-signals-band__context" aria-label="NASDAQ sinyal bağlamı">
        <div className="nqx-signals-band__head">
          <span className="nqx-signals-band__kicker">NASDAQ · {kind}</span>
          <strong className="nqx-signals-band__title">{sym} · {sector}</strong>
        </div>
        <div className="nqx-signals-band__stats">
          <span className="nqx-signals-band__pill">
            Piyasa bias <strong>{marketSignals.marketBiasLabel}</strong>
          </span>
          <span className="nqx-signals-band__pill">
            Boğa <strong>%{marketSignals.bullPct}</strong>
          </span>
          <span className="nqx-signals-band__pill">
            Aktif sinyal <strong>{marketSignals.totalActiveSignals}</strong>
          </span>
        </div>
      </div>
      <DetailSignalsSection bundle={bundle} variant="wide" />
    </div>
  );
}
