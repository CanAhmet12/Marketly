"use client";

import type { SignalDetailVerdict } from "@/features/signals/lib/signal-detail-narrative";
import { cn } from "@/lib/cn";

type Props = {
  verdict: SignalDetailVerdict;
};

export function SignalDetailVerdictBanner({ verdict }: Props) {
  return (
    <div
      className={cn("sdm-verdict", "sdm-verdict--keyline", `sdm-verdict--${verdict.tone}`)}
      role="status"
      aria-label="Çağrı özeti"
    >
      <p className="sdm-verdict__text">{verdict.line}</p>
    </div>
  );
}
