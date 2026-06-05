"use client";

import Link from "next/link";

import type { LiveRecommendationBundle } from "@/features/personalization/lib/build-live-recommendations";

type Props = {
  bundle: LiveRecommendationBundle;
  variant?: "forYou" | "community" | "both";
};

function ItemList({ items }: { items: LiveRecommendationBundle["forYou"] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="group flex min-h-10 flex-col justify-center rounded-lg px-2.5 py-2 outline-none transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]"
          >
            <span className="truncate text-[14px] font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
              {item.label}
            </span>
            <span className="truncate text-[12px] font-medium text-[var(--color-meta)]">{item.sub}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomeLivePersonalizationRail({ bundle, variant = "both" }: Props) {
  return (
    <div className="space-y-3">
      {variant === "forYou" || variant === "both" ? (
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-text-secondary)]">{bundle.headline}</p>
          <p className="mt-1 text-[12px] font-medium leading-snug text-[var(--color-meta)]">{bundle.subline}</p>
          <ItemList items={bundle.forYou} />
        </div>
      ) : null}
      {variant === "community" || variant === "both" ? (
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Toplulukta öne çıkanlar</p>
          <ItemList items={bundle.community} />
        </div>
      ) : null}
    </div>
  );
}
