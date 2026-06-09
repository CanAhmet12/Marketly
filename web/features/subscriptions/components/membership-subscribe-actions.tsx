"use client";

import { useAuth } from "@/features/auth/use-auth";
import { useMembershipSubscribe } from "@/features/subscriptions/hooks/use-membership-subscribe";
import type { MembershipDetailPayload } from "@/features/subscriptions/domain/types";
import { formatDbTierLabel } from "@/features/subscriptions/lib/build-subscription-rails";
import { cn } from "@/lib/cn";

type Props = {
  detail: MembershipDetailPayload;
};

export function MembershipSubscribeActions({ detail }: Props) {
  const { user } = useAuth();
  const uid = user?.id;
  const { subscribe, unsubscribe, isSubmitting, error, clearError } = useMembershipSubscribe();

  const hasPremiumTier = detail.tiers.some((t) => t.key !== "free");
  const subscribed = detail.subscription.subscribed;
  const writeOn = detail.write_enabled;

  if (!uid) {
    return (
      <p className="sub-empty-hint">
        Abone olmak için{" "}
        <a href={`/auth/login?next=/hub/subscriptions/${encodeURIComponent(detail.creator_id)}`} className="sub-quick-link">
          giriş yap
        </a>
        .
      </p>
    );
  }

  if (!hasPremiumTier) {
    return <p className="sub-empty-hint">Bu üretici henüz ücretli katman tanımlamamış.</p>;
  }

  const handleSubscribe = async () => {
    clearError();
    await subscribe({
      userId: uid,
      creatorId: detail.creator_id,
      displayName: detail.display_name,
      tier: "premium",
    });
  };

  const handleUnsubscribe = async () => {
    if (!window.confirm(`${detail.display_name} aboneliğini iptal etmek istediğine emin misin?`)) return;
    clearError();
    await unsubscribe({ userId: uid, creatorId: detail.creator_id });
  };

  return (
    <div className="sub-subscribe-block">
      {subscribed ? (
        <p className="sub-status-badge">
          Aktif üyelik · {formatDbTierLabel(detail.subscription.tier)}
          {detail.subscription.subscribed_at
            ? ` · ${new Date(detail.subscription.subscribed_at).toLocaleDateString("tr-TR")}`
            : null}
        </p>
      ) : null}

      <div className="sub-detail-actions" style={{ marginTop: subscribed ? 10 : 0 }}>
        {subscribed ? (
          <button
            type="button"
            className={cn("sub-detail-btn", "sub-detail-btn--danger")}
            disabled={isSubmitting || !writeOn}
            onClick={() => void handleUnsubscribe()}
          >
            {isSubmitting ? "İşleniyor…" : "Aboneliği iptal et"}
          </button>
        ) : (
          <button
            type="button"
            className="sub-detail-btn sub-detail-btn--primary"
            disabled={isSubmitting || !writeOn}
            onClick={() => void handleSubscribe()}
          >
            {isSubmitting ? "Kaydediliyor…" : "Abone ol"}
          </button>
        )}
      </div>

      {!writeOn ? (
        <p className="sub-empty-hint" style={{ marginTop: 8 }}>
          Abonelik kaydı salt-okuma modunda kapalı. Yönetici NEXT_PUBLIC_WEB_WRITE_ENABLED=true ile açabilir.
        </p>
      ) : null}

      {error ? (
        <p className="sub-save-banner" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
