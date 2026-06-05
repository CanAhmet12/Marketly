import type { Metadata } from "next";
import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { MessagesPageClientLazy } from "@/lib/lazy/dynamic-route-clients";
import { MessagesPageSkeleton } from "@/features/social/components/social-states";
import { OG_SITE_DEFAULTS, siteCanonical } from "@/lib/seo/metadata-helpers";

export const metadata: Metadata = {
  ...siteCanonical("/messages"),
  title: "Mesajlar — Marketly",
  description: "Sohbetler, creator DM ve bağlamlı mesaj merkezi.",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Mesajlar — Marketly",
    description: "Sohbetler, creator DM ve bağlamlı mesaj merkezi.",
  },
};

type Props = {
  params: Promise<{ conversationId: string }>;
};

export default async function MessagesConversationPage({ params }: Props) {
  const { conversationId } = await params;
  let decoded = conversationId;
  try {
    decoded = decodeURIComponent(conversationId);
  } catch {
    /* */
  }
  return (
    <Suspense
      fallback={
        <DelayedSkeleton>
          <MessagesPageSkeleton />
        </DelayedSkeleton>
      }
    >
      <MessagesPageClientLazy conversationId={decoded} />
    </Suspense>
  );
}
