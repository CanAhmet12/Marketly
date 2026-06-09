"use client";

import { cn } from "@/lib/cn";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function MessagesSidebarToolbar({ value, onChange }: Props) {
  const hasQuery = value.trim().length > 0;

  return (
    <div className="msg-sidebar-head">
      <div className={cn("msg-search-wrap", hasQuery && "msg-search-wrap--filled")}>
        <svg className="msg-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Kişi, konu veya mesaj ara…"
          className="msg-search"
          aria-label="Sohbet ara"
        />
        {hasQuery ? (
          <button
            type="button"
            className="msg-search-clear"
            aria-label="Aramayı temizle"
            onClick={() => onChange("")}
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
