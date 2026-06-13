"use client";

import Link from "next/link";
import { useMemo, type CSSProperties } from "react";

import { MarketSymbolIcon } from "@/features/markets/components/market-symbol-icon";
import {
  mapCommodityAssetsToTickers,
  type CommodityTickerItem,
} from "@/features/markets/commodities/lib/map-commodity-tickers";
import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

type Props = {
  assets: MarketAssetView[];
};

function TickerRow({
  items,
  ariaHidden = false,
  keyPrefix = "",
}: {
  items: CommodityTickerItem[];
  ariaHidden?: boolean;
  keyPrefix?: string;
}) {
  return (
    <div className="cc-ticker-row cm-ticker-row" aria-hidden={ariaHidden || undefined}>
      {items.map((t, i) => (
        <Link
          key={`${keyPrefix}${t.id}`}
          href={t.href}
          className="cc-ticker-item cm-ticker-item"
          title={t.name}
          style={{ "--cc-ticker-stagger": `${(i % 8) * 0.28}s` } as CSSProperties}
          tabIndex={ariaHidden ? -1 : undefined}
        >
          <MarketSymbolIcon symbol={t.symbol} size={18} className="cc-ticker-item__icon" />
          <span className="cc-ticker-item__sym cm-ticker-item__label">{t.label}</span>
          <span className="cc-ticker-item__price">{t.price}</span>
          <span
            className={cn(
              "cc-ticker-item__chg",
              t.positive ? "cc-up cc-ticker-item__chg--up" : "cc-down cc-ticker-item__chg--down",
            )}
          >
            {t.change}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function CommoditiesTickerStrip({ assets }: Props) {
  const tickers = useMemo(() => mapCommodityAssetsToTickers(assets), [assets]);
  const marquee = tickers.length >= 3;
  const duration = Math.max(32, tickers.length * 4.5);

  if (tickers.length === 0) return null;

  return (
    <nav
      className="cc-ticker-strip cm-ticker-strip"
      aria-label="Emtia canlı ticker"
      data-marquee={marquee || undefined}
    >
      <div className="cc-ticker-live-badge cm-ticker-live-badge" aria-hidden>
        <span className="cc-ticker-live-dot cm-ticker-live-dot" />
        <span className="cc-ticker-live-text">Canlı</span>
      </div>

      <div className={cn("cc-ticker-marquee-wrap", marquee && "cc-ticker-marquee-wrap--active")}>
        {marquee ? (
          <div
            className="cc-ticker-track cc-ticker-track--live cm-ticker-track"
            style={{ "--cc-ticker-dur": `${duration}s` } as CSSProperties}
          >
            <TickerRow items={tickers} keyPrefix="a-" />
            <TickerRow items={tickers} ariaHidden keyPrefix="b-" />
          </div>
        ) : (
          <div className="cc-ticker-track cm-ticker-track">
            <TickerRow items={tickers} />
          </div>
        )}
      </div>
    </nav>
  );
}
