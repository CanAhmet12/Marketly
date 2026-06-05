"use client";

import { useEffect, useState } from "react";

import { MUTATION_TOAST_EVENT, type MutationToastDetail } from "@/lib/ui/mutation-toast";
import { cn } from "@/lib/cn";

const AUTO_DISMISS_MS = 3200;

export function MutationToastHost() {
  const [toast, setToast] = useState<MutationToastDetail | null>(null);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<MutationToastDetail>).detail;
      if (!detail?.message) return;
      setToast(detail);
    };
    window.addEventListener(MUTATION_TOAST_EVENT, onToast);
    return () => window.removeEventListener(MUTATION_TOAST_EVENT, onToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="mutation-toast-host" role="status" aria-live="polite">
      <div
        className={cn(
          "mutation-toast-host__pill",
          toast.tone === "info" ? "mutation-toast-host__pill--info" : "mutation-toast-host__pill--error",
        )}
      >
        {toast.message}
      </div>
    </div>
  );
}
