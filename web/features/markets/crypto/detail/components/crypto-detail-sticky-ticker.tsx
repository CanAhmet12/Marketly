"use client";

import { useEffect, useState } from "react";

import { MarketSymbolIcon } from "@/features/markets/components/market-symbol-icon";
import { formatCryptoDetailPrice } from "@/features/markets/crypto/detail/lib/crypto-detail-hero-utils";
import { formatSignedChangePercent } from "@/features/markets/lib/market-display";
import { marketVtStyle } from "@/lib/navigation/view-transition";
import { cn } from "@/lib/cn";

type Props = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sentinelId: string;
  isLive?: boolean;
};

/** IntersectionObserver rootMargin yalnızca px/% kabul eder — calc()/var() geçersiz. */
function resolveChromeTopRootMargin(): string {
  const spacer = document.querySelector<HTMLElement>("[data-chrome-top-spacer]");
  if (spacer) {
    const px = Math.max(0, Math.round(spacer.getBoundingClientRect().height));
    return `-${px}px 0px 0px 0px`;
  }

  const topbarHeight = getComputedStyle(document.documentElement).getPropertyValue("--topbar-height").trim();
  if (/^[\d.]+rem$/.test(topbarHeight)) {
    const rem = parseFloat(topbarHeight);
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return `-${Math.round(rem * rootPx)}px 0px 0px 0px`;
  }
  if (/^[\d.]+px$/.test(topbarHeight)) {
    return `-${topbarHeight} 0px 0px 0px`;
  }

  return "-56px 0px 0px 0px";
}

export function CryptoDetailStickyTicker({
  symbol,
  name,
  price,
  changePercent,
  sentinelId,
  isLive = false,
}: Props) {
  const [visible, setVisible] = useState(false);
  const isUp = changePercent >= 0;

  useEffect(() => {
    const node = document.getElementById(sentinelId);
    if (!node) return;

    let observer: IntersectionObserver | null = null;

    const attach = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        ([entry]) => {
          setVisible(!entry?.isIntersecting);
        },
        { root: null, threshold: 0, rootMargin: resolveChromeTopRootMargin() },
      );
      observer.observe(node);
    };

    attach();

    const spacer = document.querySelector("[data-chrome-top-spacer]");
    const ro =
      spacer && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => attach())
        : null;
    ro?.observe(spacer!);

    return () => {
      observer?.disconnect();
      ro?.disconnect();
    };
  }, [sentinelId]);

  return (
    <div
      className={cn("cd-sticky-ticker", visible && "cd-sticky-ticker--visible")}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
    >
      <div className="cd-sticky-ticker-shell">
        <div className="cd-sticky-ticker-inner ms-container-markets">
          <MarketSymbolIcon symbol={symbol} size={22} className="cd-sticky-ticker-logo" />
          <span className="cd-sticky-ticker-symbol" style={marketVtStyle(symbol, "symbol")}>
            {symbol}
          </span>
          <span className="cd-sticky-ticker-name">{name}</span>
          {isLive ? (
            <span className="cd-sticky-ticker-live">
              <span className="cd-sticky-ticker-live-dot" aria-hidden />
              CANLI
            </span>
          ) : null}
          <span className="cd-sticky-ticker-price" style={marketVtStyle(symbol, "price")}>
            ${formatCryptoDetailPrice(price)}
          </span>
          <span className={cn("cd-sticky-ticker-change", isUp ? "cc-up" : "cc-down")}>
            {formatSignedChangePercent(changePercent)}
            <span className="cd-sticky-ticker-window">24s</span>
          </span>
        </div>
      </div>
    </div>
  );
}
