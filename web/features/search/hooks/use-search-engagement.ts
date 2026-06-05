"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { useFeedEngagement } from "@/features/engagement/use-feed-engagement";

/** VideoCard / PulseCard / LiveCard / FeedPostCard — optimistic like & save */
export function useSearchEngagement() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const loginNext = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  return useFeedEngagement({ loginNext });
}
