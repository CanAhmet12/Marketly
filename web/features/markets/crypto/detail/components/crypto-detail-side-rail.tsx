"use client";

import Link from "next/link";
import { useMemo } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";
import { buildCryptoSideRail } from "@/features/markets/crypto/detail/lib/build-crypto-side-rail";
import { useCryptoSentimentVote } from "@/features/markets/crypto/detail/hooks/use-crypto-sentiment-vote";
import type { MockAssetAlert } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import type { AssetIntelligenceBundle, AssetUserContextHints } from "@/features/markets/types/asset-intelligence";
import { SignalDirectionPill } from "@/features/signals/components/unified-signal-primitives";
import type { ChannelSignal } from "@/features/channel/types";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  watched: boolean;
  inPortfolio: boolean;
  alerts: MockAssetAlert[];
  onRemoveAlert: (id: string) => void;
  onOpenAlerts: () => void;
  symbol: string;
  slim?: boolean;
  integrated?: boolean;
  /** ad-canvas sidebar grid */
  layout?: "cd" | "ad";
};

function asDirection(d: string): ChannelSignal["direction"] {
  const u = d.toUpperCase();
  if (u === "BUY" || u === "SELL" || u === "HOLD") return u;
  return "HOLD";
}

function formatVotes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function buildUserHintLines(hints: AssetUserContextHints): string[] {
  const lines: string[] = [];
  if (hints.watchlistRankLabel && hints.watchlistRankLabel !== "—") {
    lines.push(hints.watchlistRankLabel);
  }
  if (hints.followedCreatorOverlap > 0) {
    lines.push(`${hints.followedCreatorOverlap} takip ettiğin analist bu varlıkta aktif`);
  }
  if (hints.signalsFromFollowed > 0) {
    lines.push(`${hints.signalsFromFollowed} sinyal takip ettiğin analistlerden`);
  }
  if (hints.portfolioRelevance && hints.portfolioRelevance !== "—") {
    lines.push(hints.portfolioRelevance);
  }
  if (hints.pinBehaviorNote && hints.pinBehaviorNote !== "—") {
    lines.push(hints.pinBehaviorNote);
  }
  return lines;
}

