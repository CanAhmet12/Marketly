"use client";

import { SearchPageShell } from "@/features/search/components/search-page-shell";
import { SearchSkeleton } from "@/features/search/components/search-skeleton";

/** `/results` SSR Suspense fallback — shell + skeleton hizalı. */
export function SearchResultsFallback() {
  return (
    <SearchPageShell>
      <SearchSkeleton />
    </SearchPageShell>
  );
}
