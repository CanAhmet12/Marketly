/**
 * GLOBAL SKELETON PRIMITIVES
 * 
 * Philosophy:
 * - Calm shimmer (not aggressive)
 * - Low contrast
 * - Match layout structure
 * - Use global motion-shimmer
 */

import { cn } from "@/lib/cn";

type SkeletonProps = {
  className?: string;
};

/**
 * Base skeleton block
 */
export function SkeletonBlock({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "motion-shimmer rounded-[var(--radius-md)] bg-[var(--color-divider)]",
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton circle (for avatars)
 */
export function SkeletonCircle({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "motion-shimmer aspect-square rounded-full bg-[var(--color-divider)]",
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton text line
 */
export function SkeletonText({ className, width = "full" }: SkeletonProps & { width?: "full" | "3/4" | "1/2" | "1/3" | "1/4" }) {
  const widthClass = width === "full" ? "w-full" : width === "3/4" ? "w-3/4" : width === "1/2" ? "w-1/2" : width === "1/3" ? "w-1/3" : "w-1/4";
  
  return (
    <div
      className={cn(
        "motion-shimmer h-3 rounded-full bg-[var(--color-divider)]",
        widthClass,
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton card (generic)
 */
export function SkeletonCard({ children, className }: SkeletonProps & { children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--sp-3)] shadow-sm",
        className
      )}
      aria-hidden="true"
    >
      {children || (
        <div className="space-y-3">
          <SkeletonText width="3/4" />
          <SkeletonText width="full" />
          <SkeletonText width="1/2" />
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton media card (thumbnail + metadata)
 */
export function SkeletonMediaCard({ aspect = "video" }: { aspect?: "video" | "square" | "portrait" }) {
  const aspectClass =
    aspect === "square"
      ? "aspect-square"
      : aspect === "portrait"
        ? "aspect-[9/16]"
        : "aspect-video";

  return (
    <div className="flex flex-col gap-[var(--sp-2)]" aria-hidden="true">
      <SkeletonBlock className={cn("w-full", aspectClass)} />
      <div className="flex items-start gap-2">
        <SkeletonCircle className="h-8 w-8 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonText width="full" />
          <SkeletonText width="3/4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton list (generic)
 */
export function SkeletonList({ count = 5, gap = 3 }: { count?: number; gap?: number }) {
  return (
    <div className={`flex flex-col gap-[var(--sp-${gap})]`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton grid (media cards)
 */
export function SkeletonGrid({ count = 8, columns = 4, aspect = "video" }: { count?: number; columns?: 2 | 3 | 4; aspect?: "video" | "square" | "portrait" }) {
  const gridClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
        ? "grid-cols-3"
        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid gap-[var(--sp-3)] ${gridClass}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonMediaCard key={i} aspect={aspect} />
      ))}
    </div>
  );
}

/**
 * Skeleton timeline (social feed)
 */
export function SkeletonTimeline({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-[var(--sp-4)]" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-[var(--sp-2)]">
          <SkeletonCircle className="h-10 w-10 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonText width="1/4" />
              <SkeletonText width="1/4" />
            </div>
            <SkeletonText width="full" />
            <SkeletonText width="3/4" />
            <SkeletonText width="1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton table row
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-[var(--sp-3)] py-[var(--sp-2)]" aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonText key={i} width="full" />
      ))}
    </div>
  );
}

/**
 * Skeleton table
 */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="flex flex-col gap-[var(--sp-2)]" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </div>
  );
}
