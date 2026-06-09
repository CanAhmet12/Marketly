"use client";

import Link from "next/link";

import type { PostDetail } from "../types";

export function PostDetailThreadNav({ post }: { post: PostDetail }) {
  const threadRootId = post.thread_id;
  const parentId = post.reply_to_post_id;
  const isThreadRoot = Boolean(threadRootId) && threadRootId === post.id;
  const showThreadRoot = Boolean(threadRootId) && !isThreadRoot;
  const showParent = Boolean(parentId);
  const showCurrent = showThreadRoot || showParent;

  if (!threadRootId && !parentId) return null;

  return (
    <nav className="pd-thread-nav" aria-label="Thread gezintisi">
      <ol className="pd-thread-nav__list">
        {threadRootId ? (
          <li className="pd-thread-nav__item">
            {isThreadRoot ? (
              <span className="pd-thread-nav__current" aria-current="page">
                Thread kökü
              </span>
            ) : (
              <Link href={`/post/${threadRootId}`} className="pd-thread-nav__link">
                Thread kökü
              </Link>
            )}
          </li>
        ) : null}

        {showParent ? (
          <>
            <li className="pd-thread-nav__sep" aria-hidden>
              ›
            </li>
            <li className="pd-thread-nav__item">
              <Link href={`/post/${parentId}`} className="pd-thread-nav__link">
                Üst gönderi
              </Link>
            </li>
          </>
        ) : null}

        {showCurrent ? (
          <>
            <li className="pd-thread-nav__sep" aria-hidden>
              ›
            </li>
            <li className="pd-thread-nav__item">
              <span className="pd-thread-nav__current" aria-current="page">
                Bu gönderi
              </span>
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}
