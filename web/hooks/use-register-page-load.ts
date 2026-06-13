"use client";

import { useEffect, useId } from "react";

import { registerPageLoad, unregisterPageLoad } from "@/lib/async/page-load-registry";

/** useEffect / localStorage / manuel fetch yüklemelerini global kapıya bildirir */
export function useRegisterPageLoad(isLoading: boolean) {
  const id = useId();

  useEffect(() => {
    if (!isLoading) {
      unregisterPageLoad(id);
      return;
    }
    registerPageLoad(id);
    return () => unregisterPageLoad(id);
  }, [isLoading, id]);
}
