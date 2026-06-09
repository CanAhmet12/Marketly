"use client";

import { useCallback, useState } from "react";

import type { PortfolioLiveStats } from "@/features/markets/lib/live-richness/build-portfolio-intelligence-from-live";
import { buildPortfolioShareText } from "@/features/markets/lib/build-portfolio-share-text";
import { fmtPortfolioMoney, fmtPortfolioPct } from "@/features/markets/lib/portfolio-format";
import type { PortfolioIntelligenceBundle } from "@/features/markets/types/personal-market-intelligence";
import { cn } from "@/lib/cn";

type Props = {
  stats: PortfolioLiveStats;
  holdings: PortfolioIntelligenceBundle["holdings"];
  compact?: boolean;
};

export function PortfolioShareCard({ stats, holdings, compact = false }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "error">("idle");
  const cur = stats.primaryCurrency;
  const isUp = stats.totalPnL >= 0;
  const top = [...holdings].sort((a, b) => b.weightPct - a.weightPct).slice(0, 4);

  const handleShare = useCallback(async () => {
    const text = buildPortfolioShareText(stats, holdings);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Portföy Performansım", text });
        setStatus("shared");
      } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setStatus("copied");
      } else {
        setStatus("error");
        return;
      }
      window.setTimeout(() => setStatus("idle"), 2400);
    } catch {
      setStatus("idle");
    }
  }, [stats, holdings]);

  if (compact) {
    return (
      <button type="button" className="pf-header-btn pf-header-btn--share" onClick={handleShare}>
        {status === "copied" ? "Kopyalandı" : status === "shared" ? "Paylaşıldı" : "Paylaş"}
      </button>
    );
  }

  return (
    <div className={cn("pf-share-card", isUp ? "pf-share-card--up" : "pf-share-card--down")}>
      <div className="pf-share-card__top">
        <span className="pf-share-card__tag">Marketly Portföy</span>
        <button type="button" className="pf-share-card__btn" onClick={handleShare}>
          {status === "copied" ? "Panoya kopyalandı" : status === "shared" ? "Paylaşıldı" : "Paylaş"}
        </button>
      </div>
      <div className="pf-share-card__value">{fmtPortfolioMoney(stats.totalValue, cur)}</div>
      <div className={cn("pf-share-card__pnl", isUp ? "pf-stat-change--up" : "pf-stat-change--down")}>
        {isUp ? "+" : ""}
        {fmtPortfolioMoney(stats.totalPnL, cur)} ({fmtPortfolioPct(stats.totalPnLPct)})
      </div>
      <ul className="pf-share-card__holdings">
        {top.map((h) => (
          <li key={h.symbol}>
            <span>{h.symbol}</span>
            <span>%{h.weightPct}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
