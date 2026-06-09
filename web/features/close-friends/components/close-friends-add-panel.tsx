"use client";

import Image from "next/image";

import type { CloseFriendCandidate } from "@/features/close-friends/domain/types";
import { useCloseFriendActions } from "@/features/close-friends/hooks/use-close-friend-actions";
import { useFollowingCandidates } from "@/features/close-friends/hooks/use-following-candidates";
import { CloseFriendsSectionHeader } from "@/features/close-friends/components/close-friends-ui";

type Props = {
  viewerId: string;
  trustedIds: string[];
  writeEnabled?: boolean;
  mockOn: boolean;
};

export function CloseFriendsAddPanel({ viewerId, trustedIds, writeEnabled, mockOn }: Props) {
  const { candidates, isLoading } = useFollowingCandidates(viewerId, trustedIds);
  const { addCloseFriend, isSubmitting, error, clearError } = useCloseFriendActions(mockOn);
  const canWrite = mockOn || Boolean(writeEnabled);

  if (isLoading) {
    return <p className="cf-empty-hint">Takip listesi yükleniyor…</p>;
  }

  if (candidates.length === 0) {
    return (
      <p className="cf-empty-hint">
        Eklenebilecek takip edilen üretici kalmadı.{" "}
        <a href="/discover" className="cf-quick-link">
          Keşfet
        </a>{" "}
        üzerinden yeni üreticiler bulabilirsin.
      </p>
    );
  }

  const handleAdd = async (c: CloseFriendCandidate) => {
    if (!canWrite) return;
    clearError();
    await addCloseFriend({ userId: viewerId, friendId: c.id });
  };

  return (
    <section className="cf-add-block">
      <CloseFriendsSectionHeader
        title="Takipten ekle"
        desc={mockOn ? "Demo mod — değişiklikler tarayıcıda saklanır." : "Takip ettiğin üreticileri güven katmanına al."}
      />
      <ul className="cf-candidate-list">
        {candidates.map((c) => (
          <li key={c.id} className="cf-candidate-row">
            <div className="cf-trusted-identity">
              <div className="cf-trusted-avatar">
                {c.avatar_url ? (
                  <Image src={c.avatar_url} alt={c.full_name ?? c.username} fill className="object-cover" sizes="36px" />
                ) : (
                  <span className="cf-trusted-avatar-fallback">
                    {(c.full_name ?? c.username).slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="cf-trusted-name">{c.full_name ?? c.username}</p>
                <p className="cf-trusted-meta">@{c.username}</p>
              </div>
            </div>
            <button
              type="button"
              className="cf-detail-btn cf-detail-btn--primary"
              disabled={!canWrite || isSubmitting}
              onClick={() => void handleAdd(c)}
            >
              {isSubmitting ? "…" : "Ekle"}
            </button>
          </li>
        ))}
      </ul>
      {!canWrite && !mockOn ? (
        <p className="cf-empty-hint" style={{ marginTop: 8 }}>
          Ekleme/çıkarma salt-okuma modunda kapalı. Yönetici NEXT_PUBLIC_WEB_WRITE_ENABLED=true ile açabilir.
        </p>
      ) : null}
      {error ? (
        <p className="cf-save-banner" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
