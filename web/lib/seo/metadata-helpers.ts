import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/supabase/env";

/** Tüm OG metadata’larında aynı site adı ve dil. */
export const OG_SITE_DEFAULTS = {
  siteName: "Marketly",
  locale: "tr_TR",
} as const satisfies Pick<NonNullable<Metadata["openGraph"]>, "siteName" | "locale">;

/**
 * Tam canonical URL — `NEXT_PUBLIC_SITE_URL` yoksa boş nesne (sayfa yine çalışır).
 * @param pathname `/post/...` gibi mutlak yol
 */
export function siteCanonical(pathname: string): Pick<Metadata, "alternates"> | Record<string, never> {
  const site = getSiteUrl()?.replace(/\/$/, "");
  if (!site) return {};
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return { alternates: { canonical: `${site}${path}` } };
}
