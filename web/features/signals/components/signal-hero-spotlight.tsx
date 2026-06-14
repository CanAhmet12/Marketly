"use client";

import Link from "next/link";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { SignalConfBar } from "@/features/discover/visual-reference/discover-signal-tile";
import { signalLifecycleLabel } from "@/features/signals/domain/signal-meta";
import { formatSignalPrice, strategyTacticLabel } from "@/features/signals/components/unified-signal-primitives";
import { signalMarketTone, type SignalMarketTone } from "@/features/signals/lib/signal-market-tone";
import { resolveSignalAssetCategory } from "@/features/signals/lib/resolve-signal-asset-category";
import type { SignalsFeedRow } from "@/features/signals/repository/types";
import { marketSymbolPath } from "@/features/markets/markets-routes";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { motionEntranceDelay } from "@/lib/motion-stagger";
import { cn } from "@/lib/cn";

const MARKET_LABELS: Record<SignalMarketTone, string> = {
  crypto: "Kripto",
  bist: "BIST",
  forex: "Forex",
  commodity: "Emtia",
  macro: "Makro",
};

function dirMeta(direction: SignalsFeedRow["direction"]) {
  if (direction === "BUY") return { label: "Al", short: "AL", cls: "buy" as const };
  if (direction === "SELL") return { label: "Sat", short: "SAT", cls: "sell" as const };
  return { label: "Bekle", short: "BEKLE", cls: "hold" as const };
}

type Props = {
  signal: SignalsFeedRow;
  onOpen: () => void;
};

export function SignalHeroSpotlight({ signal, onOpen }: Props) {
  const tone = signalMarketTone(resolveSignalAssetCategory(signal));
  const dir = dirMeta(signal.direction);
  const analystHref = `/channel/${signal.creator_id}`;
  const marketHref = marketSymbolPath(signal.symbol);
  const headline =
    signal.rationale?.trim().slice(0, 140) ||
    `${signal.asset_display_name || signal.symbol} için ${strategyTacticLabel(signal.strategy)} tezi.`;
  const isHighConf = signal.confidence >= 85;
  const isPremium = signal.signal_access === "premium" || signal.signal_access === "subscriber_only";

  return (
    <article
      className={cn(
        "sig-hero-spot motion-entrance",
        `sig-hero-spot--tone-${tone}`,
        `sig-hero-spot--dir-${dir.cls}`,
      )}
      style={motionEntranceDelay(0)}
    >
      <div className="sig-hero-spot__wash" aria-hidden />
      <div className="sig-hero-spot__accent" aria-hidden />

      <div className="sig-hero-spot__inner">
        <div className="sig-hero-spot__left">
          <div className="sig-hero-spot__badge-row">
            {isHighConf ? (
              <span className="sig-hero-spot__pick-pill">Yüksek güven</span>
            ) : isPremium ? (
              <span className="sig-hero-spot__pick-pill sig-hero-spot__pick-pill--premium">Premium</span>
            ) : (
              <span className="sig-hero-spot__pick-pill sig-hero-spot__pick-pill--muted">Öne çıkan</span>
            )}
            <span className={cn("sig-hero-spot__market", `sig-hero-spot__market--${tone}`)}>
              {MARKET_LABELS[tone]}
            </span>
          </div>

          <div className="sig-hero-spot__identity">
            <button type="button" className="sig-hero-spot__symbol-btn" onClick={onOpen}>
              <span className="sig-hero-spot__symbol tabular-nums">{signal.symbol}</span>
              <span className="sig-hero-spot__asset">{signal.asset_display_name || signal.symbol}</span>
            </button>
          </div>

          <p className="sig-hero-spot__headline">{headline}</p>

          <div className="sig-hero-spot__levels">
            <div className="sig-hero-spot__level">
              <span className="sig-hero-spot__level-label">Giriş</span>
              <span className="sig-hero-spot__level-value tabular-nums">
                {signal.entryZoneLabel ?? formatSignalPrice(signal.entry_price)}
              </span>
            </div>
            <div className="sig-hero-spot__level sig-hero-spot__level--target">
              <span className="sig-hero-spot__level-label">Hedef</span>
              <span className="sig-hero-spot__level-value tabular-nums">
                {formatSignalPrice(signal.target_price)}
              </span>
            </div>
            <div className="sig-hero-spot__level sig-hero-spot__level--stop">
              <span className="sig-hero-spot__level-label">Stop</span>
              <span className="sig-hero-spot__level-value tabular-nums">
                {formatSignalPrice(signal.stop_loss)}
              </span>
            </div>
          </div>

          <div className="sig-hero-spot__stats">
            <span className="sig-hero-spot__stat">
              <strong className="tabular-nums">{signal.timeframe}</strong> zaman dilimi
            </span>
            <span className="sig-hero-spot__stat">
              <strong>{strategyTacticLabel(signal.strategy)}</strong> taktik
            </span>
            <span className="sig-hero-spot__stat">
              <strong>{signalLifecycleLabel(signal.lifecycle_phase)}</strong>
            </span>
          </div>

          <div className="sig-hero-spot__accuracy sig-hero-spot__accuracy--inline">
            <SignalConfBar value={signal.confidence} size="md" />
          </div>
        </div>

        <div className="sig-hero-spot__right">
          <div className="sig-hero-spot__analyst">
            <SafeAvatar
              src={signal.analyst.avatar_url}
              alt={signal.analyst.display}
              size={44}
              fallbackId={signal.analyst.id}
              fallbackName={signal.analyst.display}
              className="sig-hero-spot__avatar"
            />
            <div className="min-w-0">
              <Link href={analystHref} className="sig-hero-spot__analyst-name">
                {signal.analyst.display}
              </Link>
              <p className="sig-hero-spot__analyst-meta">
                {signal.analyst.verified ? "Doğrulanmış · " : ""}
                {formatTimeAgo(signal.created_at)}
                {signal.riskRewardLabel ? ` · R/R ${signal.riskRewardLabel}` : ""}
              </p>
            </div>
          </div>

          {signal.thesis_grade ? (
            <div className="sig-hero-spot__chips">
              <span className="sig-hero-spot__chip">Tez {signal.thesis_grade}</span>
              {signal.volatility_hint ? (
                <span className="sig-hero-spot__chip">{signal.volatility_hint.toUpperCase()} vol</span>
              ) : null}
              {signal.community_copies_24h > 0 ? (
                <span className="sig-hero-spot__chip">{signal.community_copies_24h} kopya</span>
              ) : null}
            </div>
          ) : null}

          <div className="sig-hero-spot__actions">
            <button type="button" className="sig-hero-spot__cta sig-hero-spot__cta--primary" onClick={onOpen}>
              Sinyali aç
            </button>
            <Link href={marketHref} className="sig-hero-spot__cta sig-hero-spot__cta--secondary">
              Varlık
            </Link>
            <Link href={analystHref} className="sig-hero-spot__cta sig-hero-spot__cta--ghost">
              Analist
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
