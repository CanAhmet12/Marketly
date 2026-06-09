"use client";

import Link from "next/link";

import type { PortfolioHoldingRowEnrichment } from "@/features/markets/components/portfolio-page-view";
import { fmtPortfolioPct } from "@/features/markets/lib/portfolio-format";
import { portfolioCategoryClass } from "@/features/markets/lib/portfolio-cat-colors";
import type { PortfolioIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  holdings: PortfolioIntelligenceBundle["holdings"];
  holdingEnrichment: Record<string, PortfolioHoldingRowEnrichment>;
  valueColumnLabel?: "Fiyat" | "Değer";
};

function changeClass(v: number): string {
  return v >= 0 ? "pf-pnl-val--up" : "pf-pnl-val--down";
}

export function PortfolioHoldingsTable({
  holdings,
  holdingEnrichment,
  valueColumnLabel = "Fiyat",
}: Props) {
  return (
    <div className="pf-block" data-pf-block-zone="holdings">
      <div className="pf-block-header">
        <div className="pf-block-title">
          <span className="pf-block-stripe" />
          Pozisyonlar
        </div>
      </div>
      <div className="pf-holdings pf-holdings--spaced">
        <table className="pf-holdings-table">
          <thead>
            <tr>
              <th>Varlık</th>
              <th>Kategori</th>
              <th>Ağırlık</th>
              <th className="right">{valueColumnLabel}</th>
              <th className="right">P&L %</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const enrich = holdingEnrichment[h.symbol] ?? {
                priceLabel: "—",
                pnlPct: 0,
                categoryKey: h.category,
              };
              const catCls = portfolioCategoryClass("pf-weight-fill", h.category);
              return (
                <tr key={h.symbol}>
                  <td>
                    <Link href={h.href} className="pf-holding-link">
                      <div className="pf-holding-name">{h.symbol}</div>
                      <div className="pf-holding-fullname">{h.name}</div>
                    </Link>
                  </td>
                  <td>
                    <span className={cn("pf-cat-badge", `pf-cat-badge--${h.category}`)}>{h.category}</span>
                  </td>
                  <td>
                    <div className="pf-weight-cell">
                      <div className="pf-weight-row">
                        <span className="pf-weight-pct">%{h.weightPct}</span>
                        <div className="pf-weight-bar">
                          <div
                            className={cn("pf-weight-fill", catCls)}
                            style={{ width: `${Math.min(100, h.weightPct * 1.5)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="pf-price-val">{enrich.priceLabel}</span>
                  </td>
                  <td>
                    <span className={cn("pf-pnl-val", changeClass(enrich.pnlPct))}>
                      {fmtPortfolioPct(enrich.pnlPct)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
