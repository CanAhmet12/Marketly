import { Suspense } from "react";

import { DelayedSkeleton } from "@/components/states/delayed-skeleton";
import { MessagesPageClientLazy } from "@/lib/lazy/dynamic-route-clients";
import { MessagesPageSkeleton } from "@/features/social/components/social-states";

type Props = {
  params: Promise<{ conversationId: string }>;
};

export default async function HubMessagesConversationPage({ params }: Props) {
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
