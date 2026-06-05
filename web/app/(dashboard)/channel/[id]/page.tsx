import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";

import type { ChannelTabId } from "@/features/channel/types";
import { ChannelSkeleton } from "@/features/channel/channel-page-parts";
import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { ChannelPageClientLazy } from "@/lib/lazy/dynamic-route-clients";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";
import { pickHttpsUrl } from "@/lib/seo/open-graph";
import { getSiteUrl, getSupabasePublicEnv } from "@/lib/supabase/env";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { url, anonKey } = getSupabasePublicEnv();
  if (!url || !anonKey) {
    return {
      title: "Kanal",
      description: "Marketly kanal sayfası.",
    };
  }
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("profiles")
    .select("username, full_name, bio, avatar_url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.warn("[seo] channel metadata", error.message);
  }

  const row = data as { username?: string | null; full_name?: string | null; bio?: string | null; avatar_url?: string | null } | null;
  const display = row?.full_name?.trim() || row?.username?.trim() || id.slice(0, 8);
  const handle = row?.username?.trim() ? `@${row.username.trim()}` : "";
  const bio = row?.bio?.trim()?.slice(0, 160) || (handle ? `Marketly kanalı ${handle}` : "Marketly kanal profili ve içerikler.");
  const title = `${display} · Kanal`;
  const ogAvatar = pickHttpsUrl(row?.avatar_url ?? null);
  const site = getSiteUrl();

  return {
    ...siteCanonical(`/channel/${id}`),
    title,
    description: bio,
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title,
      description: bio,
      type: "profile",
      ...(ogAvatar ? { images: [{ url: ogAvatar, alt: display }] } : {}),
      ...(site ? { url: `${site}/channel/${id}` } : {}),
    },
    twitter: {
      card: ogAvatar ? "summary_large_image" : "summary",
      title,
      description: bio,
      ...(ogAvatar ? { images: [ogAvatar] } : {}),
    },
  };
}

const CHANNEL_TABS: ChannelTabId[] = [
  "overview",
  "videos",
  "pulse",
  "posts",
  "discussions",
  "rooms",
  "signals",
  "live",
  "playlists",
  "about",
];

export default async function ChannelPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const normalizedTab = tab === "shorts" ? "pulse" : tab;
  const initialTab =
    normalizedTab && (CHANNEL_TABS as readonly string[]).includes(normalizedTab)
      ? (normalizedTab as ChannelTabId)
      : undefined;
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <ChannelSkeleton />
        </DelayedSkeleton>
      }
    >
      <ChannelPageClientLazy channelUserId={id} initialTab={initialTab} />
    </Suspense>
  );
}
