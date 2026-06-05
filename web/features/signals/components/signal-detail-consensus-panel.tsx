"use client";

import { useMemo } from "react";

import { getSignalsRepository } from "@/features/signals/repository";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  className?: string;
  title?: string;
};

function ScoreCell({ label, v }: { label: string; v: number }) {
  return (
    <div className="sdm-score-cell">
      <p className="sdm-score-cell__label">{label}</p>
      <p className="sdm-score-cell__value">{v}</p>
    </div>
  );
}

/** Sembol konsensüsü — context kolonu (itibar ayrı analist kartında). */
export function SignalDetailConsensusPanel({ symbol, className, title = "Konsensüs" }: Props) {
  const consensus = useMemo(() => getSignalsRepository().getSymbolConsensusIntel(symbol), [symbol]);

  return (
    <section className={cn("sdm-panel-block sdm-consensus-block", className)} aria-label={`${symbol} konsensüsü`}>
      <h3 className="sdm-panel-block__title">{title}</h3>
      <div className="sdm-score-grid sdm-score-grid--quad">
        <ScoreCell label="Uyum" v={consensus.agreementPct} />
        <ScoreCell label="Güven" v={consensus.confidenceAvg} />
        <ScoreCell label="Boğa" v={consensus.bullishConcentrationPct} />
        <ScoreCell label="Ayı" v={consensus.bearishConcentrationPct} />
      </div>
    </section>
  );
}
