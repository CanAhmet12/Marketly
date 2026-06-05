import { SkeletonGrid, SkeletonText } from "@/components/states/skeleton";

/**
 * Dashboard route geçişleri — AppShell layout korunur, yalnızca içerik alanı skeleton.
 * P1-001: Root/dashboard loading.tsx fallback.
 */
export function GenericPageContentSkeleton() {
  return (
    <div
      className="ms-page-wrapper ms-container-standard min-w-0 px-[var(--sp-3)] py-[var(--sp-4)]"
      role="status"
      aria-busy="true"
      aria-label="Sayfa yükleniyor"
    >
      <div className="motion-fade-in space-y-[var(--sp-4)]">
        <div className="space-y-2">
          <SkeletonText width="1/4" className="h-3" />
          <SkeletonText width="1/2" className="h-7" />
        </div>
        <div className="motion-shimmer h-10 w-full max-w-xl rounded-full bg-[var(--color-divider)]" aria-hidden />
        <SkeletonGrid count={6} columns={3} aspect="video" />
      </div>
    </div>
  );
}
