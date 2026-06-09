"use client";

import { useEffect, useRef } from "react";

import { getActiveExperiments } from "@/lib/algo-experiment";
import { logAlgoMetricEvent } from "@/lib/log-algo-metric";
import { AlgoFlags } from "@/lib/algo-flags";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { isMockDataEnabled } from "@/mock/config";

/** Oturum başına aktif deneylere impression loglar */
export function useAlgoExperimentBootstrap() {
  const mounted = useClientMounted();
  const logged = useRef(false);

  useEffect(() => {
    if (!mounted || isMockDataEnabled() || logged.current) return;
    if (!AlgoFlags.algoMetricsLogging) return;

    logged.current = true;
    const exps = getActiveExperiments();
    for (const e of exps) {
      if (e.variant === "control") continue;
      logAlgoMetricEvent({
        experimentId: e.id,
        metric: "impression",
        variant: e.variant,
        meta: { surface: "session_bootstrap" },
      });
    }
  }, [mounted]);
}
