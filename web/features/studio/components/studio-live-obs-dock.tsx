"use client";

import type { StudioLiveObsStep } from "@/features/studio/lib/studio-live-insights";
import type { StudioLiveActiveSession } from "@/features/studio/repository/types";
import { cn } from "@/lib/cn";

type Props = {
  steps: StudioLiveObsStep[];
  activeSession: StudioLiveActiveSession | null;
  previewBaseUrl?: string;
};

export function StudioLiveObsDock({ steps, activeSession, previewBaseUrl }: Props) {
  const origin = previewBaseUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
  const browserSourceUrl = activeSession ? `${origin}${activeSession.href}` : null;

  return (
    <div className="st-block">
      <div className="st-block-header">
        <div className="st-block-title">Yayın Kurulumu</div>
      </div>
      <div className="st-live-obs-body">
        <p className="st-live-obs-lead">
          OBS / Streamlabs dock deseni — tarayıcı kaynağı veya mobil Agora yayıncı ile uyumlu kontrol listesi.
        </p>
        <ul className="st-live-obs-checklist">
          {steps.map((step) => (
            <li key={step.id} className={cn("st-live-obs-step", step.done && "st-live-obs-step--done")}>
              <span className="st-live-obs-step-mark" aria-hidden>
                {step.done ? "✓" : "○"}
              </span>
              {step.label}
            </li>
          ))}
        </ul>
        {browserSourceUrl ? (
          <div className="st-live-obs-url">
            <span className="st-live-obs-url-label">Önizleme URL</span>
            <code className="st-live-obs-url-code">{browserSourceUrl}</code>
          </div>
        ) : null}
        {activeSession ? (
          <div className="st-live-obs-url">
            <span className="st-live-obs-url-label">Agora kanal</span>
            <code className="st-live-obs-url-code">{activeSession.channelName}</code>
          </div>
        ) : null}
      </div>
    </div>
  );
}
