"use client";

import { SIGNAL_METRIC_LABELS } from "@/features/signals/lib/signal-detail-narrative";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";

import { SignalDetailThesisContextChips } from "./signal-detail-intel-panels";
import { sentimentAlignmentLabel, volatilityHintLabel } from "./unified-signal-primitives";

type Props = {
  row: SignalsFeedRow;
  watchers: number;
  className?: string;
};

function MetricCell({ label, value, tone }: { label: string; value: string; tone?: "accent" }) {
  return (
    <div className="sdm-metric-cell">
      <span className="sdm-metric-cell__k">{label}</span>
      <span className={cn("sdm-metric-cell__v tabular-nums", tone === "accent" && "sdm-metric-cell__v--accent")}>{value}</span>
    </div>
  );
}

export function SignalDetailMetricsStrip({ row, watchers, className }: Props) {
  return (
    <section className={cn("sdm-zone sdm-metrics-strip", className)} aria-label="Sinyal metrikleri">
      <div className="sdm-metrics-strip__grid">
        <MetricCell label={SIGNAL_METRIC_LABELS.signalConfidence} value={`%${row.confidence}`} tone="accent" />
        <MetricCell label="Tazelik" value={`%${row.freshness_score}`} />
        <MetricCell label="Takip" value={formatCompactCount(watchers)} />
        <MetricCell label="Volatilite" value={volatilityHintLabel(row.volatility_hint)} />
        <MetricCell label="Duygu" value={sentimentAlignmentLabel(row.sentiment_alignment)} />
        <MetricCell label="Vade" value={row.timeframe_category} />
      </div>
      <SignalDetailThesisContextChips row={row} />
    </section>
  );
}
