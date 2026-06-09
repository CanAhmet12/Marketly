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
  async redirects() {
    return [
      { source: "/profile", destination: "/hub/profile", permanent: false },
      { source: "/hub", destination: "/hub/profile", permanent: false },
      { source: "/saved", destination: "/hub/saved", permanent: true },
      { source: "/portfolio", destination: "/hub/portfolio", permanent: true },
      { source: "/watchlist", destination: "/hub/watchlist", permanent: true },
      { source: "/price-alerts", destination: "/hub/price-alerts", permanent: true },
      { source: "/subscriptions", destination: "/hub/subscriptions", permanent: true },
      { source: "/subscriptions/:creatorId", destination: "/hub/subscriptions/:creatorId", permanent: true },
      { source: "/messages", destination: "/hub/messages", permanent: true },
      { source: "/messages/:conversationId", destination: "/hub/messages/:conversationId", permanent: true },
      { source: "/notifications", destination: "/hub/notifications", permanent: true },
      { source: "/close-friends", destination: "/hub/close-friends", permanent: true },
      { source: "/close-friends/circle/:circleId", destination: "/hub/close-friends/circle/:circleId", permanent: true },
      { source: "/settings", destination: "/hub/settings", permanent: true },
      { source: "/studio", destination: "/hub/studio", permanent: true },
      { source: "/studio/:path*", destination: "/hub/studio/:path*", permanent: true },
      { source: "/upload", destination: "/hub/upload", permanent: true },
      { source: "/hub/channel", destination: "/hub/profile", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      ...(supaPattern ? [supaPattern] : []),
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/api/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "fastly.picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
    ],
  },
};

export default nextConfig;
