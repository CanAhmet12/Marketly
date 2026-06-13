"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { resolveDiscoverTabRedirect } from "@/features/discover/lib/discover-hub-routes";

/** Eski `/discover?tab=*` → tam sayfa; düz `/discover` → Tümü akışı kalır */
export function DiscoverLegacyTabRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");

  useEffect(() => {
    const target = resolveDiscoverTabRedirect(rawTab);
    if (target) {
      router.replace(target, { scroll: false });
    }
  }, [rawTab, router]);

  return null;
}
