import type { AlgoExperimentId } from "@/lib/algo-experiment";
import { resolveExperimentVariant } from "@/lib/algo-experiment";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AlgoMetricKind = "impression" | "click" | "engagement" | "conversion";

type PendingEvent = {
  experiment_id: string;
  variant: string;
  metric: string;
  value: number;
  meta: Record<string, unknown>;
};

const QUEUE: PendingEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_MS = 4_000;
const MAX_BATCH = 20;

function metricsEnabled(): boolean {
  if (typeof process === "undefined") return false;
  return process.env.NEXT_PUBLIC_ALGO_METRICS === "true" || process.env.NEXT_PUBLIC_ALGO_METRICS === "1";
}

async function flushQueue(): Promise<void> {
  if (!metricsEnabled() || !isSupabaseConfigured() || QUEUE.length === 0) return;
  const batch = QUEUE.splice(0, MAX_BATCH);
  const client = getSupabaseBrowserClient();
  await Promise.all(
    batch.map((e) =>
      client.rpc("log_algorithm_experiment", {
        p_experiment_id: e.experiment_id,
        p_variant: e.variant,
        p_metric: e.metric,
        p_value: e.value,
        p_meta: e.meta,
      }),
    ),
  );
}

function scheduleFlush(): void {
  if (typeof window === "undefined") return;
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushQueue();
  }, FLUSH_MS);
}

/** Supabase `log_algorithm_experiment` RPC — debounced batch */
export function logAlgoMetricEvent(params: {
  experimentId: AlgoExperimentId;
  metric: AlgoMetricKind;
  value?: number;
  meta?: Record<string, unknown>;
  variant?: "control" | "treatment" | "explore";
}): void {
  if (typeof window === "undefined") return;
  if (!metricsEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[AlgoMetric]", params);
    }
    return;
  }

  const variant = params.variant ?? resolveExperimentVariant(params.experimentId);
  QUEUE.push({
    experiment_id: params.experimentId,
    variant,
    metric: params.metric,
    value: params.value ?? 1,
    meta: params.meta ?? {},
  });
  scheduleFlush();
}
