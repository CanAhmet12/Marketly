"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";

import { MarketSymbolIcon } from "@/features/markets/components/market-symbol-icon";
import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import {
  buildCryptoHeroIntelPills,
  buildCryptoHeroMetrics,
  formatCryptoDetailPrice,
} from "@/features/markets/crypto/detail/lib/crypto-detail-hero-utils";
import { exaggerateSparkForDisplay } from "@/features/markets/crypto/detail/lib/crypto-detail-sparkline";
import { formatSignedChangePercent } from "@/features/markets/lib/market-display";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import { marketVtStyle } from "@/lib/navigation/view-transition";
import { cn } from "@/lib/cn";

type Props = {
  bundle: AssetIntelligenceBundle;
  watched: boolean;
  inPortfolio: boolean;
  alertCount: number;
  onToggleWatch: () => void;
  onTogglePortfolio: () => void;
  onOpenAlerts: () => void;
  liveOff?: boolean;
  isLive?: boolean;
  sentinelId?: string;
};

function intelPillClass(tone?: string): string {
  if (tone === "bull") return "cd-intel-pill--bull";
  if (tone === "bear") return "cd-intel-pill--bear";
  if (tone === "gold") return "cd-intel-pill--gold";
  if (tone === "muted") return "cd-intel-pill--muted";
  return "";
}

function metricToneClass(tone?: string): string | undefined {
  if (tone === "up") return "cc-up";
  if (tone === "down") return "cc-down";
  if (tone === "gold") return "cd-hero-metric-value--gold";
  return undefined;
}

