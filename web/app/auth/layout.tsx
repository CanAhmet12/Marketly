import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthLayoutClient } from "@/features/auth/auth-layout-client";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
