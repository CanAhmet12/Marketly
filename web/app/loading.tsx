import { MarketlyGlobalLoader } from "@/components/global-page-gate/marketly-global-loader";

import "@/styles/global-page-gate.css";

/** Route geçişi — kök fallback (client gate ile aynı logo animasyonu) */
export default function Loading() {
  return <MarketlyGlobalLoader mode="inline" />;
}
