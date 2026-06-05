"use client";

import { useMemo } from "react";

import { getStudioRepository } from "@/features/studio/repository";
import type { AuthUser } from "@/lib/supabase/types";

export function useStudioOwnerId(user: AuthUser | null): string {
  const authUserId = user?.id ?? "";
  return useMemo(() => {
    if (!authUserId) return "";
    return getStudioRepository().resolveEffectiveOwnerId(authUserId);
  }, [authUserId]);
}
