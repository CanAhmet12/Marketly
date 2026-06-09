"use client";

import { useId } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import type { CryptoPulseMetrics } from "@/features/markets/crypto/types";
import { cn } from "@/lib/cn";

type Props = { pulse: CryptoPulseMetrics };

function fmt(n: number) {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function signed(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function changeColor(v: number) {
  if (v > 0) return "var(--cc-teal)";
  if (v < 0) return "var(--cc-rose)";
  return "var(--cc-meta)";
}

function fearGreedClass(v: number) {
  if (v <= 25) return "cc-fg-extreme-fear";
  if (v <= 45) return "cc-fg-fear";
  if (v <= 55) return "cc-fg-neutral";
  if (v <= 75) return "cc-fg-greed";
  return "cc-fg-extreme-greed";
}

function fearGreedStroke(v: number) {
  if (v <= 25) return "#ef4444";
  if (v <= 45) return "#f97316";
  if (v <= 55) return "#64748b";
  if (v <= 75) return "#2dd4bf";
  return "#f59e0b";
}

function FearGreedGauge({ value }: { value: number }) {
  const id = useId().replace(/:/g, "");
  // Arc: 180° semicircle, r=22, center=(28,28)
  const r = 20;
  const cx = 28;
  const cy = 28;
  const pct = Math.min(100, Math.max(0, value)) / 100;
  // Start angle -180°, end angle 0° (left to right)
  const startAngle = Math.PI; // left
  const endAngle = startAngle - pct * Math.PI; // right based on value
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = pct > 0.5 ? 1 : 0;
  const stroke = fearGreedStroke(value);
  const fgClass = fearGreedClass(value);
  const label = value <= 25 ? "Aşırı Korku" : value <= 45 ? "Korku" : value <= 55 ? "Nötr" : value <= 75 ? "Açgözlülük" : "Aşırı Açgözlülük";

  return (
    <div className="cc-fg-gauge">
      <span className="cc-pulse-label">Korku / Açgözlülük</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="56" height="32" viewBox="0 0 56 32" aria-hidden style={{ overflow: "visible" }}>
          {/* Track */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Fill */}
          {pct > 0 && (
            <path
              d={`M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`}
              fill="none"
              stroke={stroke}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}
          {/* Needle dot */}
          <circle cx={x2.toFixed(2)} cy={y2.toFixed(2)} r="3" fill={stroke} />
        </svg>
        <div>
          <span className={cn("cc-fg-value", fgClass)}>{value}</span>
          <div className={cn("cc-fg-band", fgClass)} style={{ fontSize: 11 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

function AltcoinProgress({ index }: { index: number }) {
  const isAlt = index >= 75;
  const isMixed = index >= 50;
  const color = isAlt ? "var(--cc-violet)" : isMixed ? "var(--cc-gold-amber)" : "var(--cc-meta)";
  const mode = isAlt ? "Alt Sezonu" : isMixed ? "Karma" : "BTC Sezonu";

  return (
    <div className="cc-alt-season">
      <span className="cc-pulse-label">Altcoin Sezonu</span>
      <div className="cc-alt-value-row">
        <span className="cc-alt-big" style={{ color }}>{index}</span>
        <span className="cc-alt-sub">/100</span>
      </div>
      <div className="cc-alt-bar-track">
        <div
          className="cc-alt-bar-fill"
          style={{ width: `${index}%`, background: color }}
        />
      </div>
      <span className="cc-alt-mode" style={{ color }}>{mode}</span>
    </div>
  );
}

export function CryptoPulseBar({ pulse }: Props) {
  const btcSpark = [92400, 95100, 97800, 96200, 99500, 101200, 103840];
  const ethSpark = [3540, 3620, 3710, 3680, 3750, 3840, 3812];
  const volSpark = [128, 135, 142, 138, 145, 139, 142.6];

  return (
    <div className="cc-pulse-bar-v2" role="region" aria-label="Kripto piyasa metrikleri">

      {/* BTC */}
      <div className="cc-pulse-cell">
        <div className="cc-pulse-cell-header">
          <div className="cc-pulse-cell-icon cc-pulse-cell-icon--btc">₿</div>
          <span className="cc-pulse-label">BTC</span>
        </div>
        <span className="cc-pulse-value cc-pulse-value--btc">${fmt(pulse.btc.price)}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.btc.change24h) }}>
          {signed(pulse.btc.change24h)}
        </span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={btcSpark} trend="up" height={28} className="w-full" />
        </div>
      </div>

      {/* ETH */}
      <div className="cc-pulse-cell">
        <div className="cc-pulse-cell-header">
          <div className="cc-pulse-cell-icon cc-pulse-cell-icon--eth">Ξ</div>
          <span className="cc-pulse-label">ETH</span>
        </div>
        <span className="cc-pulse-value">${fmt(pulse.eth.price)}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.eth.change24h) }}>
          {signed(pulse.eth.change24h)}
        </span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={ethSpark} trend="up" height={28} className="w-full" />
        </div>
      </div>

      {/* BTC Dominance */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">BTC Dominans</span>
        <span className="cc-pulse-value cc-pulse-value--btcd">{pulse.btcDominance}</span>
        <span className="cc-pulse-change" style={{ color: "var(--cc-teal)", fontSize: 11 }}>
          ETH/BTC {pulse.ethBtcRatio}
        </span>
      </div>

      {/* Total Market Cap */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">Toplam Piyasa Değeri</span>
        <span className="cc-pulse-value">{pulse.totalMarketCap}</span>
        <span className="cc-pulse-change" style={{ color: changeColor(pulse.totalMarketCapChange24h) }}>
          {signed(pulse.totalMarketCapChange24h)}
        </span>
      </div>

      {/* 24h Volume */}
      <div className="cc-pulse-cell">
        <span className="cc-pulse-label">24s Hacim</span>
        <span className="cc-pulse-value">{pulse.volume24h}</span>
        <div className="cc-pulse-sparkline">
          <MiniSparkline series={volSpark} trend="up" height={28} className="w-full" />
        </div>
      </div>

      {/* Fear & Greed */}
      <div className="cc-pulse-cell">
        <FearGreedGauge value={pulse.fearGreed.value} />
      </div>

      {/* Altcoin Season */}
      <div className="cc-pulse-cell">
        <AltcoinProgress index={pulse.altcoinSeasonIndex} />
      </div>

    </div>
  );
}
