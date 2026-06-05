import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { BistCategoryPageClient } from "@/features/markets/bist/bist-category-page-client";
import { CommoditiesCategoryPageClient } from "@/features/markets/commodities/commodities-category-page-client";
import { NasdaqCategoryPageClient } from "@/features/markets/nasdaq/nasdaq-category-page-client";
import { ForexCategoryPageClient } from "@/features/markets/forex/forex-category-page-client";
import { CryptoCategoryPageClient } from "@/features/markets/crypto/crypto-category-page-client";
import { MarketsCategoryPageClient } from "@/features/markets/markets-category-page-client";
import { MarketsCategoryPageSkeleton } from "@/features/markets/components/markets-states";
import { isValidMarketsCategorySlug } from "@/features/markets/markets-category-slugs";

type Props = {
  params: Promise<{ category: string }>;
};

export default async function MarketsCategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isValidMarketsCategorySlug(category)) notFound();

  const client =
    category === "crypto" ? (
      <CryptoCategoryPageClient />
    ) : category === "bist" ? (
      <BistCategoryPageClient />
    ) : category === "forex" ? (
      <ForexCategoryPageClient />
    ) : category === "commodities" ? (
      <CommoditiesCategoryPageClient />
    ) : category === "nasdaq" ? (
      <NasdaqCategoryPageClient />
    ) : (
      <MarketsCategoryPageClient categorySlug={category} />
    );

  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <MarketsCategoryPageSkeleton />
        </DelayedSkeleton>
      }
    >
      {client}
    </Suspense>
  );
}
