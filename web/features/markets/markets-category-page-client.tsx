"use client";

import type { MarketsCategorySlug } from "@/features/markets/markets-category-slugs";

type Props = {
  categorySlug: MarketsCategorySlug;
};

const CATEGORY_PLACEHOLDER: Record<MarketsCategorySlug, string> = {
  crypto: "Kripto kategorisi hazırlanıyor.",
  bist: "BIST kategorisi hazırlanıyor.",
  forex: "Forex kategorisi hazırlanıyor.",
  commodities: "Emtia kategorisi hazırlanıyor.",
  nasdaq: "NASDAQ kategorisi hazırlanıyor.",
};

export function MarketsCategoryPageClient({ categorySlug }: Props) {
  return (
    <div className="ms-page-wrapper ms-container-markets min-w-0 py-16 text-center">
      <p className="text-[14px] font-medium text-[var(--color-text-secondary)]">{CATEGORY_PLACEHOLDER[categorySlug]}</p>
    </div>
  );
}
