"use client";

import Link from "next/link";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { SignalDirectionPill } from "@/features/signals/components/unified-signal-primitives";
import type { AssetIntelligenceBundle } from "@/features/markets/types/asset-intelligence";
import type { ChannelSignal } from "@/features/channel/types";

type Props = { bundle: AssetIntelligenceBundle };

function asDirection(d: string): ChannelSignal["direction"] {
  const u = d.toUpperCase();
  if (u === "BUY" || u === "SELL" || u === "HOLD") return u;
  return "HOLD";
}

export function AssetDetailSignalIntelligence({ bundle }: Props) {
  const { asset, signalSummary, signals, signalHub } = bundle;

  // İlk 5 sinyali göster
  const topSignals = signals.slice(0, 5);

  return (
    <div className="ad-section">
      <div className="ad-section-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="ad-section-accent" />
          <span className="ad-section-title">Sinyal İstihbaratı</span>
        </div>
        <Link
          href={`/signals?asset=${encodeURIComponent(asset.symbol)}`}
          className="ad-section-link"
        >
          Tüm sinyaller →
        </Link>
      </div>

      {/* Hub metrics strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0,1fr))",
        gap: "1px",
        background: "var(--ad-border-subtle)",
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 16,
      }}>
        {[
          { label: "Aktif", value: String(signalSummary.activeTotal) },
          { label: "BUY / SELL", value: `${signalSummary.activeBuy} / ${signalSummary.activeSell}` },
          { label: "Ort. Güven", value: `%${signalSummary.avgConfidenceActive}` },
          { label: "Bull Payı", value: `%${signalSummary.bullSharePct}` },
        ].map((m) => (
          <div key={m.label} className="ad-stat-cell">
            <span className="ad-stat-label">{m.label}</span>
            <span className="ad-stat-value">{m.value}</span>
          </div>
        ))}
      </div>

      {/* Signal table */}
      {topSignals.length > 0 ? (
        <div className="ad-signal-table-wrap">
          <table className="ad-signal-table">
            <thead>
              <tr>
                <th>Analist</th>
                <th>Yön</th>
                <th>Giriş</th>
                <th>TP</th>
                <th>Güven</th>
                <th>Grafik</th>
              </tr>
            </thead>
            <tbody>
              {topSignals.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link
                      href={`/signals?asset=${encodeURIComponent(asset.symbol)}`}
                      style={{ fontSize: 12, fontWeight: 700, color: "var(--ad-text)", textDecoration: "none" }}
                    >
                      {s.analyst?.display ?? s.creator_display}
                    </Link>
                  </td>
                  <td>
                    <SignalDirectionPill direction={asDirection(s.direction)} />
                  </td>
                  <td style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: "var(--ad-text-secondary)" }}>
                    {s.entry_price?.toLocaleString("en-US", { maximumFractionDigits: 2 }) ?? "—"}
                  </td>
                  <td style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: "var(--ad-up)" }}>
                    {s.target_price?.toLocaleString("en-US", { maximumFractionDigits: 2 }) ?? "—"}
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 700, color: "var(--ad-text-secondary)" }}>
                    {s.confidence != null ? `%${s.confidence}` : "—"}
                  </td>
                  <td>
                    <MiniSparkline
                      series={asset.sparkline ?? []}
                      trend={asset.trend}
                      height={24}
                      className="w-[56px]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: "var(--ad-meta)" }}>Bu varlık için aktif sinyal bulunamadı.</p>
      )}
    </div>
  );
}
