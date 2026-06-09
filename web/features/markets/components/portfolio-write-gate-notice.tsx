import { WEB_WRITE_BLOCKED_MESSAGE, isWebWriteEnabled } from "@/lib/supabase/write-guard";
import { isMockDataEnabled } from "@/mock/config";

type Props = { className?: string };

/** Portföy — live write-gate aktifken pozisyon ekleme bloke */
export function PortfolioWriteGateNotice({ className }: Props) {
  if (isMockDataEnabled() || isWebWriteEnabled()) return null;

  return (
    <div className={className ?? "pf-write-gate-notice"} role="status">
      <span className="pf-write-gate-notice__label">Salt okuma</span>
      <p className="pf-write-gate-notice__text">{WEB_WRITE_BLOCKED_MESSAGE}</p>
    </div>
  );
}
