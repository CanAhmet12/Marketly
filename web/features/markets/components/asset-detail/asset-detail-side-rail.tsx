"use client";

import Link from "next/link";

import type { AssetRelatedCreator, AssetUserContextHints } from "@/features/markets/types/asset-intelligence";
import type { MockAssetAlert } from "@/features/markets/hooks/use-asset-detail-local-mocks";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";

type Props = {
  bundle: AssetIntelligenceBundle;
  watched: boolean;
  inPortfolio: boolean;
  creators: AssetRelatedCreator[];
  alerts: MockAssetAlert[];
  onRemoveAlert: (id: string) => void;
  onOpenAlerts: () => void;
  symbol: string;
  userHints: AssetUserContextHints;
};

export function AssetDetailSideRail({
  bundle,
  watched,
  creators,
  alerts,
  onRemoveAlert,
  onOpenAlerts,
  symbol,
}: Props) {
  const { signalSummary, signals, symbolConsensus } = bundle;

  const bullPct = signalSummary.bullSharePct;
  const bearPct = 100 - bullPct;
  const topSignals = signals.slice(0, 3);

  return (
    <aside className="ad-sidebar">
      <div className="ad-sidebar-inner">

        {/* Blok 1 — Signal Summary */}
        <div className="ad-sidebar-block">
          <p className="ad-sidebar-block-title">Sinyal Özeti</p>

          <div className="ad-signal-gauge">
            {/* Bull bar */}
            <div className="ad-signal-bar-row">
              <span className="ad-signal-pct" style={{ color: "var(--ad-up)" }}>{bullPct}%</span>
              <div className="ad-signal-bar">
                <div className="ad-signal-bar-fill" style={{ width: `${bullPct}%`, background: "var(--ad-up)" }} />
              </div>
              <span style={{ fontSize: 10, color: "var(--ad-meta)", minWidth: 28 }}>BULL</span>
            </div>
            {/* Bear bar */}
            <div className="ad-signal-bar-row">
              <span className="ad-signal-pct" style={{ color: "var(--ad-down)" }}>{bearPct}%</span>
              <div className="ad-signal-bar">
                <div className="ad-signal-bar-fill" style={{ width: `${bearPct}%`, background: "var(--ad-down)" }} />
              </div>
              <span style={{ fontSize: 10, color: "var(--ad-meta)", minWidth: 28 }}>BEAR</span>
            </div>

            {/* Aktif sinyal sayısı */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "var(--ad-meta)" }}>
                {signalSummary.activeTotal} aktif sinyal
              </span>
              <Link
                href={`/signals?asset=${encodeURIComponent(symbol)}`}
                style={{ fontSize: 10, fontWeight: 700, color: "var(--ad-accent)", textDecoration: "none" }}
              >
                Tümü →
              </Link>
            </div>
          </div>

          {/* Top 3 sinyal */}
          {topSignals.length > 0 && (
            <div className="ad-signal-rows" style={{ marginTop: 12 }}>
              {topSignals.map((s) => (
                <Link
                  key={s.id}
                  href={`/signals?asset=${encodeURIComponent(symbol)}`}
                  className="ad-signal-row"
                  style={{ textDecoration: "none" }}
                >
                  <span className="ad-signal-row-symbol">{s.symbol}</span>
                  <span className={`ad-signal-dir ad-signal-dir--${s.direction.toLowerCase() === "buy" ? "buy" : "sell"}`}>
                    {s.direction}
                  </span>
                  <span className="ad-signal-analyst">{s.analyst?.display ?? s.creator_display}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Blok 2 — Top Analysts */}
        {creators.length > 0 && (
          <div className="ad-sidebar-block">
            <p className="ad-sidebar-block-title">Analistler</p>
            <div className="ad-analyst-list">
              {creators.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={c.href}
                  className="ad-analyst-row"
                  style={{ textDecoration: "none" }}
                >
                  <div className="ad-analyst-avatar">
                    {c.display.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="ad-analyst-name">{c.display}</span>
                  <span className="ad-analyst-badge">{c.role}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Blok 3 — Fiyat Alarmları */}
        <div className="ad-sidebar-block">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p className="ad-sidebar-block-title" style={{ marginBottom: 0 }}>Fiyat Alarmı</p>
            <button
              type="button"
              onClick={onOpenAlerts}
              style={{ fontSize: 10, fontWeight: 700, color: "var(--ad-accent)", background: "transparent", border: "none", cursor: "pointer" }}
            >
              + Ekle
            </button>
          </div>
          {alerts.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--ad-meta)" }}>Henüz alarm yok.</p>
          ) : (
            <div className="ad-alert-list">
              {alerts.map((a) => (
                <div key={a.id} className="ad-alert-item">
                  <span style={{ fontSize: 12, color: "var(--ad-text-secondary)", flex: 1 }}>{a.label}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveAlert(a.id)}
                    style={{ fontSize: 11, fontWeight: 700, color: "var(--ad-down)", background: "transparent", border: "none", cursor: "pointer" }}
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blok 4 — Hızlı Bağlantılar */}
        <div className="ad-sidebar-block">
          <p className="ad-sidebar-block-title">Hızlı Linkler</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Sinyal akışı", href: `/signals?asset=${encodeURIComponent(symbol)}` },
              { label: "Fiyat alarmları", href: "/price-alerts" },
              { label: "Portföy",      href: "/portfolio" },
              { label: "Haberler",     href: "/market-news" },
              { label: "Takvim",       href: "/economic-calendar" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ fontSize: 12, fontWeight: 700, color: "var(--ad-accent)", textDecoration: "none" }}
              >
                {l.label} →
              </Link>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}
