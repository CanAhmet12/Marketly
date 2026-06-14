"use client";

import Link from "next/link";
import { useMemo, type CSSProperties } from "react";

import {
  mapBistAssetsToTickers,
  type BistTickerItem,
} from "@/features/markets/bist/lib/map-bist-tickers";
import { normalizeBistSymbol } from "@/features/markets/bist/lib/bist-symbol-meta";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  assets: MarketAssetView[];
  activeSymbol: string;
};

function TickerRow({
  items,
  activeSymbol,
  ariaHidden = false,
  keyPrefix = "",
}: {
  items: BistTickerItem[];
  activeSymbol: string;
  ariaHidden?: boolean;
  keyPrefix?: string;
}) {
  const active = normalizeBistSymbol(activeSymbol);

  return (
    <div className="cdr-live-ticker__row" aria-hidden={ariaHidden || undefined}>
      {items.map((t) => {
        const sym = normalizeBistSymbol(t.symbol);
        const isActive = sym === active;
        return (
          <Link
            key={`${keyPrefix}${t.id}`}
            href={t.href}
            className={cn("cdr-live-ticker__item", isActive && "cdr-live-ticker__item--active")}
            title={t.name}
            aria-current={isActive ? "page" : undefined}
            tabIndex={ariaHidden ? -1 : undefined}
          >
            <span className="cdr-live-ticker__sym">{t.label}</span>
            <span className="cdr-live-ticker__price">{t.price}</span>
            <span className={cn("cdr-live-ticker__chg", t.positive ? "cdr-up" : "cdr-down")}>{t.change}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function BistDetailTickerStrip({ assets, activeSymbol }: Props) {
  const tickers = useMemo(() => mapBistAssetsToTickers(assets), [assets]);
  const marquee = tickers.length >= 3;
  const duration = Math.max(32, tickers.length * 4.2);

  if (tickers.length === 0) return null;

  return (
    <nav className="cdr-live-ticker" aria-label="BIST canlı piyasa şeridi" data-marquee={marquee || undefined}>
      <div className="cdr-live-ticker__badge cdr-live-pill cdr-live-pill--on" aria-hidden>
        <span className="cdr-live-pill__dot cdr-live-pill__dot--pulse" />
        <span className="cdr-live-pill__text">Canlı</span>
      </div>

      <div className={cn("cdr-live-ticker__marquee", marquee && "cdr-live-ticker__marquee--active")}>
        {marquee ? (
          <div
            className="cdr-live-ticker__track cdr-live-ticker__track--live"
            style={{ "--cdr-ticker-dur": `${duration}s` } as CSSProperties}
          >
            <TickerRow items={tickers} activeSymbol={activeSymbol} keyPrefix="a-" />
            <TickerRow items={tickers} activeSymbol={activeSymbol} ariaHidden keyPrefix="b-" />
          </div>
        ) : (
          <div className="cdr-live-ticker__track">
            <TickerRow items={tickers} activeSymbol={activeSymbol} />
          </div>
        )}
      </div>
    </nav>
  );
}
