"use client";

import { useIntersectionSentinel } from "@/hooks/use-intersection-sentinel";

type Props = {
  enabled: boolean;
  onVisible: () => void;
  root?: Element | null;
  rootMargin?: string;
  label?: string;
};

/** Feed / liste sonu — görünür olunca `onVisible` */
export function InfiniteScrollSentinel({
  enabled,
  onVisible,
  root = null,
  rootMargin,
  label = "Daha fazla içerik yükleniyor",
}: Props) {
  const ref = useIntersectionSentinel({ enabled, onVisible, root, rootMargin });

  return (
    <div
      ref={ref}
      className="pointer-events-none h-px w-full shrink-0 opacity-0"
      aria-hidden={!enabled}
      aria-label={enabled ? label : undefined}
      data-infinite-sentinel=""
    />
  );
}
