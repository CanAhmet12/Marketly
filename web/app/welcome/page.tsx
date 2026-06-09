import type { Metadata } from "next";

import { WelcomeStoriesClient } from "@/features/welcome/welcome-stories-client";
import { WELCOME_SLIDES } from "@/features/welcome/welcome-slides";

export const metadata: Metadata = {
  title: "Hoş geldin",
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  const firstBg = WELCOME_SLIDES[0]?.bgImage;
  return (
    <>
      {firstBg ? <link rel="preload" as="image" href={firstBg} fetchPriority="high" /> : null}
      <WelcomeStoriesClient />
    </>
  );
}