export function CryptoDetailSideRail({
  bundle,
  watched,
  inPortfolio,
  alerts,
  onRemoveAlert,
  onOpenAlerts,
  symbol,
  slim = true,
  integrated = false,
  layout = "cd",
}: Props) {
  const rail = useMemo(() => buildCryptoSideRail(bundle), [bundle]);
  const isFullRail = integrated || !slim;
  const signalPreview = isFullRail ? rail.signalChips : rail.signalChips.slice(0, 2);
  const quickLinks = isFullRail ? rail.quickLinks : rail.quickLinks.slice(0, 4);
  const userHintLines = useMemo(() => buildUserHintLines(rail.userHints), [rail.userHints]);

  const sentiment = useCryptoSentimentVote(symbol, {
    bullPct: rail.communityBullPct,
    bearPct: rail.communityBearPct,
    totalVotes: rail.communityVotes,
  });

  return (
    <aside
      className={cn(
        layout === "ad" ? "ad-sidebar" : "cd-rail",
        layout === "cd" && slim && "cd-rail--slim",
        layout === "cd" && integrated && "cd-rail--integrated",
      )}
      aria-label="Bağlam şeridi"
    >
      <div className={layout === "ad" ? "ad-sidebar-inner" : "cd-rail-inner"}>
        {integrated ? (
          <div className="cd-rail-cap">
            <Link href={rail.segmentHref} className="cd-rail-chip cd-rail-chip--segment">
              {rail.segmentLabel}
            </Link>
            <span className="cd-rail-cap-stat">{rail.activeSignals} aktif sinyal</span>
          </div>
        ) : null}

        <div className="cd-rail-block cd-rail-block--accent">
          <div className="cd-rail-block-head">
            <p className="cd-rail-block-title">Topluluk sentiment</p>
            <span className="cd-rail-vote-count">{formatVotes(sentiment.totalVotes)} oy</span>
          </div>

          <div className="cd-rail-sentiment-bar" aria-hidden>
            <div
              className="cd-rail-sentiment-fill cd-rail-sentiment-fill--bull"
              style={{ width: `${sentiment.bullPct}%` }}
            />
            <div
              className="cd-rail-sentiment-fill cd-rail-sentiment-fill--bear"
              style={{ width: `${sentiment.bearPct}%` }}
            />
          </div>

          <div className="cd-rail-sentiment-pcts">
            <span className="cd-rail-sentiment-pct cd-rail-sentiment-pct--bull">%{sentiment.bullPct} Boğa</span>
            <span className="cd-rail-sentiment-pct cd-rail-sentiment-pct--bear">%{sentiment.bearPct} Ayı</span>
          </div>

          <div className="cd-rail-vote-actions">
            <button
              type="button"
              className={cn("cd-rail-vote-btn cd-rail-vote-btn--bull", sentiment.vote === "bull" && "is-active")}
              onClick={() => sentiment.castVote("bull")}
              aria-pressed={sentiment.vote === "bull"}
            >
              Boğa
            </button>
            <button
              type="button"
              className={cn("cd-rail-vote-btn cd-rail-vote-btn--bear", sentiment.vote === "bear" && "is-active")}
              onClick={() => sentiment.castVote("bear")}
              aria-pressed={sentiment.vote === "bear"}
            >
              Ayı
            </button>
          </div>

          <p className="cd-rail-analyst-note">
            Analist uyumu <strong>%{rail.agreementPct}</strong>
            {integrated ? (
              <>
                {" "}
                · %{rail.analystBullPct} boğa / %{rail.analystBearPct} ayı
              </>
            ) : null}
          </p>
        </div>

        <div className="cd-rail-block">
          <div className="cd-rail-block-head">
            <p className="cd-rail-block-title">Aktif sinyaller</p>
            <Link href={`/signals?asset=${encodeURIComponent(symbol)}`} className="cd-rail-inline-link">
              Tümü →
            </Link>
          </div>

          {signalPreview.length > 0 ? (
            <ul className="cd-rail-signal-list">
              {signalPreview.map((s) => (
                <li key={s.id}>
                  <Link href={s.href} className="cd-rail-signal-row">
                    <SignalDirectionPill direction={asDirection(s.direction)} tone="crypto" />
                    <span className="cd-rail-signal-analyst">{s.analyst}</span>
                    <span className="cd-rail-signal-conf">%{s.confidence}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cd-rail-empty">Henüz aktif sinyal yok.</p>
          )}
        </div>

        {isFullRail ? (
          <>
            <div className="cd-rail-block">
              <p className="cd-rail-block-title">Bağlam</p>
              <div className="cd-rail-context-chips">
                <span className={cn("cd-rail-chip", watched && "cd-rail-chip--active")}>
                  {watched ? "İzleniyor" : "İzlenmiyor"}
                </span>
                <span className={cn("cd-rail-chip", inPortfolio && "cd-rail-chip--active")}>
                  {inPortfolio ? "Portföyde" : "Portföy dışı"}
                </span>
              </div>
            </div>

            <div className="cd-rail-block">
              <div className="cd-rail-block-head">
                <p className="cd-rail-block-title">Fiyat alarmı</p>
                <button type="button" className="cd-rail-inline-btn" onClick={onOpenAlerts}>
                  + Ekle
                </button>
              </div>
              {alerts.length === 0 ? (
                <p className="cd-rail-empty">Henüz alarm yok.</p>
              ) : (
                <ul className="cd-rail-alert-list">
                  {alerts.map((a) => (
                    <li key={a.id} className="cd-rail-alert-row">
                      <span className="cd-rail-alert-label">{a.label}</span>
                      <button type="button" className="cd-rail-alert-remove" onClick={() => onRemoveAlert(a.id)}>
                        Sil
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : null}

        {integrated && rail.creators.length > 0 ? (
          <div className="cd-rail-block">
            <p className="cd-rail-block-title">İlgili analistler</p>
            <ul className="cd-rail-creator-list">
              {rail.creators.map((c) => (
                <li key={c.id}>
                  <Link href={c.href} className="cd-rail-creator-row">
                    <SafeAvatar src={c.avatarUrl} alt="" size={24} fallbackName={c.display} className="cd-rail-creator-avatar" />
                    <span className="cd-rail-creator-name">{c.display}</span>
                    {c.verified ? <span className="cd-rail-creator-verified">✓</span> : null}
                    <span className="cd-rail-creator-role">{c.role}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {integrated && rail.peers.length > 0 ? (
          <div className="cd-rail-block">
            <p className="cd-rail-block-title">Korele varlıklar</p>
            <ul className="cd-rail-peer-list">
              {rail.peers.map((p) => (
                <li key={p.symbol}>
                  <Link href={p.href} className="cd-rail-peer-row">
                    <span className="cd-rail-peer-symbol">{p.symbol}</span>
                    <span className="cd-rail-peer-label">{p.correlationLabel}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {integrated && rail.macroThemes.length > 0 ? (
          <div className="cd-rail-block">
            <p className="cd-rail-block-title">Makro temalar</p>
            <div className="cd-rail-theme-tags">
              {rail.macroThemes.map((theme) => (
                <span key={theme} className="cd-rail-theme-tag">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {integrated && userHintLines.length > 0 ? (
          <div className="cd-rail-block">
            <p className="cd-rail-block-title">Sana özel</p>
            <ul className="cd-rail-hint-list">
              {userHintLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="cd-rail-quick-row">
          {quickLinks.map((l) => (
            <Link key={l.href + l.label} href={l.href} className="cd-rail-quick-chip">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
