"use client";

import { memo } from "react";

import { SafeAvatar } from "@/components/ui/safe-avatar";

export type LiveChatRole = "viewer" | "mod" | "host";

type Props = {
  username: string;
  content: string;
  avatarUrl: string | null;
  isGift: boolean;
  giftIcon: string | null;
  role: LiveChatRole;
  isFresh: boolean;
};

function LiveChatRowInner({ username, content, avatarUrl, isGift, giftIcon, role, isFresh }: Props) {
  if (isGift) {
    return (
      <article className="live-chat-row live-chat-row--gift" data-fresh={isFresh ? "true" : undefined}>
        <span className="live-chat-row__gift-icon" aria-hidden>
          {giftIcon ?? "🎁"}
        </span>
        <p className="live-chat-row__body">
          <span className="live-chat-row__user">{username}</span>
          <span className="live-chat-row__sep" aria-hidden>
            {" "}
          </span>
          <span className="live-chat-row__text">{content}</span>
        </p>
      </article>
    );
  }

  const initial = username.trim().charAt(0).toUpperCase() || "?";

  return (
    <article
      className="live-chat-row"
      data-role={role !== "viewer" ? role : undefined}
      data-fresh={isFresh ? "true" : undefined}
    >
      {avatarUrl ? (
        <SafeAvatar src={avatarUrl} alt="" size={20} className="live-chat-row__avatar" />
      ) : (
        <span className="live-chat-row__avatar-fallback" aria-hidden>
          {initial}
        </span>
      )}
      <p className="live-chat-row__body">
        <span className="live-chat-row__user">{username}</span>
        <span className="live-chat-row__sep" aria-hidden>
          {": "}
        </span>
        <span className="live-chat-row__text">{content}</span>
      </p>
    </article>
  );
}

export const LiveChatRow = memo(LiveChatRowInner);
