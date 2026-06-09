"use client";

import { useMemo } from "react";

import { EmptyState } from "@/components/states";
import { HubBodyGrid, HubHeroStrip } from "@/features/hub/components/hub-hero-strip";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { PriceAlertsAlertsTable } from "@/features/markets/components/price-alerts-alerts-table";
import { PriceAlertsIntelZone } from "@/features/markets/components/price-alerts-intel-zone";
import { PriceAlertsPageHeader } from "@/features/markets/components/price-alerts-page-header";
import { PriceAlertsSidebar } from "@/features/markets/components/price-alerts-sidebar";
import { useMarketAssetsLive } from "@/features/markets/hooks/use-market-assets";
import type { PriceAlertRow } from "@/features/markets/hooks/use-price-alerts-page";
import { buildPriceAlertsIntel } from "@/features/markets/lib/build-price-alerts-intel";
import { MARKETS_HUB_PATH } from "@/features/markets/markets-routes";
import { getMarketsRepository } from "@/features/markets/repository";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  grouped: { symbol: string; alerts: PriceAlertRow[] }[];
  rows: PriceAlertRow[];
  removing: boolean;
  onRemove: (alert: PriceAlertRow) => void;
};

export function PriceAlertsPageView({ grouped, rows, removing, onRemove }: Props) {
  const mockOn = isMockDataEnabled();
  const mRepo = useMemo(() => getMarketsRepository(), []);
  const { assets: liveAssets } = useMarketAssetsLive();
  const mockAssets = useMemo(() => mRepo.getDashboardPayload()?.assets ?? [], [mRepo]);
  const assets = useMemo(
    () => (!mockOn && liveAssets.length > 0 ? liveAssets : mockAssets),
    [mockOn, liveAssets, mockAssets],
  );

  const intel = useMemo(() => buildPriceAlertsIntel(grouped, rows), [grouped, rows]);

  const pageHeader = <PriceAlertsPageHeader />;

  if (rows.length === 0) {
    return (
      <HubPageShell zone="finance" className="pa-page" header={pageHeader} mainClassName="py-16">
        <EmptyState
          title="Henüz alarm yok"
          description="Bir varlık sayfasında Fiyat Alarmı bölümünden hazır şablon ekleyerek başlayın."
          actionLabel="Piyasalara git"
          actionHref={MARKETS_HUB_PATH}
          tone="market"
        />
      </HubPageShell>
    );
  }

  return (
    <HubPageShell
      zone="finance"
      className="pa-page"
      header={pageHeader}
      hero={
        <HubHeroStrip
          stats={[
            {
              label: "Aktif Alarm",
              value: intel.totalCount,
              change: "Toplam eşik",
              changeTone: "neutral",
              valueAccent: true,
            },
            {
              label: "Sembol",
              value: intel.symbolCount,
              change: "İzlenen",
              changeTone: "neutral",
            },
            {
              label: "Üst Eşik",
              value: intel.aboveCount,
              change: "Yukarı",
              changeTone: "neutral",
            },
            {
              label: "Alt Eşik",
              value: intel.belowCount,
              change: "Aşağı",
              changeTone: "neutral",
              valueClassName: intel.belowCount > 0 ? "hp-stat-value--warn" : undefined,
            },
          ]}
        />
      }
    >
      <PriceAlertsIntelZone intel={intel} />

      <HubBodyGrid
        className="pa-main"
        main={
          <div className="pa-left">
            <PriceAlertsAlertsTable rows={rows} assets={assets} removing={removing} onRemove={onRemove} />
          </div>
        }
        aside={<PriceAlertsSidebar intel={intel} mockOn={mockOn} />}
      />
    </HubPageShell>
  );
}
