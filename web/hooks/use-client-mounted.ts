"use client";

import { useEffect, useState } from "react";

/** SSR/hidrasyon sonrası — tarayıcıda React Query fetch'lerini güvenle açar. */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
