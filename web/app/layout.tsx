import type { Metadata, Viewport } from "next";

import { OG_SITE_DEFAULTS } from "@/lib/seo/metadata-helpers";
import { getSiteUrl } from "@/lib/supabase/env";

import { Providers } from "./providers";

import "./globals.css";

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  themeColor: "#0f9d75",
  colorScheme: "light dark",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`) } : {}),
  title: {
    default: "Marketly",
    template: "%s · Marketly",
  },
  description: "Finans ve içerik topluluğu — web sürümü",
  openGraph: {
    ...OG_SITE_DEFAULTS,
    title: "Marketly",
    description: "Finans ve içerik topluluğu — web sürümü",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" data-theme="light" className="min-h-dvh" suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        {/* Inline: next/script chunk’ına bağlı kalmadan tema (ChunkLoadError / stale hash riskini azaltır) */}
        <script
          id="marketly-theme-init"
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('marketly-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light')}catch(e){document.documentElement.setAttribute('data-theme','light')}})();",
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
