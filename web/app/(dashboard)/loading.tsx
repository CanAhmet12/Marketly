import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { GenericPageContentSkeleton } from "@/components/states/generic-page-content-skeleton";

/**
 * P1-001: Dashboard route geçişleri — AppShell korunur, içerik skeleton.
 */
export default function DashboardLoading() {
  return (
    <DelayedSkeleton>
      <GenericPageContentSkeleton />
    </DelayedSkeleton>
  );
}
