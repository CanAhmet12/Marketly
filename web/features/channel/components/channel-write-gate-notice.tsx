import { WEB_WRITE_BLOCKED_MESSAGE, isWebWriteEnabled } from "@/lib/supabase/write-guard";
import { isMockDataEnabled } from "@/mock/config";

type Props = {
  className?: string;
  /** Takip gibi sosyal yazma işlemleri için kısa uyarı */
  compact?: boolean;
};

/** Kanal — live write-gate aktifken (takip vb.) */
export function ChannelWriteGateNotice({ className, compact }: Props) {
  if (isMockDataEnabled() || isWebWriteEnabled()) return null;

  return (
    <div className={className ?? "ch-write-gate-notice"} role="status">
      {!compact ? <span className="ch-write-gate-notice__label">Salt okuma</span> : null}
      <p className="ch-write-gate-notice__text">
        {compact
          ? "Takip ve benzeri işlemler salt-okuma modunda kapalı."
          : WEB_WRITE_BLOCKED_MESSAGE}
      </p>
    </div>
  );
}
