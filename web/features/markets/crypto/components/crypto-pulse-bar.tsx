"use client";

import type { ReactNode } from "react";

import { MiniSparkline } from "@/features/markets/components/mini-sparkline";
import { MarketSymbolIcon } from "@/features/markets/components/market-symbol-icon";
import {
  sparkFromChange,
  trendFromSeries,
} from "@/features/markets/crypto/lib/crypto-sparkline-utils";
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

function changeClass(v: number) {
  if (v > 0) return "cc-up";
  if (v < 0) return "cc-down";
  return "cc-neutral";
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

function fearGreedLabel(v: number) {
  if (v <= 25) return "Aşırı Korku";
  if (v <= 45) return "Korku";
  if (v <= 55) return "Nötr";
  if (v <= 75) return "Açgözlülük";
  return "Aşırı Açgözlülük";
}

/** Düz sparkline'ları pulse bar'da okunur hale getir */
function exaggerateSpark(series: number[]): number[] {
  if (series.length < 2) return series;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const mid = (min + max) / 2;
  const span = max - min;
  const targetSpan = Math.max(span, Math.abs(mid) * 0.06, 0.4);
  if (span >= targetSpan * 0.85) return series;
  const scale = targetSpan / (span || 1);
  return series.map((v) => mid + (v - mid) * scale);
}

type PulseCellProps = {
  label: ReactNode;
  value: ReactNode;
  valueClass?: string;
  sub?: ReactNode;
  subClass?: string;
  foot?: ReactNode;
  className?: string;
  hideSub?: boolean;
  layout?: "default" | "gauge" | "meter";
};

function PulseCell({
  label,
  value,
  valueClass,
  sub,
  subClass,
  foot,
  className,
  hideSub,
  layout = "default",
}: PulseCellProps) {
  const isGauge = layout === "gauge";
  const isMeter = layout === "meter";

  return (
    <div className={cn("cc-pulse-cell", isGauge && "cc-pulse-cell--gauge", isMeter && "cc-pulse-cell--meter", className)}>
      <div className="cc-pulse-cell__top">{label}</div>

      {isGauge || isMeter ? (
        <div className="cc-pulse-cell__main">{value}</div>
      ) : (
        <div className="cc-pulse-cell__body">
          <div className={cn("cc-pulse-cell__value", valueClass)}>{value}</div>
          {!hideSub ? (
            <div className={cn("cc-pulse-cell__sub", subClass, !sub && "cc-pulse-cell__sub--empty")}>
              {sub ?? "\u00A0"}
            </div>
          ) : null}
        </div>
      )}

      {!isGauge ? (
        <div className="cc-pulse-cell__foot">{foot ?? <span className="cc-pulse-foot-spacer" aria-hidden />}</div>
      ) : null}
    </div>
  );
}

function SymbolLabel({ symbol, text }: { symbol: "BTC" | "ETH"; text: string }) {
  return (
    <div className="cc-pulse-cell-header">
      <MarketSymbolIcon symbol={symbol} size={18} />
      <span className="cc-pulse-label">{text}</span>
    </div>
  );
}

function PulseSpark({ series, trend }: { series: number[]; trend: "up" | "down" | "flat" }) {
  const boosted = exaggerateSpark(series);
  return (
    <div className="cc-pulse-spark-wrap">
      <MiniSparkline series={boosted} trend={trend} height={34} className="cc-pulse-spark" />
    </div>
  );
}

function FearGreedGauge({ value }: { value: number }) {
  const w = 54;
  const h = 32;
  const cx = w / 2;
  const cy = h - 1;
  const r = 24;
  const pct = Math.min(100, Math.max(0, value)) / 100;
  const startAngle = Math.PI;
  const endAngle = startAngle - pct * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = pct > 0.5 ? 1 : 0;
  const stroke = fearGreedStroke(value);
  const fgClass = fearGreedClass(value);

  return (
    <div className="cc-fg-gauge-inline">
      <div className="cc-fg-gauge-ring" aria-hidden>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="cc-fg-gauge-svg">
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="color-mix(in srgb, var(--cc-text) 14%, transparent)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {pct > 0 ? (
            <path
              d={`M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`}
              fill="none"
              stroke={stroke}
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : null}
          <circle cx={x2.toFixed(2)} cy={y2.toFixed(2)} r="3.5" fill={stroke} />
        </svg>
      </div>
      <div className="cc-fg-gauge-copy">
        <span className={cn("cc-fg-value", fgClass)}>{value}</span>
        <span className={cn("cc-fg-band", fgClass)}>{fearGreedLabel(value)}</span>
      </div>
    </div>
  );
}

