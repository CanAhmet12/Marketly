"use client";

import { useEffect } from "react";

/** Feed'den `#yorumlar` ile gelindiğinde tartışma bölümüne kaydır; giriş yapılmışsa composer'a odaklan. */
export function usePostDetailHashScroll(ready: boolean, focusComposer = false) {
  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    if (window.location.hash !== "#yorumlar") return;

    const scroll = () => {
      document.getElementById("yorumlar")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const tScroll = window.setTimeout(scroll, 80);
    const tFocus = focusComposer
      ? window.setTimeout(() => {
          const ta = document.querySelector<HTMLTextAreaElement>("#yorumlar .pd-textarea");
          if (ta && !ta.disabled) ta.focus({ preventScroll: true });
        }, 520)
      : undefined;

    return () => {
      window.clearTimeout(tScroll);
      if (tFocus) window.clearTimeout(tFocus);
    };
  }, [ready, focusComposer]);
}
