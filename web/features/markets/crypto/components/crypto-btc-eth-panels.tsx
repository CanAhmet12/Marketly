"use client";

import Link from "next/link";
import { useId, useMemo } from "react";

import type { CryptoAnchorAsset } from "@/features/markets/crypto/types";
import { cn } from "@/lib/cn";

type Props = {
  btc: CryptoAnchorAsset;
  eth: CryptoAnchorAsset;
};

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

/** SVG area chart — smooth bezier curve */
function AreaChart({
  series,
  color,
  height = 120,
}: {
  series: number[];
  color: string;
  height?: number;
}) {
  const id = useId().replace(/:/g, "");

  const { path, area } = useMemo(() => {
    const w = 300;
    const h = height;
    const pad = { x: 2, y: 6 };
    const vals = series.length >= 2 ? series : [50, 50];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;

    const pts = vals.map((v, i) => ({
      x: pad.x + (i / (vals.length - 1)) * (w - pad.x * 2),
      y: pad.y + (1 - (v - min) / span) * (h - pad.y * 2),
    }));

    // Smooth bezier path
    let line = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      line += ` C ${cpx.toFixed(1)} ${pts[i - 1].y.toFixed(1)}, ${cpx.toFixed(1)} ${pts[i].y.toFixed(1)}, ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    }

    const lastPt = pts[pts.length - 1];
    const firstPt = pts[0];
    const closedArea = `${line} L ${lastPt.x.toFixed(1)} ${h} L ${firstPt.x.toFixed(1)} ${h} Z`;

    return { path: line, area: closedArea };
  }, [series, height]);

  return (
    <svg
      viewBox={`0 0 300 ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      aria-hidden
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${id})`} stroke="none" />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
      />
    </svg>
  );
}

type PanelProps = {
  asset: CryptoAnchorAsset;
  isBtc: boolean;
};

function AssetPanel({ asset, isBtc }: PanelProps) {
  const color = isBtc ? "var(--cc-gold)" : "var(--cc-violet)";
  const colorHex = isBtc ? "#f59e0b" : "#a78bfa";
  const isUp = asset.change24h >= 0;

  return (
    <Link
      href={`/markets/${encodeURIComponent(asset.symbol)}`}
      className={cn("cc-asset-panel block no-underline", isBtc ? "cc-asset-panel--btc" : "cc-asset-panel--eth")}
      aria-label={`${asset.name} detayına git`}
    >
      {/* Header */}
      <div className="cc-asset-panel-header">
        <div className={cn("cc-asset-logo", isBtc ? "cc-asset-logo--btc" : "cc-asset-logo--eth")}>
          {isBtc ? "₿" : "Ξ"}
        </div>
        <span className="cc-asset-title">
          {asset.name.toUpperCase()} <span style={{ color: "var(--cc-meta)", fontWeight: 500 }}>{asset.symbol}</span>
        </span>
      </div>

      {/* Price */}
      <div className="cc-asset-price-row">
        <span className="cc-asset-price">{fmtPrice(asset.price)}</span>
        <span className="cc-asset-change" style={{ color: isUp ? "var(--cc-teal)" : "var(--cc-rose)" }}>
          {signed(asset.change24h)}
        </span>
      </div>

      {/* Stats */}
      <div className="cc-asset-stats-row">
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">Piyasa Değeri</span>
          <span className="cc-asset-stat-value">{asset.marketCap}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">24s Hacim</span>
          <span className="cc-asset-stat-value">{asset.volume24h}</span>
        </div>
        <div className="cc-asset-stat">
          <span className="cc-asset-stat-label">7g Değişim</span>
          <span className="cc-asset-stat-value" style={{ color: asset.change7d >= 0 ? "var(--cc-teal)" : "var(--cc-rose)" }}>
            {signed(asset.change7d)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="cc-asset-chart-wrap">
        <div className="cc-asset-chart">
          <AreaChart series={asset.sparkline7d} color={colorHex} height={140} />
        </div>
      </div>

      {/* Timeframe buttons (visual) */}
      <div className="cc-asset-timeframes" onClick={(e) => e.preventDefault()}>
        {["1s", "24s", "7g", "30g", "1y"].map((tf) => (
          <button
            key={tf}
            type="button"
            className={cn("cc-asset-tf-btn", tf === "7g" && "cc-asset-tf-btn--active")}
            tabIndex={-1}
          >
            {tf.toUpperCase()}
          </button>
        ))}
      </div>
    </Link>
  );
}

export function CryptoBtcEthPanels({ btc, eth }: Props) {
  return (
    <div className="cc-asset-panels cc-section" role="region" aria-label="Bitcoin ve Ethereum panelleri">
      <AssetPanel asset={btc} isBtc={true} />
      <AssetPanel asset={eth} isBtc={false} />
    </div>
  );
}
