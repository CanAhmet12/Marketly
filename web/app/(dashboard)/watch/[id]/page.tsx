import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { WatchPageClient } from "@/features/watch/watch-page-client";
import { WatchPageSkeleton } from "@/features/watch/watch-page-skeleton";
import { fetchPostSeoRow } from "@/lib/seo/fetch-post-for-meta";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";
import { ogImageFromPostRow, postTextSnippet } from "@/lib/seo/open-graph";
import { getSiteUrl, getSupabasePublicEnv } from "@/lib/supabase/env";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ list?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { url, anonKey } = getSupabasePublicEnv();
  if (!url || !anonKey) {
    return {
      title: "İzle",
      description: "Marketly’de video ve kısa içerik izleyin.",
    };
  }
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const row = await fetchPostSeoRow(supabase, id);
  const snippet = postTextSnippet(row, 72);
  const kind = row?.type?.trim() || "video";
  const title = snippet ? `${snippet} · İzle` : "İzle";
  const description = snippet || `Marketly ${kind} içeriği.`;
  const ogUrl = ogImageFromPostRow(row);
  const site = getSiteUrl();

  return {
    ...siteCanonical(`/watch/${id}`),
    title,
    description,
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title,
      description,
      type: "video.other",
      ...(ogUrl ? { images: [{ url: ogUrl, alt: title }] } : {}),
      ...(site ? { url: `${site}/watch/${id}` } : {}),
    },
    twitter: {
      card: ogUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogUrl ? { images: [ogUrl] } : {}),
    },
  };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const raw = sp.list;
  const list = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    decoded = id;
  }
  let listDecoded = list;
  if (list) {
    try {
      listDecoded = decodeURIComponent(list);
    } catch {
      listDecoded = list;
    }
  }
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <WatchPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <WatchPageClient postId={decoded} playlistId={listDecoded} />
    </Suspense>
  );
}
