"use client";

import { cn } from "@/lib/cn";

import {
  UploadIconLive,
  UploadIconPost,
  UploadIconPulse,
  UploadIconSignal,
  UploadIconVideo,
} from "@/features/upload/components/upload-type-icons";

export type UploadContentKind = "post" | "signal" | "video" | "pulse" | "live";

export type UploadTypeMeta = {
  id: UploadContentKind;
  label: string;
  hint: string;
  tone: string;
  Icon: typeof UploadIconPost;
};

export const UPLOAD_TYPE_META: UploadTypeMeta[] = [
  { id: "post", label: "Gönderi", hint: "Metin & görsel", tone: "post", Icon: UploadIconPost },
  { id: "signal", label: "Sinyal", hint: "Trade fikri", tone: "signal", Icon: UploadIconSignal },
  { id: "video", label: "Video", hint: "Uzun format", tone: "video", Icon: UploadIconVideo },
  { id: "pulse", label: "Pulse", hint: "Kısa dikey", tone: "pulse", Icon: UploadIconPulse },
  { id: "live", label: "Canlı", hint: "Yayın başlat", tone: "live", Icon: UploadIconLive },
];

type Props = {
  active: UploadContentKind;
  onSelect: (id: UploadContentKind) => void;
};

export function UploadTypeRail({ active, onSelect }: Props) {
  return (
    <div className="uv2-type-rail" role="tablist" aria-label="İçerik türü">
      {UPLOAD_TYPE_META.map((t) => {
        const on = active === t.id;
        const Icon = t.Icon;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(t.id)}
            className={cn("uv2-type-card", on && "uv2-type-card--active")}
            data-tone={t.tone}
          >
            <span className="uv2-type-card-icon" aria-hidden>
              <Icon />
            </span>
            <span className="uv2-type-card-label">{t.label}</span>
            <span className="uv2-type-card-hint">{t.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
