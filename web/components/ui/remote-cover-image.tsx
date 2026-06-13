"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/cn";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onFailed?: () => void;
};

function isRemoteUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/** P9-005 — grid/thumb kapakları; uzak URL yoksa null (fallback SVG/gradient kalır) */
export function RemoteCoverImage({
  src,
  alt = "",
  className,
  sizes = "(max-width: 768px) 100vw, 320px",
  priority = false,
  onFailed,
}: Props) {
  const [failed, setFailed] = useState(false);
  const url = src.trim();

  if (!url || failed || !isRemoteUrl(url)) {
    return null;
  }

  return (
    <div className={cn("relative block size-full overflow-hidden", className)}>
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        onError={() => {
          setFailed(true);
          onFailed?.();
        }}
      />
    </div>
  );
}
