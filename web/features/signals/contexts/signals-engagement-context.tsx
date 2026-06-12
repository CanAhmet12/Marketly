"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useSignalsEngagement } from "@/features/signals/hooks/use-signals-engagement";

type EngagementApi = ReturnType<typeof useSignalsEngagement>;

const SignalsEngagementContext = createContext<EngagementApi | null>(null);

export function SignalsEngagementProvider({ children }: { children: ReactNode }) {
  const api = useSignalsEngagement();
  return <SignalsEngagementContext.Provider value={api}>{children}</SignalsEngagementContext.Provider>;
}

export function useSignalsEngagementContext(): EngagementApi {
  const ctx = useContext(SignalsEngagementContext);
  if (!ctx) throw new Error("SignalsEngagementProvider gerekli");
  return ctx;
}
