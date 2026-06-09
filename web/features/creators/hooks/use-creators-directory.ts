"use client";

import { useQuery } from "@tanstack/react-query";

import { getCreatorsRepository } from "@/features/creators/repository";
import { useAuth } from "@/features/auth/use-auth";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { queryKeys } from "@/lib/query-keys";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useCreatorsDirectory() {
  const mounted = useClientMounted();
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const enabled = mounted && (isMockDataEnabled() || isSupabaseConfigured());

  const query = useQuery({
    queryKey: queryKeys.creatorsDirectory(uid),
    queryFn: () => getCreatorsRepository().getDirectory(uid),
    staleTime: 90_000,
    enabled,
  });

  return {
    payload: query.data ?? null,
    query,
    enabled,
  };
}
