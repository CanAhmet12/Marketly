import type { ReactNode } from "react";

import { HubStudioLayoutClient } from "@/features/hub/hub-studio-layout-client";

import "@/styles/route-groups/studio.css";

export default function HubStudioLayout({ children }: { children: ReactNode }) {
  return <HubStudioLayoutClient>{children}</HubStudioLayoutClient>;
}
