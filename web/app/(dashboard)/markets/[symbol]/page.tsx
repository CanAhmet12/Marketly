import type { Metadata } from "next";
import { Suspense } from "react";

import { BistSymbolPageClient } from "@/features/markets/bist/bist-symbol-page-client";
import {
  bistAccentFor,
  bistPageClass,
  isBistSymbol,
  normalizeBistSymbol,
} from "@/features/markets/bist/lib/bist-symbol-meta";
import { bistCanonicalPath, bistPageSeo } from "@/features/markets/bist/lib/bist-page-seo";
import { CommoditiesSymbolPageClient } from "@/features/markets/commodities/commodities-symbol-page-client";
import { ForexSymbolPageClient } from "@/features/markets/forex/forex-symbol-page-client";
import { AssetDetailSkeleton } from "@/features/markets/components/markets-states";
import { CryptoSymbolPageClient } from "@/features/markets/crypto/crypto-symbol-page-client";
import { NasdaqSymbolPageClient } from "@/features/markets/nasdaq/nasdaq-symbol-page-client";
import { forexCanonicalPath, forexPageSeo } from "@/features/markets/forex/lib/forex-page-seo";
import { nasdaqPageSeo } from "@/features/markets/nasdaq/lib/nasdaq-page-seo";
import { DetailPageSkeleton } from "@/features/markets/symbol-detail-core/components/detail-page-skeleton";
import { DetailShell as CryptoDetailShell } from "@/features/markets/crypto/symbol-detail/components/detail-shell";
import { DetailShell as CoreDetailShell } from "@/features/markets/symbol-detail-core/components/detail-shell";
import { detailCategoryAccent } from "@/features/markets/symbol-detail-core/lib/category-meta";
import { MarketSymbolPageClient } from "@/features/markets/market-symbol-page-client";
import { inferMarketAssetCategory } from "@/lib/market-category";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

type Props = {
  params: Promise<{ symbol: string }>;
};

function decodeSymbolParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = await params;
  const decoded = decodeSymbolParam(symbol);
  const category = inferMarketAssetCategory(decoded);

  if (isBistSymbol(decoded)) {
    const seo = bistPageSeo(decoded);
    const path = bistCanonicalPath(decoded);

    return {
      ...siteCanonical(path),
      title: seo.title,
      description: seo.description,
      openGraph: {
        ...OG_SITE_DEFAULTS,
        title: seo.title,
        description: seo.description,
        type: "website",
      },
    };
  }

  if (category === "stocks" || category === "index") {
    const seo = nasdaqPageSeo(decoded);
    const path = `/markets/${encodeURIComponent(decoded.trim().toUpperCase())}`;

    return {
      ...siteCanonical(path),
      title: seo.title,
      description: seo.description,
      openGraph: {
        ...OG_SITE_DEFAULTS,
        title: seo.title,
        description: seo.description,
        type: "website",
      },
    };
  }

  if (category === "forex") {
    const seo = forexPageSeo(decoded);
    const path = forexCanonicalPath(decoded);

    return {
      ...siteCanonical(path),
      title: seo.title,
      description: seo.description,
      openGraph: {
        ...OG_SITE_DEFAULTS,
        title: seo.title,
        description: seo.description,
        type: "website",
      },
    };
  }

  const sym = decoded.trim().toUpperCase() || "Piyasa";
  return {
    title: `${sym} · Piyasalar`,
    description: "Marketly piyasa detay sayfası.",
  };
}

export default async function MarketSymbolPage({ params }: Props) {
  const { symbol } = await params;
  const decoded = decodeSymbolParam(symbol);
  const category = inferMarketAssetCategory(decoded);

  if (category === "crypto") {
    return (
      <Suspense
        fallback={
          <CryptoDetailShell symbol={decoded.trim().toUpperCase() || "BTC"}>
            <DetailPageSkeleton />
          </CryptoDetailShell>
        }
      >
        <CryptoSymbolPageClient />
      </Suspense>
    );
  }

  if (category === "commodity") {
    return (
      <Suspense
        fallback={
          <CoreDetailShell accent={detailCategoryAccent("commodity")} className="cmr-page--commodity">
            <DetailPageSkeleton />
          </CoreDetailShell>
        }
      >
        <CommoditiesSymbolPageClient />
      </Suspense>
    );
  }

  if (isBistSymbol(decoded)) {
    const sym = normalizeBistSymbol(decoded) || "THYAO";
    const accent = bistAccentFor(sym);
    const pageClass = bistPageClass(sym);
    return (
      <Suspense
        fallback={
          <CoreDetailShell accent={accent} className={pageClass}>
            <DetailPageSkeleton />
          </CoreDetailShell>
        }
      >
        <BistSymbolPageClient />
      </Suspense>
    );
  }

  if (category === "stocks" || category === "index") {
    const accent = detailCategoryAccent(category);
    const pageClass = category === "index" ? "nqx-page--index" : "nqx-page--stock";
    return (
      <Suspense
        fallback={
          <CoreDetailShell accent={accent} className={pageClass}>
            <DetailPageSkeleton />
          </CoreDetailShell>
        }
      >
        <NasdaqSymbolPageClient />
      </Suspense>
    );
  }

  if (category === "forex") {
    const accent = detailCategoryAccent("forex");
    return (
      <Suspense
        fallback={
          <CoreDetailShell accent={accent} className="fx-page--forex">
            <DetailPageSkeleton />
          </CoreDetailShell>
        }
      >
        <ForexSymbolPageClient />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<AssetDetailSkeleton />}>
      <MarketSymbolPageClient />
    </Suspense>
  );
}
