"use client";

import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  priority?: boolean;
};

/**
 * Supabase public storage + ui-avatars; `next.config` `remotePatterns` ile uyumlu.
 * Harici rastgele domainler için kullanmayın (ör. link preview).
 */
export function SafeAvatar({ src, alt, size = 44, className = "", priority }: Props) {
  const dim = `${Math.max(size, 8)}px`;
  const unoptimized = src.includes("ui-avatars.com");
  return (
    <Image
      src={src}
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
