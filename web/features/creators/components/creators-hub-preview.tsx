"use client";

import Link from "next/link";

import { CreatorAnalystTapeRow } from "@/features/creators/components/creator-analyst-tape-row";
import { CreatorsAnalystRailSection } from "@/features/creators/components/creators-analyst-rail-section";
import { CreatorsHubFaceRail } from "@/features/creators/components/creators-hub-face-rail";
import { CreatorsDirectoryState } from "@/features/creators/components/creators-directory-states";
import { useCreatorsDirectory } from "@/features/creators/hooks/use-creators-directory";
import { useCreatorsDirectorySlices } from "@/features/creators/hooks/use-creators-directory-slices";
import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

const HUB_PARAMS = {
  q: "",
  sort: "recommended" as const,
  tab: "all" as const,
  asset: null,
  specialty: null,
};

const LIVE_LIMIT = 6;
const RISING_LIMIT = 5;
const DIRECTORY_LIMIT = 5;

/**
 * Keşfet hub — `?tab=creators` önizlemesi (v2 analist kartları).
 */
export function CreatorsHubPreview() {
  const { payload, query, enabled } = useCreatorsDirectory();
  const { liveAll, risingAll, filtered, counts } = useCreatorsDirectorySlices(payload, HUB_PARAMS);

  const mockOn = isMockDataEnabled();
  const showSetup = !mockOn && !isSupabaseConfigured();
  const isLoading = enabled && query.isLoading && !payload;
  const isError = enabled && query.isError && !payload;

  const live = liveAll.slice(0, LIVE_LIMIT);
  const rising = risingAll.slice(0, RISING_LIMIT);
  const directory = filtered.slice(0, DIRECTORY_LIMIT);

  if (showSetup) {
    return (
      <div className="dvr-tab-stream dvr-tab-stream--creators dvr-tab-stream--creators-v2">
        <CreatorsDirectoryState variant="no-config" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dvr-tab-stream dvr-tab-stream--creators dvr-tab-stream--creators-v2 crt-v2-hub-loading" aria-busy="true">
        <div className="crt-v2-sk-filter" aria-hidden />
        <div className="crt-v2-sk-rail-row" aria-hidden>
          <div className="crt-v2-sk-card" />
          <div className="crt-v2-sk-card" />
        </div>
      </div>
    );
  }

  if (isError && !mockOn) {
    return (
      <div className="dvr-tab-stream dvr-tab-stream--creators">
        <CreatorsDirectoryState variant="error" onRetry={() => void query.refetch()} />
      </div>
    );
  }

  if (!payload || payload.creators.length === 0) {
    return (
      <div className="dvr-tab-stream dvr-tab-stream--creators">
        <CreatorsDirectoryState variant="empty" />
      </div>
    );
  }

  return (
    <div className="dvr-tab-stream dvr-tab-stream--creators dvr-tab-stream--creators-v2 creators-hub-preview crt-v2-hub">
      <div className="crt-v2-hub__intro">
        <div>
          <span className="crt-v2-hub__kicker">Analist ağı</span>
          <p className="crt-v2-hub__line">Canlı masalar, isabet oranı ve varlık odağı</p>
        </div>
        <span className="crt-v2-hub__count tabular-nums" aria-label={`${counts.total} analist`}>
          {counts.total} analist
          {counts.live > 0 ? ` · ${counts.live} canlı` : ""}
        </span>
      </div>

      <CreatorsHubFaceRail label="Piyasayı konuşanlar" subtitle="Bugünün masaları" />

      <CreatorsAnalystRailSection
        label="Şu an yayında"
        seriesKicker="Canlı"
        accent="live"
        creators={live}
        seeAllHref={DISCOVER_VERTICAL_ROUTES.creators}
      />

      <CreatorsAnalystRailSection
        label="Yükselen"
        seriesKicker="Momentum"
        accent="peak"
        creators={rising}
        seeAllHref={DISCOVER_VERTICAL_ROUTES.creators}
      />

      <section className="crt-v2-hub__directory" aria-label="Analist önizlemesi">
        <div className="crt-v2-directory__head">
          <div>
            <span className="crt-v2-directory__kicker">Band</span>
            <h2 className="crt-v2-directory__title">Popüler analistler</h2>
          </div>
          <Link href={DISCOVER_VERTICAL_ROUTES.creators} className="dvr-rail-see-all">
            <span>Tam dizin</span>
            <span className="dvr-rail-see-all__arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>
        <div className="crt-v2-tape-list">
          {directory.map((c, i) => (
            <CreatorAnalystTapeRow key={c.id} creator={c} index={i} rank={i + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}
