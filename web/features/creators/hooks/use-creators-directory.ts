"use client";

import { useQuery } from "@tanstack/react-query";

import { getCreatorsRepository } from "@/features/creators/repository";
import type { CreatorsSortId } from "@/features/creators/lib/creators-directory-config";
import { useAuth } from "@/features/auth/use-auth";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { queryKeys } from "@/lib/query-keys";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

export function useCreatorsDirectory(sort: CreatorsSortId = "recommended") {
  const mounted = useClientMounted();
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const enabled = mounted && (isMockDataEnabled() || isSupabaseConfigured());

  const query = useQuery({
    queryKey: queryKeys.creatorsDirectory(uid, sort),
    queryFn: () => getCreatorsRepository().getDirectory(uid, sort),
    staleTime: 90_000,
    enabled,
  });

  return {
    payload: query.data ?? null,
    query,
    enabled,
  };
}