export function CryptoDetailHero({
  bundle,
  watched,
  inPortfolio,
  alertCount,
  onToggleWatch,
  onTogglePortfolio,
  onOpenAlerts,
  liveOff,
  isLive,
  sentinelId = "cd-hero-sentinel",
}: Props) {
  const { asset, signalSummary, heroIntel, session, categoryLabel } = bundle;
  const isUp = asset.change_percent >= 0;
  const signalsHref = `/signals?asset=${encodeURIComponent(asset.symbol)}`;

  const intelPills = useMemo(
    () =>
      buildCryptoHeroIntelPills(heroIntel, signalSummary).filter(
        (pill) => pill.id !== "signals" && pill.id !== "confidence",
      ),
    [heroIntel, signalSummary],
  );

  const quickMetrics = useMemo(
    () =>
      buildCryptoHeroMetrics({
        marketCapLabel: asset.marketCapLabel,
        volume: asset.volume,
        changePercent: asset.change_percent,
        signalSummary,
        formatChange: formatSignedChangePercent,
      }).filter((m) => ["mcap", "vol", "chg", "sig"].includes(m.key)),
    [asset.marketCapLabel, asset.volume, asset.change_percent, signalSummary],
  );

  const sparkSeries = useMemo(
    () => exaggerateSparkForDisplay(asset.sparkline ?? [], asset.change_percent),
    [asset.sparkline, asset.change_percent],
  );

  const share = useCallback(async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/markets/${encodeURIComponent(asset.symbol)}`
        : "";
    const title = `${asset.symbol} · Marketly Kripto`;
    try {
      if (navigator.share) await navigator.share({ title, text: title, url });
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    } catch {
      /* iptal */
    }
  }, [asset.symbol]);

  const tagline =
    session.detail?.trim() ||
    (signalSummary.activeTotal > 0
      ? `${signalSummary.activeTotal} aktif sinyal · analist ve topluluk istihbaratı`
      : "7/24 piyasa · sinyal ve topluluk istihbaratı");

  return (
    <header className="cd-hero cd-hero-unified" role="region" aria-label={`${asset.symbol} özeti`}>
      <div id={sentinelId} className="cd-hero-sentinel" aria-hidden />

      {liveOff ? (
        <div className="cd-live-banner" role="status">
          Canlı kotasyon yüklenemedi — kısa süre sonra yenileyin.
        </div>
      ) : null}

      <div className="cd-hero-unified-top">
        <div className="cd-hero-unified-identity">
          <div className="cd-hero-logo-wrap" aria-hidden>
            <MarketSymbolIcon symbol={asset.symbol} size={40} className="cd-hero-logo" />
          </div>
          <div className="cd-hero-title-stack">
            <div className="cd-hero-badge-row">
              <span className="cd-hero-badge cd-hero-badge--category">{categoryLabel}</span>
              {isLive ? (
                <span className="cd-hero-live-chip">
                  <span className="cd-hero-live-dot" aria-hidden />
                  CANLI
                </span>
              ) : null}
              {heroIntel.volatilityRegime === "expanded" ? (
                <span className="cd-hero-badge cd-hero-badge--session">Yüksek volatilite</span>
              ) : null}
            </div>

            <div className="cd-hero-title-row">
              <h1 className="cd-hero-symbol" style={marketVtStyle(asset.symbol, "symbol")}>
                {asset.symbol}
              </h1>
              <span className="cd-hero-name">{asset.name}</span>
            </div>

            <p className="cd-hero-tagline">{tagline}</p>

            {session.headline ? <p className="cd-hero-session-line">{session.headline}</p> : null}
          </div>
        </div>

        <div className="cd-hero-unified-quote">
          <span className="cd-price-label">Spot fiyat</span>
          <div className="cd-hero-quote-main">
            <span className="cd-price-value cd-price-value--unified" style={marketVtStyle(asset.symbol, "price")}>
              ${formatCryptoDetailPrice(asset.price)}
            </span>
            <span className={cn("cd-price-change cd-price-change--unified", isUp ? "cc-up" : "cc-down")}>
              {formatSignedChangePercent(asset.change_percent)}
              <span className="cd-price-window">24s</span>
            </span>
          </div>
          {sparkSeries.length > 1 ? (
            <div className="cd-hero-spark-wrap" style={marketVtStyle(asset.symbol, "spark")}>
              <MiniSparkline
                series={sparkSeries}
                trend={asset.trend}
                height={40}
                className="cd-hero-spark w-full"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="cd-hero-unified-intel">
        <div className="cd-intel-pills" role="list" aria-label="Piyasa istihbaratı">
          {intelPills.map((pill) => (
            <span key={pill.id} role="listitem" className={cn("cd-intel-pill", intelPillClass(pill.tone))}>
              {pill.label}
            </span>
          ))}
        </div>

        <dl className={cn("cd-hero-quick-metrics", "cd-hero-quick-metrics--compact")} aria-label="Hızlı metrikler">
          {quickMetrics.map((m) => (
            <div key={m.key} className="cd-hero-metric">
              <dt className="cd-hero-metric-label">{m.label}</dt>
              <dd className={cn("cd-hero-metric-value", metricToneClass(m.tone))}>{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="cd-hero-unified-foot">
        <div className="cd-hero-unified-actions" role="group" aria-label="Varlık aksiyonları">
          <Link href={signalsHref} className="cd-btn cd-btn--compact cd-btn--primary cd-btn--hero-primary">
            Sinyaller
            {signalSummary.activeTotal > 0 ? (
              <span className="cd-btn-badge">{signalSummary.activeTotal}</span>
            ) : null}
          </Link>

          <div className="cd-hero-actions-secondary">
            <button
              type="button"
              onClick={onToggleWatch}
              className={cn("cd-btn cd-btn--compact", watched ? "cd-btn--active" : "cd-btn--ghost")}
              aria-pressed={watched}
            >
              {watched ? "Takipte" : "Takip"}
            </button>
            <button type="button" onClick={onOpenAlerts} className="cd-btn cd-btn--compact cd-btn--ghost">
              Alarm{alertCount > 0 ? ` · ${alertCount}` : ""}
            </button>
            <button
              type="button"
              onClick={onTogglePortfolio}
              className={cn("cd-btn cd-btn--compact", inPortfolio ? "cd-btn--active" : "cd-btn--ghost")}
              aria-pressed={inPortfolio}
            >
              {inPortfolio ? "Portföyde" : "Portföye ekle"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => void share()}
            className="cd-btn cd-btn--compact cd-btn--ghost cd-btn--icon"
            aria-label="Sayfayı paylaş"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>

        <p className="cd-hero-analyst-note">{heroIntel.activeAnalystsLabel}</p>
      </div>
    </header>
  );
}
