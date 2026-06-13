"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { MarketsSearchBar } from "@/features/markets/components/markets-search-bar";
import { trendingFromAssets } from "@/features/markets/components/markets-filter-chips";
import { useMarketsSearch } from "@/features/markets/hooks/use-markets-search";
import type { MarketAssetView } from "@/features/markets/types";

const ECOSYSTEM_LINKS = [
  { href: "/signals", label: "Sinyaller" },
  { href: "/watchlist", label: "İzleme" },
  { href: "/economic-calendar", label: "Makro Takvim" },
  { href: "/market-news", label: "Haberler" },
  { href: "/portfolio", label: "Portföy" },
] as const;

type Props = { assets: MarketAssetView[] };

export function NasdaqCategoryToolbar({ assets }: Props) {
  const router = useRouter();
  const search = useMarketsSearch();
  const trending = useMemo(() => trendingFromAssets(assets, 8), [assets]);

  return (
    <div className="cc-toolbar nq-toolbar cc-section" role="region" aria-label="NASDAQ araç çubuğu">
      <div className="cc-toolbar-search">
        <MarketsSearchBar
          assets={assets}
          trending={trending}
          query={search.query}
          setQuery={search.setQuery}
          open={search.open}
          setOpen={search.setOpen}
          recent={search.recent}
          pushRecent={search.pushRecent}
          clearRecent={search.clearRecent}
          highlight={search.highlight}
          setHighlight={search.setHighlight}
          resetHighlight={search.resetHighlight}
          onSelectAsset={(asset) => {
            search.pushRecent(asset.symbol);
            router.push(`/markets/${encodeURIComponent(asset.symbol)}`);
          }}
        />
      </div>

      <nav className="cc-ecosystem-nav nq-ecosystem-nav" aria-label="NASDAQ ekosistem bağlantıları">
        {ECOSYSTEM_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="cc-ecosystem-nav__link nq-ecosystem-nav__link">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
