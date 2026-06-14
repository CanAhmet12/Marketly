"use client";

import { NoResultsState } from "@/components/states";

type Props = {
  query?: string;
  suggestion?: string;
  compact?: boolean;
};

export function SearchNoResults({ query, suggestion, compact = true }: Props) {
  return (
    <div className="srch-empty">
      <NoResultsState query={query} suggestion={suggestion} compact={compact} exploreHref="/discover" exploreLabel="Keşfet" />
    </div>
  );
}
