import type { ReactNode } from "react";

/* Doğrudan import — @import zinciri webpack dev önbelleğinde eski CRT kurallarını tutabiliyor */
import "@/styles/discover-visual-reference.css";
import "@/styles/creators-v2.css";
import "@/styles/creators-directory-premium.css";

export default function CreatorsLayout({ children }: { children: ReactNode }) {
  return children;
}
