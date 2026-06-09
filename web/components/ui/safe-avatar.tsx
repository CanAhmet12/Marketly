"use client";

import Image from "next/image";

import { avatarUrl } from "@/lib/avatar-url";

type Props = {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  priority?: boolean;
  /** Boş src — deterministik ui-avatars fallback */
  fallbackId?: string;
  fallbackName?: string;
};

/**
 * Supabase public storage + ui-avatars; `next.config` `remotePatterns` ile uyumlu.
 * Harici rastgele domainler için kullanmayın (ör. link preview).
 */
export function SafeAvatar({
  src,
  alt,
  size = 44,
  className = "",
  priority,
  fallbackId,
  fallbackName,
}: Props) {
  const dim = `${Math.max(size, 8)}px`;
  const trimmed = src?.trim() ?? "";
  const resolved = trimmed || avatarUrl(fallbackId ?? "user", fallbackName ?? (alt || "?"));
  const unoptimized = resolved.includes("ui-avatars.com");
  return (
    <Image
      src={resolved}
      alt={alt}
      width={size}
      height={size}
      sizes={dim}
      className={["rounded-full object-cover", className].filter(Boolean).join(" ")}
      unoptimized={unoptimized}
      priority={priority}
    />
  );
}
