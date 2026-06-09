"use client";

import { fmtPortfolioMoney, type PortfolioCurrency } from "@/features/markets/lib/portfolio-format";
import { portfolioCategoryClass } from "@/features/markets/lib/portfolio-cat-colors";
import type { PortfolioIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  holdings: PortfolioIntelligenceBundle["holdings"];
  totalValue: number;
  currency: PortfolioCurrency;
};

function fmtDonutCenter(totalValue: number, currency: PortfolioCurrency): string {
  const abs = Math.abs(totalValue);
  if (currency === "TRY") {
    if (abs >= 1_000_000) return `₺${(totalValue / 1_000_000).toFixed(1)}M`;
    if (abs >= 1000) return `₺${(totalValue / 1000).toFixed(1)}K`;
    return fmtPortfolioMoney(totalValue, currency);
  }
  if (abs >= 1_000_000) return `$${(totalValue / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `$${(totalValue / 1000).toFixed(1)}K`;
  return fmtPortfolioMoney(totalValue, currency);
}

export function PortfolioAllocationDonut({ holdings, totalValue, currency }: Props) {
  const cx = 90;
  const cy = 90;
  const outerR = 78;
  const innerR = 52;
  const totalW = holdings.reduce((s, h) => s + h.weightPct, 0) || 100;

  function polar(r: number, deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(startDeg: number, endDeg: number): string {
    const os = polar(outerR, startDeg);
    const oe = polar(outerR, endDeg);
    const is = polar(innerR, endDeg);
    const ie = polar(innerR, startDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${os.x.toFixed(2)} ${os.y.toFixed(2)}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)}`,
      `L ${is.x.toFixed(2)} ${is.y.toFixed(2)}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${ie.x.toFixed(2)} ${ie.y.toFixed(2)}`,
      "Z",
    ].join(" ");
  }

  const arcs: { path: string; symbol: string; category: string }[] = [];
  let start = 0;
  for (const h of holdings) {
    const sweep = (h.weightPct / totalW) * 360;
    arcs.push({
      path: arcPath(start, start + sweep - 0.5),
      symbol: h.symbol,
      category: h.category,
    });
    start += sweep;
  }

  return (
    <div className="pf-block" data-pf-block-zone="allocation">
      <div className="pf-block-header">
        <div className="pf-block-title">
          <span className="pf-block-stripe" />
          Dağılım
        </div>
      </div>
      <div className="pf-donut-wrap">
        <svg className="pf-donut-svg" viewBox="0 0 180 180" width={180} height={180} aria-label="Portföy dağılımı">
          {arcs.map((arc) => (
            <path
              key={arc.symbol}
              d={arc.path}
              className={cn("pf-donut-segment", portfolioCategoryClass("pf-donut-segment", arc.category))}
              opacity={0.85}
            />
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" className="pf-donut-center-label">
            TOPLAM
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="pf-donut-center-value">
            {fmtDonutCenter(totalValue, currency)}
          </text>
        </svg>
        <div className="pf-donut-legend">
          {holdings.map((h) => (
            <div key={h.symbol} className="pf-legend-row">
              <div className={cn("pf-legend-dot", portfolioCategoryClass("pf-legend-dot", h.category))} />
              <span className="pf-legend-label">{h.symbol}</span>
              <span className="pf-legend-pct">%{h.weightPct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
