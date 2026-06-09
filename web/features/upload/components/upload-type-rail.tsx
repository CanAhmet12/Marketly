"use client";

import { cn } from "@/lib/cn";

export type UploadContentKind = "post" | "signal" | "video" | "pulse" | "live";

export type UploadTypeMeta = {
  id: UploadContentKind;
  label: string;
  tone: string;
};

export const UPLOAD_TYPE_META: UploadTypeMeta[] = [
  { id: "post", label: "Gönderi", tone: "post" },
  { id: "signal", label: "Sinyal", tone: "signal" },
  { id: "video", label: "Video", tone: "video" },
  { id: "pulse", label: "Pulse", tone: "pulse" },
  { id: "live", label: "Canlı", tone: "live" },
];

type Props = {
  active: UploadContentKind;
  onSelect: (id: UploadContentKind) => void;
};

export function UploadTypeRail({ active, onSelect }: Props) {
  return (
    <div className="uv2-type-segment-wrap">
      <div className="uv2-type-segment" role="tablist" aria-label="İçerik türü">
        {UPLOAD_TYPE_META.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onSelect(t.id)}
              className={cn("uv2-type-tab", on && "uv2-type-tab--active")}
              data-tone={t.tone}
            >
              <span className="uv2-type-tab-label">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
