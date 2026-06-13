"use client";

import { useMemo } from "react";

import { buildSymbolConsensusIntel } from "@/features/signals/lib/signal-intelligence-build";
import {
  buildConsensusNarrative,
  getConsensusDirectionCounts,
  SIGNAL_METRIC_LABELS,
} from "@/features/signals/lib/signal-detail-narrative";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  catalog: readonly SignalsFeedRow[];
  currentDirection?: SignalsFeedRow["direction"];
  className?: string;
  title?: string;
};

function ScoreCell({ label, hint, v }: { label: string; hint?: string; v: number }) {
  return (
    <div className="sdm-score-cell" title={hint}>
      <p className="sdm-score-cell__label">{label}</p>
      <p className="sdm-score-cell__value">{v}</p>
    </div>
  );
}

/** Sembol konsensüsü — catalog aggregation + narrative (E4B/E4D). */
export function SignalDetailConsensusPanel({
  symbol,
  catalog,
  currentDirection = "BUY",
  className,
  title = "Piyasa görüşü",
}: Props) {
  const consensus = useMemo(() => buildSymbolConsensusIntel([...catalog], symbol), [catalog, symbol]);
  const counts = useMemo(() => getConsensusDirectionCounts(catalog, symbol), [catalog, symbol]);
  const narrative = useMemo(
    () => buildConsensusNarrative(consensus, counts, currentDirection),
    [consensus, counts, currentDirection],
  );

  return (
    <section className={cn("sdm-zone sdm-consensus-block", className)} aria-label={`${symbol} piyasa görüşü`}>
      <h3 className="sdm-panel-block__title">{title}</h3>
      <p className="sdm-consensus-block__headline">{narrative.headline}</p>
      <p className="sdm-panel-block__meta">{narrative.sampleLine}</p>
      <p className="sdm-consensus-block__dirs" aria-label="Yön dağılımı">
        {narrative.directionLine}
      </p>
      <div className="sdm-score-grid sdm-score-grid--quad">
        <ScoreCell
          label={SIGNAL_METRIC_LABELS.directionAgreement}
          hint="Aktif çağrılarda baskın yönün payı"
          v={consensus.agreementPct}
        />
        <ScoreCell
          label={SIGNAL_METRIC_LABELS.consensusConfidence}
          hint="Bu semboldeki aktif çağrıların ortalama tez gücü"
          v={consensus.confidenceAvg}
        />
        <ScoreCell
          label={SIGNAL_METRIC_LABELS.bullShare}
          hint="AL yönündeki çağrıların AL+SAT içindeki payı"
          v={consensus.bullishConcentrationPct}
        />
        <ScoreCell
          label={SIGNAL_METRIC_LABELS.bearShare}
          hint="SAT yönündeki çağrıların AL+SAT içindeki payı"
          v={consensus.bearishConcentrationPct}
        />
      </div>
    </section>
  );
}
