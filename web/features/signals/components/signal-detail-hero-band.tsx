"use client";

import Link from "next/link";

import { SignalPremiumUnlockCta } from "@/features/signals/components/signal-economy-ui";
import { SignalConfidenceRing } from "@/features/signals/components/signal-confidence-ring";
import { SignalDetailVerdictBanner } from "@/features/signals/components/signal-detail-verdict-banner";
import { SignalDetailPriceTape } from "@/features/signals/components/signal-detail-price-tape";
import {
  formatSignalPrice,
  SignalDirectionPill,
  strategyTacticLabel,
} from "@/features/signals/components/unified-signal-primitives";
import { signalStatusKey, signalStatusLabel } from "@/features/signals/domain/signal-meta";
import { marketSymbolPath } from "@/features/markets/markets-routes";
import type { SignalDetailVerdict } from "@/features/signals/lib/signal-detail-narrative";
import { buildTradePlanNarrative } from "@/features/signals/lib/signal-detail-narrative";
import {
  changeFromRow,
  livePricePosition,
  progressToTarget,
} from "@/features/signals/lib/map-feed-row-to-live-card";
import { signalMarketTone } from "@/features/signals/lib/signal-market-tone";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { cn } from "@/lib/cn";

const MARKET_LABELS = {
  crypto: "Kripto",
  bist: "BIST",
  forex: "Forex",
  commodity: "Emtia",
  macro: "Makro",
} as const;

type Props = {
  row: SignalsFeedRow;
  locked: boolean;
  entryLabel: string;
  targetLabel: string;
  stopLabel: string;
  rrLabel: string | null;
  verdict: SignalDetailVerdict;
  onClose: () => void;
};

function TicketCell({ label, value, tone }: { label: string; value: string; tone?: "target" | "stop" | "rr" }) {
  return (
    <div className={`sdm-ticket-cell${tone ? ` sdm-ticket-cell--${tone}` : ""}`}>
      <span className="sdm-ticket-cell__label">{label}</span>
      <span className="sdm-ticket-cell__value">{value}</span>
    </div>
  );
}

export function SignalDetailHeroBand({ row, locked, entryLabel, targetLabel, stopLabel, rrLabel, verdict, onClose }: Props) {
  const dirClass =
    row.direction === "BUY" ? "sdm-hero--buy" : row.direction === "SELL" ? "sdm-hero--sell" : "sdm-hero--hold";
  const statusLabel = signalStatusLabel(signalStatusKey(row));
  const tradePlanLine = !locked ? buildTradePlanNarrative(row) : null;
  const marketTone = signalMarketTone(row.assetCategory);
  const change = changeFromRow(row);
  const spot = row.sparkline[row.sparkline.length - 1] ?? row.entry_price ?? 0;
  const spotLabel = formatSignalPrice(spot);

  return (
    <header className={`sdm-hero sdm-zone ${dirClass}`}>
      <div className="sdm-hero__glow" aria-hidden />

      <div className="sdm-hero__layout">
        <div className="sdm-hero__identity">
          <SignalConfidenceRing value={row.confidence} direction={row.direction} size={64} />
          <div className="sdm-hero__identity-text">
            <div className="sdm-hero__symbol-row">
              <h2 id="sig-modal-title" className="sdm-hero__symbol">
                {row.symbol}
              </h2>
              <SignalDirectionPill direction={row.direction} />
            </div>
            <SignalDetailVerdictBanner verdict={verdict} />
            <p className="sdm-hero__asset">{row.asset_display_name}</p>
            <div className="sdm-hero__badges">
              <span className={`sdp-market-badge sdp-market-badge--${marketTone}`}>{MARKET_LABELS[marketTone]}</span>
              <span className="sdm-hero__badge">{strategyTacticLabel(row.strategy)}</span>
              <span className="sdm-hero__badge sdm-hero__badge--muted">{row.timeframe}</span>
              <span className="sdm-hero__badge sdm-hero__badge--muted">{statusLabel}</span>
              <span className="sdm-hero__badge sdm-hero__badge--muted">{formatTimeAgo(row.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="sdm-hero__ticket-wrap">
          <div className="sdm-hero__quote">
            <div className="sdm-hero__quote-values">
              <span className="sdm-hero__spot tabular-nums">{spotLabel}</span>
              <span
                className={cn(
                  "sdm-hero__change tabular-nums",
                  change.positive ? "sdm-hero__change--up" : "sdm-hero__change--down",
                )}
              >
                {change.pct}
              </span>
            </div>
          </div>

          {locked ? (
            <div className="sdm-ticket-locked">
              <div className="sdm-ticket-grid sdm-ticket-grid--locked" aria-hidden>
                <TicketCell label="Giriş" value="•••••" />
                <TicketCell label="Hedef" value="•••••" tone="target" />
                <TicketCell label="Stop" value="•••••" tone="stop" />
                <TicketCell label="R/R" value="—" tone="rr" />
              </div>
              <SignalPremiumUnlockCta channelId={row.creator_id} compact />
            </div>
          ) : (
            <div className="sdm-ticket-grid sdm-ticket-grid--hero">
              <TicketCell label="Giriş" value={entryLabel} />
              <TicketCell label="Hedef" value={targetLabel} tone="target" />
              <TicketCell label="Stop" value={stopLabel} tone="stop" />
              <TicketCell label="R/R" value={rrLabel ?? "—"} tone="rr" />
            </div>
          )}
          {!locked ? (
            <SignalDetailPriceTape position={livePricePosition(row)} progress={progressToTarget(row)} />
          ) : null}
          {tradePlanLine ? <p className="sdm-hero__trade-plan">{tradePlanLine}</p> : null}
        </div>

        <div className="sdm-hero__quick-links">
          <Link href={marketSymbolPath(row.symbol)} className="sdm-hero__link" onClick={onClose}>
            Piyasa
          </Link>
          <Link href={`/channel/${row.creator_id}`} className="sdm-hero__link" onClick={onClose}>
            Üretici
          </Link>
        </div>
      </div>
    </header>
  );
}