function AltcoinMeter({ index }: { index: number }) {
  const isAlt = index >= 75;
  const isMixed = index >= 50;
  const tone = isAlt ? "cc-alt-tone--alt" : isMixed ? "cc-alt-tone--mix" : "cc-alt-tone--btc";
  const mode = isAlt ? "Alt Sezonu" : isMixed ? "Karma" : "BTC Sezonu";

  return (
    <div className="cc-alt-meter">
      <div className="cc-alt-meter-head">
        <span className={cn("cc-alt-big", tone)}>{index}</span>
        <span className="cc-alt-sub">/100</span>
        <span className={cn("cc-alt-mode", tone)}>{mode}</span>
      </div>
      <div className="cc-alt-bar-track">
        <div className={cn("cc-alt-bar-fill", tone)} style={{ width: `${index}%` }} />
      </div>
    </div>
  );
}

export function CryptoPulseBar({ pulse }: Props) {
  const btcSpark = pulse.btc.sparkline?.length
    ? pulse.btc.sparkline
    : sparkFromChange(pulse.btc.change24h);
  const ethSpark = pulse.eth.sparkline?.length
    ? pulse.eth.sparkline
    : sparkFromChange(pulse.eth.change24h);
  const volSpark = pulse.volumeSparkline?.length
    ? pulse.volumeSparkline
    : sparkFromChange(pulse.totalMarketCapChange24h);
  const mcapSpark = sparkFromChange(pulse.totalMarketCapChange24h, 9);

  return (
    <div className="cc-pulse-bar-v2" role="region" aria-label="Kripto piyasa metrikleri">
      <PulseCell
        label={<SymbolLabel symbol="BTC" text="BTC" />}
        value={`$${fmt(pulse.btc.price)}`}
        valueClass="cc-pulse-value--btc"
        sub={<span className={cn("cc-pulse-change", changeClass(pulse.btc.change24h))}>{signed(pulse.btc.change24h)}</span>}
        foot={<PulseSpark series={btcSpark} trend={trendFromSeries(btcSpark)} />}
      />

      <PulseCell
        label={<SymbolLabel symbol="ETH" text="ETH" />}
        value={`$${fmt(pulse.eth.price)}`}
        valueClass="cc-pulse-value--eth"
        sub={<span className={cn("cc-pulse-change", changeClass(pulse.eth.change24h))}>{signed(pulse.eth.change24h)}</span>}
        foot={<PulseSpark series={ethSpark} trend={trendFromSeries(ethSpark)} />}
      />

      <PulseCell
        label={<span className="cc-pulse-label">BTC Dominans</span>}
        value={pulse.btcDominance}
        valueClass="cc-pulse-value--muted"
        sub={
          <span className="cc-pulse-change cc-pulse-change--sub cc-neutral">
            ETH/BTC {pulse.ethBtcRatio}
          </span>
        }
        hideSub={pulse.ethBtcRatio === "—"}
      />

      <PulseCell
        label={<span className="cc-pulse-label">Toplam Piyasa Değeri</span>}
        value={pulse.totalMarketCap}
        valueClass="cc-pulse-value--muted"
        sub={
          <span className={cn("cc-pulse-change", changeClass(pulse.totalMarketCapChange24h))}>
            {signed(pulse.totalMarketCapChange24h)}
          </span>
        }
        foot={<PulseSpark series={mcapSpark} trend={trendFromSeries(mcapSpark)} />}
      />

      <PulseCell
        label={<span className="cc-pulse-label">24s Hacim</span>}
        value={pulse.volume24h}
        sub={<span className="cc-pulse-change cc-neutral">24s</span>}
        foot={<PulseSpark series={volSpark} trend={trendFromSeries(volSpark)} />}
      />

      <PulseCell
        label={<span className="cc-pulse-label">Korku / Açgözlülük</span>}
        value={<FearGreedGauge value={pulse.fearGreed.value} />}
        layout="gauge"
      />

      <PulseCell
        label={<span className="cc-pulse-label">Altcoin Sezonu</span>}
        value={<AltcoinMeter index={pulse.altcoinSeasonIndex} />}
        layout="meter"
        className="cc-pulse-cell--last"
      />
    </div>
  );
}
