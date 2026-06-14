"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";
import { getSocialRepository } from "@/features/social/repository";
import { fetchPostComments } from "../fetch-post-comments";
import { fetchPostDetail } from "../fetch-post-detail";
import { buildCommentForest, EMPTY_COMMENTS } from "../post-detail-helpers";
import { usePostDetailHashScroll } from "../use-post-detail-hash-scroll";
import { usePostDetailRealtime } from "../use-post-detail-realtime";
import { mockPostDetail } from "@/mock/adapters/post";
import { isMockDataEnabled } from "@/mock/config";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PostDetail } from "../types";

export function usePostDetailData(postId: string) {
  const qc = useQueryClient();
  const { user, isInitialized, configError } = useAuth();
  const uid = user?.id ?? null;
  const viewerKey = uid ?? "anon";
  const loginHref = `/auth/login?next=${encodeURIComponent(`/post/${postId}`)}`;
  const mockOn = isMockDataEnabled();

  const postQuery = useQuery({
    queryKey: queryKeys.postDetail(postId, viewerKey),
    enabled: (mockOn || (isInitialized && isSupabaseConfigured())) && Boolean(postId),
    queryFn: async () => {
      if (mockOn) return mockPostDetail(postId, uid);
      return fetchPostDetail(getSupabaseBrowserClient(), postId, uid);
    },
  });

  const post = postQuery.data;

  const commentsQuery = useQuery({
    queryKey: queryKeys.postComments(postId, viewerKey),
    enabled: Boolean(post) && (mockOn || isSupabaseConfigured()),
    queryFn: async () => {
      if (mockOn) return [];
      return fetchPostComments(getSupabaseBrowserClient(), postId, uid);
    },
  });

  const comments = useMemo(() => commentsQuery.data ?? EMPTY_COMMENTS, [commentsQuery.data]);
  const forest = useMemo(() => buildCommentForest(comments), [comments]);

  usePostDetailHashScroll(Boolean(post), Boolean(user));

  const reactionsQuery = useQuery({
    queryKey: queryKeys.postDiscussionReactions(postId, viewerKey),
    enabled: Boolean(post),
    queryFn: () => getSocialRepository().getPostDiscussionReactions(postId),
  });

  const participationQuery = useQuery({
    queryKey: queryKeys.postParticipation(postId, viewerKey),
    enabled: Boolean(post),
    queryFn: async () => ({
      following: uid ? getSocialRepository().isFollowingThread(uid, postId) : false,
      thesis: uid ? getSocialRepository().getDiscussionThesisStance(uid, postId) : null,
    }),
  });

  const threadFollowing = participationQuery.data?.following ?? false;
  const thesisStance = participationQuery.data?.thesis ?? null;

  usePostDetailRealtime({
    postId,
    viewerKey,
    post,
    enabled: Boolean(post) && isSupabaseConfigured() && !mockOn,
    qc,
    onRealtimeChannelIssue: () => {},
  });

  const needsConfig = (Boolean(configError) || !isSupabaseConfigured()) && !mockOn;
  const isLoading = (!isInitialized && !mockOn) || (postQuery.isPending && !postQuery.data);
  const isNotFound = !isLoading && !needsConfig && (postQuery.isError || !post);

  return {
    qc,
    user,
    uid,
    viewerKey,
    loginHref,
    post: post as PostDetail | undefined,
    postQuery,
    commentsQuery,
    forest,
    reactionsQuery,
    participationQuery,
    threadFollowing,
    thesisStance,
    needsConfig,
    isLoading,
    isNotFound,
    configError,
  };
}
