"use client";

import Link from "next/link";

import { CreatorsDirectoryState } from "@/features/creators/components/creators-directory-states";
import { useCreatorsDiscoverPreview } from "@/features/creators/hooks/use-creators-discover-preview";
import { DiscoverCreatorsTabPreview } from "@/features/discover/tab-previews/discover-creators-tab-preview";
import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

function CreatorsTabLoading() {
  return (
    <div className="dsc-hub-tab dsc-hub-tab--creators dsc-hub-tab--loading" aria-busy="true">
      <div className="dsc-hub-tab__sk-deck" aria-hidden />
      <div className="dsc-hub-tab__sk-rail" aria-hidden>
        <div className="dsc-hub-tab__sk-card" />
        <div className="dsc-hub-tab__sk-card" />
        <div className="dsc-hub-tab__sk-card" />
      </div>
    </div>
  );
}

/** Keşfet hub — `?tab=creators` önizlemesi */
export function CreatorsHubPreview() {
  const {
    payload,
    live,
    rising,
    directory,
    forYou,
    forYouHeadline,
    counts,
    isLoading,
    isError,
    refetch,
  } = useCreatorsDiscoverPreview();

  const mockOn = isMockDataEnabled();
  const showSetup = !mockOn && !isSupabaseConfigured();

  if (showSetup) {
    return (
      <div className="dsc-hub-tab dsc-hub-tab--creators">
        <CreatorsDirectoryState variant="no-config" />
      </div>
    );
  }

  if (isLoading) {
    return <CreatorsTabLoading />;
  }

  if (isError && !mockOn) {
    return (
      <div className="dsc-hub-tab dsc-hub-tab--creators">
        <CreatorsDirectoryState variant="error" onRetry={() => void refetch()} />
      </div>
    );
  }

  if (!payload || payload.creators.length === 0) {
    return (
      <div className="dsc-hub-tab dsc-hub-tab--creators">
        <CreatorsDirectoryState variant="empty" />
        <Link href={DISCOVER_VERTICAL_ROUTES.creators} className="dsc-hub-tab__cta">
          <span>Üretici dizinine git</span>
          <span className="dsc-hub-tab__cta-arrow" aria-hidden>
            →
          </span>
        </Link>
      </div>
    );
  }

  return (
    <DiscoverCreatorsTabPreview
      live={live}
      rising={rising}
      directory={directory}
      forYou={forYou}
      forYouHeadline={forYouHeadline}
      counts={counts}
    />
  );
}
