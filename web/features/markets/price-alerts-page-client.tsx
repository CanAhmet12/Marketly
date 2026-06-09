"use client";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { PriceAlertsPageHeader } from "@/features/markets/components/price-alerts-page-header";
import { PriceAlertsPageView } from "@/features/markets/components/price-alerts-page-view";
import { PriceAlertsPageSkeleton } from "@/features/markets/components/markets-states";
import { usePriceAlertsPage } from "@/features/markets/hooks/use-price-alerts-page";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";

const LOGIN_NEXT = "/hub/price-alerts";

export function PriceAlertsPageClient() {
  const { user, isInitialized } = useAuth();
  const { grouped, rows, ready, loading, error, remove, refetch } = usePriceAlertsPage();

  const pageHeader = <PriceAlertsPageHeader />;

  if (!isInitialized || !ready || loading) {
    return (
      <HubPageShell zone="finance" className="pa-page" header={pageHeader}>
        <PriceAlertsPageSkeleton />
      </HubPageShell>
    );
  }

  if (!user) {
    return (
      <HubPageShell zone="finance" className="pa-page" header={pageHeader} mainClassName="py-16">
        <EmptyState
          title="Giriş gerekli"
          description="Fiyat alarmlarını yönetmek için oturum açın."
          actionLabel="Giriş yap"
          actionHref={`/auth/login?next=${encodeURIComponent(LOGIN_NEXT)}`}
          tone="market"
          compact
        />
      </HubPageShell>
    );
  }

  if (error) {
    return (
      <HubPageShell zone="finance" className="pa-page" header={pageHeader} mainClassName="py-16">
        <EmptyState
          title="Alarmlar yüklenemedi"
          description={error}
          actionLabel="Tekrar dene"
          onAction={() => void refetch()}
          tone="market"
          compact
        />
      </HubPageShell>
    );
  }

  return (
    <PriceAlertsPageView
      grouped={grouped}
      rows={rows}
      removing={remove.isPending}
      onRemove={(alert) => void remove.mutateAsync({ id: alert.id, symbol: alert.symbol, source: alert.source })}
    />
  );
}
