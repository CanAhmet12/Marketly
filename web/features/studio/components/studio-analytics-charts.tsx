"use client";

import { StudioAreaChart } from "@/features/studio/components/studio-area-chart";
import type { StudioMetricPoint } from "@/features/studio/repository/types";

const CHARTS = [
  { key: "views", title: "Görüntülenme", color: "var(--st-chart-views)", field: "viewsSeries" as const },
  { key: "watch", title: "İzlenme Süresi", color: "var(--st-chart-watch)", field: "watchTimeSeries" as const },
  { key: "engagement", title: "Etkileşim", color: "var(--st-chart-engagement)", field: "engagementSeries" as const },
  { key: "follower", title: "Takipçi Büyümesi", color: "var(--st-chart-follower)", field: "followerSeries" as const },
];

type SeriesMap = {
  viewsSeries: StudioMetricPoint[];
  watchTimeSeries: StudioMetricPoint[];
  engagementSeries: StudioMetricPoint[];
  followerSeries: StudioMetricPoint[];
};

type Props = {
  series: SeriesMap;
};

export function StudioAnalyticsCharts({ series }: Props) {
  return (
    <div className="st-analytics-chart-grid">
      {CHARTS.map((c) => (
        <div key={c.key} className="st-block">
          <div className="st-block-header st-block-header--tight">
            <div className="st-block-title">{c.title}</div>
          </div>
          <div className="st-analytics-chart-body">
            <StudioAreaChart series={series[c.field]} color={c.color} label={c.title} height={100} />
          </div>
        </div>
      ))}
    </div>
  );
}
