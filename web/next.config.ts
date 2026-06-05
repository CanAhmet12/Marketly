import type { NextConfig } from "next";

function supabaseStorageRemotePattern(): { protocol: "https"; hostname: string; pathname: string } | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    const hostname = new URL(raw).hostname;
    return { protocol: "https", hostname, pathname: "/storage/v1/object/public/**" };
  } catch {
    return null;
  }
}

const supaPattern = supabaseStorageRemotePattern();

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      ...(supaPattern ? [supaPattern] : []),
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/api/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "fastly.picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
    ],
  },
};

export default nextConfig;
