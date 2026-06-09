"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { SavedIntelStrip } from "@/features/saved/components/saved-intel-strip";
import { SavedList } from "@/features/saved/components/saved-list";
import { SavedNavRail } from "@/features/saved/components/saved-nav-rail";
import { SavedPageHeader } from "@/features/saved/components/saved-page-header";
import { SavedPanelToolbar } from "@/features/saved/components/saved-panel-toolbar";
import { SavedQuickLinks } from "@/features/saved/components/saved-quick-links";
import { SavedHubError, SavedPageSkeleton } from "@/features/saved/components/saved-states";
import { buildSavedSectionCounts, filterSavedPosts } from "@/features/saved/lib/filter-saved-posts";
import {
  resolveSavedSection,
  savedSectionToParam,
  type SavedSectionId,
} from "@/features/saved/saved-section-params";
import { useSavedPostsPage } from "@/features/social/hooks/use-saved-posts-page";
import { buildSavedIntelligenceFromPosts } from "@/features/social/lib/build-saved-intelligence";
import { isMockDataEnabled } from "@/mock/config";

export function SavedHubClient() {
  const mockOn = isMockDataEnabled();
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { posts, ready, loading, error, unsave, refetch } = useSavedPostsPage();

  const section = useMemo(
    () => resolveSavedSection(searchParams.get("section")),
    [searchParams],
  );

  const pushSection = useCallback(
    (id: SavedSectionId) => {
      const param = savedSectionToParam(id);
      const next = param ? `${pathname}?section=${param}` : pathname;
      router.replace(next, { scroll: false });
    },
    [pathname, router],
  );

  const intel = useMemo(() => buildSavedIntelligenceFromPosts(posts), [posts]);
  const sectionCounts = useMemo(() => buildSavedSectionCounts(posts), [posts]);
  const visiblePosts = useMemo(() => filterSavedPosts(posts, section), [posts, section]);

  const pageHeader = (
    <SavedPageHeader title="Kaydedilenler" subtitle={intel.trendSummary} />
  );

  if (!isInitialized || !ready || loading) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-saved" header={pageHeader}>
        <SavedPageSkeleton />
      </HubPageShell>
    );
  }

  if (!user) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-saved" header={pageHeader}>
        <div className="sv-studio">
          <div className="sv-page sv-surface">
            <div className="sv-panel">
              <EmptyState
                title="Giriş gerekli"
                description="Kaydedilen gönderileri görmek için oturum açın."
                actionLabel="Giriş yap"
                actionHref="/auth/login?next=%2Fhub%2Fsaved"
                tone="social"
                compact
              />
            </div>
          </div>
        </div>
      </HubPageShell>
    );
  }

  if (error) {
    return (
      <HubPageShell zone="connect" className="hp-canvas--embedded-saved" header={pageHeader}>
        <SavedHubError message={error} onRetry={() => void refetch()} />
      </HubPageShell>
    );
  }

  return (
    <HubPageShell zone="connect" className="hp-canvas--embedded-saved" header={pageHeader}>
      <div className="sv-studio">
        <div className="sv-page sv-surface">
          <SavedNavRail active={section} onSelect={pushSection} counts={sectionCounts} />

          <div className="sv-panel" id="sv-panel-main" role="tabpanel" aria-labelledby={`sv-tab-${section}`}>
            <SavedPanelToolbar section={section} visibleCount={visiblePosts.length} mockOn={mockOn} />

            <SavedIntelStrip intel={intel} sectionLabel={section} />

            {visiblePosts.length === 0 ? (
              <EmptyState
                title={posts.length === 0 ? "Henüz kayıt yok" : "Bu bölümde kayıt yok"}
                description={
                  posts.length === 0
                    ? (intel.emptyCta ?? "Gönderilerdeki kaydet simgesine dokunarak buraya ekleyin.")
                    : "Başka bir bölüm seçebilir veya keşfet üzerinden yeni içerik kaydedebilirsin."
                }
                actionLabel={posts.length === 0 ? "Keşfet" : section !== "all" ? "Tümünü göster" : "Keşfet"}
                actionHref={posts.length === 0 || section === "all" ? "/discover" : undefined}
                onAction={posts.length > 0 && section !== "all" ? () => pushSection("all") : undefined}
                tone="social"
                compact
              />
            ) : (
              <SavedList posts={visiblePosts} onUnsave={unsave} />
            )}

            <SavedQuickLinks />
          </div>
        </div>
      </div>
    </HubPageShell>
  );
}
