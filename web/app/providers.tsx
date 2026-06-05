"use client";

import { AuthProvider } from "@/features/auth/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
