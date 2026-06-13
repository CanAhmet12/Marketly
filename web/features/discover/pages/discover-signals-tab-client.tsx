"use client";

import Link from "next/link";

import { DiscoverSignalsTabPreview } from "@/features/discover/tab-previews/discover-signals-tab-preview";
import { DISCOVER_VERTICAL_ROUTES } from "@/features/discover/routes";
import { SignalsCatalogState } from "@/features/signals/components/signals-catalog-state";
import { useSignalsDiscoverPreview } from "@/features/signals/hooks/use-signals-discover-preview";

function SignalsTabLoading() {
  return (
    <div className="dsc-hub-tab dsc-hub-tab--signals dsc-hub-tab--loading" aria-busy="true">
      <div className="dsc-hub-tab__sk-deck" aria-hidden />
      <div className="dsc-hub-tab__sk-rail" aria-hidden>
        <div className="dsc-hub-tab__sk-card" />
        <div className="dsc-hub-tab__sk-card" />
      </div>
    </div>
  );
}

export function DiscoverSignalsTabClient() {
  const { items, isLoading, isError, mockOn, supabaseOn, refetch } = useSignalsDiscoverPreview();

  if (!mockOn && !supabaseOn) {
    return (
      <div className="dsc-hub-tab dsc-hub-tab--signals">
        <SignalsCatalogState variant="no-config" />
      </div>
    );
  }

  if (isLoading) {
    return <SignalsTabLoading />;
  }

  if (isError && !mockOn) {
    return (
      <div className="dsc-hub-tab dsc-hub-tab--signals">
        <SignalsCatalogState variant="error" onRetry={() => void refetch()} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="dsc-hub-tab dsc-hub-tab--signals">
        <SignalsCatalogState variant="empty" />
        <Link href={DISCOVER_VERTICAL_ROUTES.signals} className="dsc-hub-tab__cta">
          <span>Sinyal kataloğuna git</span>
          <span className="dsc-hub-tab__cta-arrow" aria-hidden>
            →
          </span>
        </Link>
      </div>
    );
  }

  return <DiscoverSignalsTabPreview items={items} />;
}
