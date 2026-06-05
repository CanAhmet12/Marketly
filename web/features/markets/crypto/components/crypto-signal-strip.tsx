"use client";

import Link from "next/link";

import type { CryptoSignalStripPayload } from "@/features/markets/crypto/types";

type Props = {
  signals: CryptoSignalStripPayload;
};

export function CryptoSignalStrip({ signals }: Props) {
  return (
    <div className="cc-signal-strip cc-section" role="region" aria-label="Sinyal istihbaratı">
      <div className="cc-signal-strip-header">
        <div className="cc-zone-label" style={{ marginBottom: 0 }}>
          Sinyal istihbaratı
          <Link href="/signals" className="cc-zone-label-link">
            Tüm sinyaller →
          </Link>
        </div>
      </div>

      {/* Meta bar */}
      <div className="cc-signal-strip-meta">
        <span style={{ color: "var(--cc-text-secondary)", fontWeight: 700 }}>
          {signals.totalActiveSignals} aktif sinyal
        </span>
        <span style={{ color: "var(--cc-meta)" }}>·</span>
        <span style={{ color: "var(--cc-teal)", fontWeight: 700 }}>
          Bull {signals.bullPct}%
        </span>
        <span style={{ color: "var(--cc-rose)", fontWeight: 700 }}>
          Bear {signals.bearPct}%
        </span>
        <span style={{ color: "var(--cc-meta)" }}>·</span>
        <span>{signals.marketBiasLabel}</span>

        {/* Bias bar */}
        <div className="cc-signal-bias-bar">
          <div
            className="cc-signal-bias-fill"
            style={{ width: `${Math.min(100, Math.max(8, signals.bullPct))}%` }}
          />
        </div>
      </div>

      {/* Asset rows */}
      <div className="cc-signal-rows" style={{ marginTop: 12 }}>
        {signals.topAssets.map((asset) => (
          <Link
            key={asset.symbol}
            href={`/signals?asset=${encodeURIComponent(asset.symbol)}`}
            className={asset.symbol === "BTC" ? "cc-signal-row cc-signal-row--btc" : "cc-signal-row"}
            aria-label={`${asset.symbol} sinyallerine git`}
          >
            <span className="cc-signal-row-symbol">{asset.symbol}</span>
            <span className="cc-signal-row-count">{asset.activeSignals} sinyal</span>
            <div className="cc-signal-row-bar">
              <div
                className="cc-signal-row-bar-fill"
                style={{ width: `${Math.min(100, Math.max(4, asset.bullPct))}%` }}
              />
            </div>
            <span className="cc-signal-row-pct">
              {asset.bullPct}% bull
            </span>
            <span className="cc-signal-row-label">{asset.biasLabel}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
