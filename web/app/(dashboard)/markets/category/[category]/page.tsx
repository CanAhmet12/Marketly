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
import { BistCategoryPageSkeleton } from "@/features/markets/bist/components/bist-category-skeleton";
import { CommoditiesCategoryPageSkeleton } from "@/features/markets/commodities/components/commodities-category-skeleton";
import { NasdaqCategoryPageSkeleton } from "@/features/markets/nasdaq/components/nasdaq-category-skeleton";
import { ForexCategoryPageSkeleton } from "@/features/markets/forex/components/forex-category-skeleton";
import { isValidMarketsCategorySlug } from "@/features/markets/markets-category-slugs";

function CategoryRouteSkeleton({ category }: { category: string }) {
  if (category === "bist") {
    return (
      <div className="bist-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper py-8">
          <BistCategoryPageSkeleton />
        </div>
      </div>
    );
  }
  if (category === "nasdaq") {
    return (
      <div className="nasdaq-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper py-8">
          <NasdaqCategoryPageSkeleton />
        </div>
      </div>
    );
  }
  if (category === "commodities") {
    return (
      <div className="commodities-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper py-8">
          <CommoditiesCategoryPageSkeleton />
        </div>
      </div>
    );
  }
  if (category === "forex") {
    return (
      <div className="forex-canvas min-h-screen w-full overflow-x-hidden">
        <div className="ms-container-markets ms-page-wrapper py-8">
          <ForexCategoryPageSkeleton />
        </div>
      </div>
    );
  }
  return (
    <div className="ms-container-markets ms-page-wrapper py-8">
      <MarketsCategoryPageSkeleton />
    </div>
  );
}

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
          <CategoryRouteSkeleton category={category} />
        </DelayedSkeleton>
      }
    >
      {client}
    </Suspense>
  );
}
