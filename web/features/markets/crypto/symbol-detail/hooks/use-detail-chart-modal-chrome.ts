"use client";

import { useEffect, useState } from "react";

const HTML_ATTR = "data-chart-modal-open";

export function useDetailChartModalChrome(open: boolean, onClose: () => void): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      document.documentElement.removeAttribute(HTML_ATTR);
      return;
    }

    document.documentElement.setAttribute(HTML_ATTR, "");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.documentElement.removeAttribute(HTML_ATTR);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return mounted;
}
