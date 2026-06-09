import type { ReactNode } from "react";

import "../../styles/welcome-onboarding.css";

export default function WelcomeLayout({ children }: { children: ReactNode }) {
  return <div className="welcome-layout">{children}</div>;
}
