"use client";

import Link from "next/link";
import { memo } from "react";

import type { MarketAssetView } from "@/features/markets/types";
import { cn } from "@/lib/cn";

const CATEGORY_LABEL: Record<string, string> = {
  crypto: "Kripto",
  stocks: "Hisse",
  forex: "Döviz",
  commodity: "Emtia",
  index: "Endeks",
};

function formatFeedAssetPrice(n: number): string {
  if (n >= 1000) {
    return n.toLocaleString("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }
  if (n >= 1) {
    return n.toLocaleString("tr-TR", { maximumFractionDigits: 4 });
  }
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 6 });
}

function MiniSparkline({ values, trend }: { values: number[]; trend: MarketAssetView["trend"] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 48;
  const h = 16;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - 2 - ((v - min) / range) * (h - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      className={cn(
        "hv-ref-article__market-strip-spark",
        trend === "up" && "hv-ref-article__market-strip-spark--up",
        trend === "down" && "hv-ref-article__market-strip-spark--down",
      )}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
    >
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  symbol: string;
  asset: MarketAssetView | null;
};

function PostAssetMarketStripInner({ symbol, asset }: Props) {
  const clean = symbol.replace(/^#/, "").trim().toUpperCase();
  const href = asset ? `/markets/${encodeURIComponent(clean)}` : `/results?q=${encodeURIComponent(clean)}`;

  if (!asset) {
    return (
      <Link href={href} className="hv-ref-article__market-strip hv-ref-article__market-strip--static">
        <span className="hv-ref-article__market-strip-sym">#{clean}</span>
        <span className="hv-ref-article__market-strip-label">İlgili piyasa</span>
        <span className="hv-ref-article__market-strip-chevron" aria-hidden>
          →
        </span>
      </Link>
    );
  }

  const chg =
    (asset.change_percent >= 0 ? "+" : "") + asset.change_percent.toFixed(2).replace(".", ",") + "%";
  const catLabel = CATEGORY_LABEL[asset.category];

  return (
    <Link
      href={href}
      className={cn(
        "hv-ref-article__market-strip",
        asset.trend === "up" && "hv-ref-article__market-strip--up",
        asset.trend === "down" && "hv-ref-article__market-strip--down",
      )}
      aria-label={`${clean} canlı fiyat ${formatFeedAssetPrice(asset.price)}, ${chg}`}
    >
      <span className="hv-ref-article__market-strip-symbol">
        <span className="hv-ref-article__market-strip-dot" data-trend={asset.trend} aria-hidden />
        <span className="hv-ref-article__market-strip-sym">{clean}</span>
        {catLabel ? <span className="hv-ref-article__market-strip-cat">{catLabel}</span> : null}
      </span>

      <span className="hv-ref-article__market-strip-quote">
        <MiniSparkline values={asset.sparkline} trend={asset.trend} />
        <span className="hv-ref-article__market-strip-price">{formatFeedAssetPrice(asset.price)}</span>
      </span>

      <span className="hv-ref-article__market-strip-chg">{chg}</span>
    </Link>
  );
}

export const PostAssetMarketStrip = memo(PostAssetMarketStripInner);
