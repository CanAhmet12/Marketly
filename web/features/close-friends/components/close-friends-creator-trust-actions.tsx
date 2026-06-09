"use client";

import type { PrivateCircleDetailPayload } from "@/features/close-friends/domain/types";
import { useCloseFriendActions } from "@/features/close-friends/hooks/use-close-friend-actions";
import { cn } from "@/lib/cn";

type Props = {
  detail: PrivateCircleDetailPayload;
  viewerId: string;
  mockOn: boolean;
};

export function CloseFriendsCreatorTrustActions({ detail, viewerId, mockOn }: Props) {
  const { addCloseFriend, removeCloseFriend, isSubmitting, error, clearError } = useCloseFriendActions(mockOn);
  const canWrite = mockOn || Boolean(detail.write_enabled);
  const isFriend = Boolean(detail.is_close_friend);

  const handleToggle = async () => {
    if (!canWrite) return;
    clearError();
    if (isFriend) {
      if (!window.confirm(`${detail.circle.creator_display} yakın arkadaş listenden çıkarılsın mı?`)) return;
      await removeCloseFriend({ userId: viewerId, friendId: detail.circle.creator_id });
    } else {
      await addCloseFriend({ userId: viewerId, friendId: detail.circle.creator_id });
    }
  };

  return (
    <div className="cf-subscribe-block">
      {isFriend ? (
        <p className="cf-status-badge">Güven katmanında · özel daire erişimi açık</p>
      ) : (
        <p className="cf-empty-hint">Bu üretici henüz yakın arkadaş listende değil.</p>
      )}

      <div className="cf-detail-actions" style={{ marginTop: 10 }}>
        <button
          type="button"
          className={cn("cf-detail-btn", isFriend && "cf-detail-btn--danger")}
          disabled={isSubmitting || !canWrite}
          onClick={() => void handleToggle()}
        >
          {isSubmitting ? "İşleniyor…" : isFriend ? "Güven katmanından çıkar" : "Yakın arkadaş ekle"}
        </button>
      </div>

      {!canWrite && !mockOn ? (
        <p className="cf-empty-hint" style={{ marginTop: 8 }}>
          Liste yönetimi salt-okuma modunda kapalı.
        </p>
      ) : null}

      {error ? (
        <p className="cf-save-banner" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
