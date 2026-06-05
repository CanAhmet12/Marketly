"use client";

import { useCallback } from "react";
import Link from "next/link";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { changePercentTextClass, formatSignedChangePercent } from "@/features/markets/lib/market-display";
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
};

export function AssetDetailHero({
  bundle,
  watched,
  inPortfolio,
  alertCount,
  onToggleWatch,
  onTogglePortfolio,
  onOpenAlerts,
  liveOff,
}: Props) {
  const { asset, categoryLabel, session, signalSummary, heroIntel } = bundle;

  const isUp = asset.change_percent >= 0;

  const share = useCallback(async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/markets/${encodeURIComponent(asset.symbol)}` : "";
    const title = `${asset.symbol} · Marketly`;
    try {
      if (navigator.share) await navigator.share({ title, text: title, url });
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    } catch { /* */ }
  }, [asset.symbol]);

  const fmtPrice = asset.price.toLocaleString("en-US", {
    maximumFractionDigits: asset.price >= 1000 ? 2 : 4,
  });

  /* Stats strip metrics */
  const metrics = [
    { label: "Piyasa Değeri",  value: asset.marketCapLabel ?? "—" },
    { label: "24s Hacim",      value: asset.volume ?? "—" },
    { label: "24s Değişim",    value: formatSignedChangePercent(asset.change_percent), colorClass: changePercentTextClass(asset.change_percent) },
    { label: "Aktif Sinyal",   value: String(signalSummary.activeTotal) },
    { label: "Bull Payı",      value: `%${signalSummary.bullSharePct}` },
    { label: "Ort. Güven",     value: `%${signalSummary.avgConfidenceActive}` },
  ];

  return (
    <header className="ad-hero">
      {liveOff && (
        <div style={{
          marginBottom: 16,
          padding: "8px 14px",
          borderRadius: 8,
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.18)",
          fontSize: 11,
          fontWeight: 600,
          color: "#d97706",
        }}>
          Canlı kotasyon henüz yüklenemedi. Piyasalar sayfasından sembolü kontrol edin veya kısa süre sonra yenileyin.
        </div>
      )}

      <div className="ad-hero-top">
        {/* Sol: Kimlik + Bilgi */}
        <div className="ad-hero-identity">
          <div className="ad-hero-category-row">
            <span className="ad-hero-category">{categoryLabel}</span>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>·</span>
            <span className="ad-hero-session">{session.headline}</span>
          </div>

          <div className="ad-hero-name-row">
            <h1 className="ad-hero-symbol" style={marketVtStyle(asset.symbol, "symbol")}>
              {asset.symbol}
            </h1>
            <span className="ad-hero-fullname">{asset.name}</span>
          </div>

          <p className="ad-hero-session-detail">{session.detail}</p>

          {/* Intel pills — sadece önemlileri */}
          <div className="ad-hero-pills">
            <span className="ad-intel-pill">{heroIntel.sentimentPulse}</span>
            <span className="ad-intel-pill">Konsensüs: {heroIntel.consensusDirection}</span>
            <span className="ad-intel-pill">{heroIntel.volatilityLabel}</span>
            <span className="ad-intel-pill">{heroIntel.momentumLabel}</span>
            <span className="ad-intel-pill">{heroIntel.signalActivityLabel}</span>
          </div>

          {/* Aksiyon butonları */}
          <div className="ad-hero-actions">
            <button
              type="button"
              onClick={onToggleWatch}
              className={cn("ad-btn", watched ? "ad-btn--active" : "ad-btn--ghost")}
              aria-pressed={watched}
              aria-label={watched ? "Takibi bırak" : "Takip listesine ekle"}
            >
              {watched ? "✓ Takipte" : "+ Takip Et"}
            </button>
            <button
              type="button"
              onClick={onOpenAlerts}
              className="ad-btn ad-btn--ghost"
            >
              Alarm{alertCount ? ` (${alertCount})` : ""}
            </button>
            <button
              type="button"
              onClick={onTogglePortfolio}
              className={cn("ad-btn", inPortfolio ? "ad-btn--active" : "ad-btn--ghost")}
              aria-pressed={inPortfolio}
              aria-label={inPortfolio ? "Portföyden çıkar" : "Portföye ekle"}
            >
              {inPortfolio ? "Portföyde" : "Portföy"}
            </button>
            <Link
              href={`/signals?asset=${encodeURIComponent(asset.symbol)}`}
              className="ad-btn ad-btn--primary"
              style={{ textDecoration: "none" }}
            >
              Sinyal Akışı →
            </Link>
            <button type="button" onClick={() => void share()} className="ad-btn ad-btn--link" aria-label="Sembol linkini paylaş">
              Paylaş
            </button>
          </div>
        </div>

        {/* Sağ: Fiyat + Sparkline */}
        <div className="ad-hero-price">
          <div
            className="ad-price-value"
            style={{ color: "var(--ad-accent, var(--color-text))", ...marketVtStyle(asset.symbol, "price") }}
          >
            ${fmtPrice}
          </div>
          <div className={cn("ad-price-change", isUp ? "ad-price-change--up" : "ad-price-change--down")}>
            {formatSignedChangePercent(asset.change_percent)}
          </div>
          <div className="ad-hero-sparkline" style={marketVtStyle(asset.symbol, "spark")}>
            <MiniSparkline
              series={asset.sparkline ?? []}
              trend={asset.trend}
              height={40}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="ad-metrics-strip">
        {metrics.map((m) => (
          <div key={m.label} className="ad-metric">
            <span className="ad-metric-label">{m.label}</span>
            <span className={cn("ad-metric-value", m.colorClass)}>{m.value}</span>
          </div>
        ))}
      </div>
    </header>
  );
}
