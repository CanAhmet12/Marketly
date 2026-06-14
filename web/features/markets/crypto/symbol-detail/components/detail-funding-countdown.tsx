"use client";

import { useEffect, useState } from "react";

import { fmtFundingCountdown } from "@/features/markets/crypto/symbol-detail/lib/format";

type Props = {
  nextFundingTime: number;
  className?: string;
};

/** Türev bloğunun tamamını yeniden render etmeden funding geri sayımını günceller. */
export function DetailFundingCountdown({ nextFundingTime, className }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, [nextFundingTime]);

  return <span className={className}>{fmtFundingCountdown(nextFundingTime, now)}</span>;
}
