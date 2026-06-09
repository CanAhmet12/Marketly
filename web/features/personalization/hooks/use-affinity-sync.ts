"use client";

import { useEffect } from "react";

import { AlgoFlags } from "@/lib/algo-flags";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

import { readFeedFeedbackState } from "../domain/feed-feedback-store";
import { getPersonalizationRepository } from "../repository";
import { scheduleAffinitySync } from "../sync-affinity-to-server";

/** Davranış değişikliklerinde sunucuya debounced sync */
export function useAffinitySync(userId: string | null) {
  useEffect(() => {
    if (!userId || !isSupabaseConfigured() || !AlgoFlags.personalizationServerSync) return;

    const sync = () => {
      const repo = getPersonalizationRepository();
      const ctx = repo.getAffinityContext();
      scheduleAffinitySync(getSupabaseBrowserClient(), ctx, readFeedFeedbackState());
    };

    sync();
    window.addEventListener("marketly-personalization-updated", sync);
    return () => window.removeEventListener("marketly-personalization-updated", sync);
  }, [userId]);
}
