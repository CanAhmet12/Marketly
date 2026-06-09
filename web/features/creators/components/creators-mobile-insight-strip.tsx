"use client";

import type { CreatorDirectoryRow } from "@/features/creators/types";

type Props = {
  topAccuracy: CreatorDirectoryRow[];
  totalCount: number;
  liveCount: number;
};

/** Desktop sağ rail'in mobil karşılığı — yalnızca özet istatistikler */
export function CreatorsMobileInsightStrip({ topAccuracy, totalCount, liveCount }: Props) {
  const topAcc = topAccuracy[0]?.signalAccuracy ?? null;

  return (
    <aside className="crt-v2-mobile-insight" aria-label="Analist özeti">
      <div className="crt-v2-mobile-insight__stats">
        <div className="crt-v2-mobile-insight__stat crt-v2-mobile-insight__stat--total">
          <span className="crt-v2-mobile-insight__stat-val tabular-nums">{totalCount}</span>
          <span className="crt-v2-mobile-insight__stat-lab">Analist</span>
        </div>
        <div className={liveCount > 0 ? "crt-v2-mobile-insight__stat crt-v2-mobile-insight__stat--live" : "crt-v2-mobile-insight__stat"}>
          <span className="crt-v2-mobile-insight__stat-val tabular-nums">{liveCount}</span>
          <span className="crt-v2-mobile-insight__stat-lab">Canlı</span>
        </div>
        <div className="crt-v2-mobile-insight__stat crt-v2-mobile-insight__stat--acc">
          <span className="crt-v2-mobile-insight__stat-val tabular-nums">
            {topAcc != null ? `%${Math.round(topAcc)}` : "—"}
          </span>
          <span className="crt-v2-mobile-insight__stat-lab">En iyi isabet</span>
        </div>
      </div>
    </aside>
  );
}
