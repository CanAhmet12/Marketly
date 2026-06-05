"use client";

import Link from "next/link";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { CryptoAnchorAsset } from "@/features/markets/crypto/types";
import { cn } from "@/lib/cn";

type Props = {
  btc: CryptoAnchorAsset;
  eth: CryptoAnchorAsset;
};

function signedChange(v: number) {
  const s = v > 0 ? "+" : "";
  return `${s}${v.toFixed(2)}%`;
}

function formatPrice(n: number) {
  if (n >= 1000) {
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

type AnchorCellProps = {
  asset: CryptoAnchorAsset;
};

function AnchorCell({ asset }: AnchorCellProps) {
  const isBtc = asset.symbol === "BTC";
  const isUp24h = asset.change24h >= 0;
  const isUp7d = asset.change7d >= 0;

  const symbolClass = isBtc ? "cc-anchor-symbol cc-anchor-symbol--btc" : "cc-anchor-symbol cc-anchor-symbol--eth";
  const cellClass = isBtc ? "cc-anchor-cell cc-anchor-cell--btc" : "cc-anchor-cell cc-anchor-cell--eth";

  const sparkColor = isBtc ? "var(--cc-gold-amber)" : "var(--cc-teal)";

  return (
    <Link
      href={`/markets/${encodeURIComponent(asset.symbol)}`}
      className={cn(cellClass, "block no-underline")}
      aria-label={`${asset.name} detay sayfasına git`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-baseline gap-1.5">
          <span className={symbolClass}>{asset.symbol}</span>
          <span className="cc-anchor-name">{asset.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: isUp24h ? "var(--cc-teal)" : "var(--cc-rose)" }}
          >
            {signedChange(asset.change24h)}
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
            style={{
              background: isUp7d ? "rgba(45,212,191,0.08)" : "rgba(251,113,133,0.08)",
              color: isUp7d ? "var(--cc-teal)" : "var(--cc-rose)",
            }}
          >
            7g {signedChange(asset.change7d)}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mt-1.5">
        <span className="cc-anchor-price">${formatPrice(asset.price)}</span>
      </div>

      {/* Sparkline */}
      <div className="cc-anchor-sparkline">
        <MiniSparkline
          series={asset.sparkline7d}
          trend={asset.trend}
          height={44}
          className="w-full"
        />
      </div>

      {/* Stats row */}
      <div className="cc-anchor-stats">
        <div className="cc-anchor-stat">
          <span className="cc-anchor-stat-label">Piyasa Değeri</span>
          <span className="cc-anchor-stat-value">{asset.marketCap}</span>
        </div>
        <div className="cc-anchor-stat">
          <span className="cc-anchor-stat-label">24s Hacim</span>
          <span className="cc-anchor-stat-value">{asset.volume24h}</span>
        </div>
      </div>

      {/* Subtle accent bottom line */}
      <div
        className="mt-3 h-px w-full rounded-full opacity-30"
        style={{ background: `linear-gradient(90deg, ${sparkColor} 0%, transparent 70%)` }}
        aria-hidden
      />
    </Link>
  );
}

export function CryptoBtcEthAnchor({ btc, eth }: Props) {
  return (
    <div className="cc-section" role="region" aria-label="BTC ve ETH ana varlıklar">
      <p className="cc-section-label cc-section-label--gold mb-3">Ana varlıklar</p>
      <div className="cc-anchor-grid">
        <AnchorCell asset={btc} />
        <AnchorCell asset={eth} />
      </div>
    </div>
  );
}
