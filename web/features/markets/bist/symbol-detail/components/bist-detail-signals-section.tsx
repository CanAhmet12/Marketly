"use client";

import { useMemo } from "react";

import { buildBistSignalsPayload } from "@/features/markets/bist/lib/build-bist-signals";
import { activeBistSessionLabel } from "@/features/markets/bist/lib/bist-pulse-utils";
import {
  bistDisplayLabel,
  bistSectorLabel,
  isBistIndexSymbol,
  normalizeBistSymbol,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { DetailSignalsSection } from "@/features/markets/crypto/symbol-detail/components/detail-signals-section";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { MarketAssetView } from "@/features/markets/types";

type Props = {
  bundle: AssetIntelligenceBundle;
  bistAssets: readonly MarketAssetView[];
};

export function BistDetailSignalsSection({ bundle, bistAssets }: Props) {
  const sym = normalizeBistSymbol(bundle.asset.symbol);
  const sector = bistSectorLabel(sym);
  const kind = isBistIndexSymbol(sym) ? "Endeks" : "Hisse";
  const display = bistDisplayLabel(sym, bundle.asset.name);
  const session = activeBistSessionLabel();

  const marketSignals = useMemo(
    () => buildBistSignalsPayload(bistAssets),
    [bistAssets],
  );

  return (
    <div className="bc-signals-band" data-zone="signals-band">
      <div className="bc-signals-band__context" aria-label="BIST sinyal bağlamı">
        <div className="bc-signals-band__head">
          <span className="bc-signals-band__kicker">BIST · {kind}</span>
          <strong className="bc-signals-band__title">
            {display} · {sector}
          </strong>
        </div>
        <div className="bc-signals-band__stats">
          <span className="bc-signals-band__pill">
            Piyasa bias <strong>{marketSignals.marketBiasLabel}</strong>
          </span>
          <span className="bc-signals-band__pill">
            Boğa <strong>%{marketSignals.bullPct}</strong>
          </span>
          <span className="bc-signals-band__pill">
            Aktif sinyal <strong>{marketSignals.totalActiveSignals}</strong>
          </span>
          <span className="bc-signals-band__pill">
            Seans <strong>{session}</strong>
          </span>
        </div>
      </div>
      <DetailSignalsSection bundle={bundle} variant="wide" />
    </div>
  );
}
