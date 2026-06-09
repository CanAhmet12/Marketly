import { WEB_WRITE_BLOCKED_MESSAGE, isWebWriteEnabled } from "@/lib/supabase/write-guard";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  className?: string;
};

/** Live modda write-gate aktifken gösterilir */
export function StudioWriteGateNotice({ className }: Props) {
  if (isMockDataEnabled() || isWebWriteEnabled()) return null;

  return (
    <div className={className ?? "st-write-gate-notice"} role="status">
      <span className="st-write-gate-notice__label">Salt okuma</span>
      <p className="st-write-gate-notice__text">{WEB_WRITE_BLOCKED_MESSAGE}</p>
    </div>
  );
}
