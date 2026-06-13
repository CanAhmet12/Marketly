"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchCryptoSentimentAggregate,
  upsertCryptoSentimentVote,
} from "@/features/markets/fetch-crypto-sentiment-votes";
import { getSentimentDeviceId } from "@/features/markets/crypto/detail/lib/sentiment-device-id";
import { queryKeys } from "@/lib/query-keys";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

type Vote = "bull" | "bear";

type Seed = {
  bullPct: number;
  bearPct: number;
  totalVotes: number;
};

const VOTE_PREFIX = "marketly-crypto-sentiment-vote:";

function readLocalVote(symbol: string): Vote | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${VOTE_PREFIX}${symbol.toUpperCase()}`);
    return raw === "bull" || raw === "bear" ? raw : null;
  } catch {
    return null;
  }
}

function writeLocalVote(symbol: string, vote: Vote) {
  try {
    localStorage.setItem(`${VOTE_PREFIX}${symbol.toUpperCase()}`, vote);
  } catch {
    /* */
  }
}

function optimisticPct(prev: Vote | null, next: Vote, bullPct: number, bearPct: number) {
  if (next === "bull") {
    return {
      bullPct: Math.min(bullPct + (prev === "bear" ? 2 : 1), 99),
      bearPct: Math.max(bearPct - (prev === "bear" ? 2 : 1), 1),
    };
  }
  return {
    bearPct: Math.min(bearPct + (prev === "bull" ? 2 : 1), 99),
    bullPct: Math.max(bullPct - (prev === "bull" ? 2 : 1), 1),
  };
}

export function useCryptoSentimentVote(symbol: string, seed: Seed) {
  const symKey = symbol.trim().toUpperCase();
  const liveMode = !isMockDataEnabled() && isSupabaseConfigured();
  const qc = useQueryClient();

  const aggregateQuery = useQuery({
    queryKey: queryKeys.cryptoSentimentAggregate(symKey),
    queryFn: () => fetchCryptoSentimentAggregate(getSupabaseBrowserClient(), symKey),
    enabled: liveMode && symKey.length > 0,
    staleTime: 45_000,
  });

  const remote = aggregateQuery.data;
  const baseBull = remote?.totalVotes ? remote.bullPct : seed.bullPct;
  const baseBear = remote?.totalVotes ? remote.bearPct : seed.bearPct;
  const baseTotal = remote?.totalVotes ? remote.totalVotes : seed.totalVotes;

  const [vote, setVote] = useState<Vote | null>(null);
  const [bullPct, setBullPct] = useState(baseBull);
  const [bearPct, setBearPct] = useState(baseBear);
  const [totalVotes, setTotalVotes] = useState(baseTotal);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBullPct(baseBull);
    setBearPct(baseBear);
    setTotalVotes(baseTotal);
  }, [baseBull, baseBear, baseTotal]);

  useEffect(() => {
    queueMicrotask(() => {
      setVote(readLocalVote(symKey));
      setHydrated(true);
    });
  }, [symKey]);

  const castVote = useCallback(
    async (next: Vote) => {
      if (vote === next) return;
      const prev = vote;
      setVote(next);
      writeLocalVote(symKey, next);

      setTotalVotes((t) => (prev ? t : t + 1));
      const nextPct = optimisticPct(prev, next, bullPct, bearPct);
      setBullPct(nextPct.bullPct);
      setBearPct(nextPct.bearPct);

      if (liveMode) {
        const ok = await upsertCryptoSentimentVote(
          getSupabaseBrowserClient(),
          symKey,
          getSentimentDeviceId(),
          next,
        );
        if (ok) {
          void qc.invalidateQueries({ queryKey: queryKeys.cryptoSentimentAggregate(symKey) });
        }
      }
    },
    [symKey, vote, bullPct, bearPct, liveMode, qc],
  );

  return {
    vote,
    bullPct,
    bearPct,
    totalVotes,
    castVote,
    hydrated,
    loading: liveMode && aggregateQuery.isLoading,
  };
}
