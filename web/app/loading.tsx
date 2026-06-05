import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { GenericPageContentSkeleton } from "@/components/states/generic-page-content-skeleton";

/**
 * P1-001: Global route transition — spinner yerine layout-aligned skeleton.
 * Dashboard/auth kendi loading.tsx dosyalarına sahip; bu kök fallback.
 */
export default function Loading() {
  return (
    <DelayedSkeleton>
      <GenericPageContentSkeleton />
    </DelayedSkeleton>
  );
}
