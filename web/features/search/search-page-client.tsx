"use client";

import { useEffect } from "react";

import { AlertCallout } from "@/components/shared/alert-callout";
import { SearchFederatedRails } from "@/features/search/components/search-federated-rails";
import { SearchPageMast } from "@/features/search/components/search-page-mast";
import { SearchPageShell } from "@/features/search/components/search-page-shell";
import { SearchProgressBar } from "@/features/search/components/search-progress-bar";
import { SearchSkeleton } from "@/features/search/components/search-skeleton";
import { SearchCategoryToolbar } from "@/features/search/components/search-category-toolbar";
import { SearchTabPanel } from "@/features/search/components/search-tab-panel";
import { SearchZeroState } from "@/features/search/components/search-zero-state";
import { useRecentSearches } from "@/features/search/hooks/use-recent-searches";
import { useSearchQuery } from "@/features/search/hooks/use-search-query";
import { useSearchResults } from "@/features/search/hooks/use-search-results";
import { trackSearchQuery } from "@/features/personalization/tracking";

export function SearchPageClient() {
  const { rawQ, tab, canSearch, minLen, setTab } = useSearchQuery();
  const { pushRecent } = useRecentSearches();
  const { query, bundle, split, counts, configOk, configError, discussions, communities, creatorRooms } =
    useSearchResults(rawQ, canSearch);

  useEffect(() => {
    document.documentElement.setAttribute("data-search-page", "true");
    return () => {
      document.documentElement.removeAttribute("data-search-page");
    };
  }, []);

  useEffect(() => {
    if (!canSearch) return;
    trackSearchQuery(rawQ, "search_results");
    pushRecent(rawQ);
  }, [canSearch, rawQ, pushRecent]);

  useEffect(() => {
    if (!canSearch || !query.isSuccess) return;
    if (tab !== "all" && counts[tab] === 0) {
      setTab("all");
    }
  }, [canSearch, query.isSuccess, tab, counts, setTab]);

  const effectiveTab = tab === "all" || counts[tab] > 0 ? tab : "all";

  if (!configOk && !canSearch) {
    return (
      <SearchPageShell>
        <SearchPageMast mode="idle" />
        <AlertCallout tone="danger" title="Arama kullanılamıyor">
          {configError ?? "Supabase yapılandırması eksik."}
        </AlertCallout>
      </SearchPageShell>
    );
  }

  if (!rawQ) {
    return (
      <SearchPageShell>
        <SearchZeroState />
      </SearchPageShell>
    );
  }

  if (rawQ.length < minLen) {
    return (
      <SearchPageShell>
        <SearchPageMast mode="hint" query={rawQ} hint={`En az ${minLen} karakter girin.`} />
      </SearchPageShell>
    );
  }

  const showSkeleton = query.isPending && !bundle;

  return (
    <SearchPageShell>
      <SearchPageMast
        mode="results"
        query={rawQ}
        total={counts.all}
        isFetching={query.isFetching && query.isSuccess}
      />

      <div className="srch-chrome">
        <SearchProgressBar active={query.isFetching} />
        <SearchCategoryToolbar tab={effectiveTab} counts={counts} onTabChange={setTab} />
      </div>

      <div
        id="search-results-panel"
        className="srch-body"
        role="tabpanel"
        aria-labelledby={`search-tab-${effectiveTab}`}
        aria-label="Arama sonuçları"
      >
        {showSkeleton ? <SearchSkeleton /> : null}

        {query.isError ? (
          <AlertCallout
            tone="danger"
            title="Arama başarısız"
            primaryAction={{ label: "Tekrar dene", onClick: () => void query.refetch() }}
          >
            {query.error instanceof Error ? query.error.message : "Bilinmeyen hata"}
          </AlertCallout>
        ) : null}

        {query.isSuccess && bundle ? (
          effectiveTab === "all" ? (
            <SearchFederatedRails
              query={rawQ}
              bundle={bundle}
              split={split}
              discussions={discussions}
              communities={communities}
              creatorRooms={creatorRooms}
              onTabChange={setTab}
            />
          ) : (
            <SearchTabPanel
              tab={effectiveTab}
              query={rawQ}
              bundle={bundle}
              split={split}
              discussions={discussions}
              communities={communities}
              creatorRooms={creatorRooms}
            />
          )
        ) : null}
      </div>
    </SearchPageShell>
  );
}
