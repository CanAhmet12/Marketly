import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { PostDetailClient } from "@/features/post/post-detail-client";
import { PostDetailSkeleton } from "@/features/post/post-detail-skeleton";
import { fetchPostSeoRow } from "@/lib/seo/fetch-post-for-meta";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";
import { ogImageFromPostRow, postTextSnippet } from "@/lib/seo/open-graph";
import { getSiteUrl, getSupabasePublicEnv } from "@/lib/supabase/env";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { url, anonKey } = getSupabasePublicEnv();
  if (!url || !anonKey) {
    return {
      title: "Gönderi",
      description: "Marketly gönderi detayı.",
    };
  }
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const row = await fetchPostSeoRow(supabase, id);
  const snippet = postTextSnippet(row, 58);
  const title = snippet ? `${snippet} · Gönderi` : "Gönderi";
  const description = snippet || "Marketly gönderisi ve yorumlar.";
  const ogUrl = ogImageFromPostRow(row);
  const site = getSiteUrl();

  return {
    ...siteCanonical(`/post/${id}`),
    title,
    description,
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title,
      description,
      type: "article",
      ...(ogUrl ? { images: [{ url: ogUrl, alt: title }] } : {}),
      ...(site ? { url: `${site}/post/${id}` } : {}),
    },
    twitter: {
      card: ogUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogUrl ? { images: [ogUrl] } : {}),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <PostDetailSkeleton />
        </DelayedSkeleton>
      }
    >
      <PostDetailClient postId={id} />
    </Suspense>
  );
}
