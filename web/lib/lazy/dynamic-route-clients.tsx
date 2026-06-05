import dynamic from "next/dynamic";

/** Route-level code splitting — Suspense fallback page.tsx'te kalır. */
export const UploadPageClientLazy = dynamic(() =>
  import("@/features/upload/upload-page-client").then((m) => m.UploadPageClient),
);

export const ChannelPageClientLazy = dynamic(() =>
  import("@/features/channel/channel-page-client").then((m) => m.ChannelPageClient),
);

export const DiscoverVisualReferenceContainerLazy = dynamic(() =>
  import("@/features/discover/visual-reference/discover-visual-reference-container").then(
    (m) => m.DiscoverVisualReferenceContainer,
  ),
);

export const MessagesPageClientLazy = dynamic(() =>
  import("@/features/social/messages-page-client").then((m) => m.MessagesPageClient),
);
