"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchStudioContent } from "@/features/studio/fetch-studio";
import type { CreatorContentItem } from "@/features/studio/repository/types";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import type { StudioContentKind } from "@/features/studio/types";
import { useStudioLocalMutations } from "@/features/studio/use-studio-local-mutations";
import { useStudioOwnerId } from "@/features/studio/use-studio-owner-id";
import { formatCompactCount } from "@/lib/format-compact-count";
import { cn } from "@/lib/cn";
import { applyContentEdits } from "@/features/studio/lib/content-edits-storage";
import { getStudioRepository } from "@/features/studio/repository";
import { isMockDataEnabled } from "@/mock/config";

const KIND_FILTERS: { id: "all" | StudioContentKind; label: string }[] = [
  { id: "all",     label: "Tümü" },
  { id: "video",   label: "Video" },
  { id: "signal",  label: "Sinyal" },
  { id: "post",    label: "Gönderi" },
  { id: "short",   label: "Short" },
  { id: "live",    label: "Canlı" },
];

function kindLabel(kind: string): string {
  const m: Record<string, string> = { video: "VID", live: "LIVE", signal: "SIG", post: "POST", short: "SHORT" };
  return m[kind] ?? "—";
}

function kindBadgeClass(kind: string): string {
  const m: Record<string, string> = {
    video:  "st-content-kind-badge--video",
    live:   "st-content-kind-badge--live",
    signal: "st-content-kind-badge--signal",
    post:   "st-content-kind-badge--post",
    short:  "st-content-kind-badge--short",
  };
  return m[kind] ?? "st-content-kind-badge--post";
}

function statusBadgeClass(status: string): string {
  if (status === "published") return "st-content-status--published";
  if (status === "scheduled") return "st-content-status--scheduled";
  return "st-content-status--draft";
}

function statusLabel(status: string): string {
  if (status === "published") return "Yayında";
  if (status === "scheduled") return "Zamanlı";
  if (status === "draft")     return "Taslak";
  return status;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

export function StudioContentClient() {
  const { user } = useAuth();
  const mockOn = isMockDataEnabled();
  const { mutations } = useStudioLocalMutations(mockOn);
  const ownerId = useStudioOwnerId(user);

  const [kindFilter, setKindFilter] = useState<"all" | StudioContentKind>("all");
  const [liveItems, setLiveItems] = useState<CreatorContentItem[]>([]);
  const liveMode = !mockOn && isSupabaseConfigured();

  useEffect(() => {
    if (!ownerId || !liveMode) return;
    fetchStudioContent(getSupabaseBrowserClient(), ownerId).then(setLiveItems);
  }, [ownerId, liveMode]);

  const items = useMemo(() => {
    if (!ownerId) return [];
    if (liveMode) return liveItems.map(applyContentEdits);
    return (getStudioRepository().getContentItems(ownerId, mutations) ?? []).map(applyContentEdits);
  }, [ownerId, mutations, liveMode, liveItems]);

  if (!ownerId) return <EmptyState title="Giriş gerekli" description="İçerik yönetimi için oturum açın." tone="social" compact />;

  const filtered = kindFilter === "all"
    ? items
    : items.filter((i) => i.kind === kindFilter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--st-text-2)" }}>
          {items.length} içerik
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/upload" className="studio-hbtn studio-hbtn--ghost">📹 Video Yükle</Link>
          <Link href="/studio/drafts" className="studio-hbtn studio-hbtn--accent">+ Yeni İçerik</Link>
        </div>
      </div>

      {/* Kind filter */}
      <div className="st-block">
        <div className="st-content-filters">
          {KIND_FILTERS.map((f) => (
            <button key={f.id} type="button"
              className={cn("st-filter-pill", kindFilter === f.id && "st-filter-pill--active")}
              onClick={() => setKindFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--st-meta)", fontSize: 13 }}>
            Bu filtreye uygun içerik bulunamadı.
          </div>
        ) : (
          <div className="st-content-grid">
            {filtered.map((item) => (
              <div key={item.id} className="st-content-card">
                {/* Thumbnail */}
                <div className="st-content-thumb">
                  {item.thumbnailUrl
                    ? <img src={item.thumbnailUrl} alt={item.title} />
                    : <div className="st-content-thumb-placeholder" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "var(--st-meta)", textTransform: "uppercase" }}>{kindLabel(item.kind)}</div>
                  }
                  <span className={cn("st-content-kind-badge", kindBadgeClass(item.kind))}>
                    {item.kind}
                  </span>
                  <span className={cn("st-content-status", statusBadgeClass(item.status))}>
                    {statusLabel(item.status)}
                  </span>
                </div>

                {/* Body */}
                <div className="st-content-body">
                  <div className="st-content-title">{item.title}</div>
                  <div className="st-content-meta">
                    <span>{formatCompactCount(item.views)} görüntülenme</span>
                    <span>·</span>
                    <span>{formatCompactCount(item.likes + item.comments)} etk.</span>
                    {item.publishedAt && (
                      <>
                        <span>·</span>
                        <span>{fmtDate(item.publishedAt)}</span>
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <Link
                      href={`/studio/content/${encodeURIComponent(item.id)}/edit`}
                      className="studio-hbtn studio-hbtn--ghost"
                      style={{ fontSize: 11, padding: "6px 10px" }}
                    >
                      Düzenle
                    </Link>
                    {item.href && (
                      <Link
                        href={item.href}
                        className="studio-hbtn studio-hbtn--ghost"
                        style={{ fontSize: 11, padding: "6px 10px" }}
                      >
                        Görüntüle →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
