"use client";

import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { reportOperationalWarning } from "@/lib/observability/report-error";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Params = {
  postId: string;
  viewerKey: string;
  /** Abonelik yenileme — önceki `useEffect` ile aynı: `post` referansı değişince yeniden kurulur */
  post: unknown;
  /** `fetchPostDetail` sonrası */
  enabled: boolean;
  qc: QueryClient;
  onRealtimeChannelIssue: () => void;
};

/**
 * Gönderi detayında yorum / gönderi satırı değişimlerinde query invalidation.
 */
export function usePostDetailRealtime({
  postId,
  viewerKey,
  post,
  enabled,
  qc,
  onRealtimeChannelIssue,
}: Params): void {
  useEffect(() => {
    if (!isSupabaseConfigured() || !postId || !enabled) return;
    const client = getSupabaseBrowserClient();
    const channel = client
      .channel(`post-detail-rt-${postId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` },
        () => {
          void qc.invalidateQueries({ queryKey: queryKeys.postComments(postId, viewerKey) });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts", filter: `id=eq.${postId}` },
        () => {
          void qc.invalidateQueries({ queryKey: queryKeys.postDetail(postId, viewerKey) });
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          reportOperationalWarning("post-detail-realtime", "Kanal durumu", { status, postId });
          onRealtimeChannelIssue();
        }
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, [postId, viewerKey, post, enabled, qc, onRealtimeChannelIssue]);
}
