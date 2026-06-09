"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/features/auth/use-auth";
import { applyOnboardingBootstrap } from "@/features/onboarding/apply-onboarding-bootstrap";
import type { OnboardingDraft } from "@/features/onboarding/domain/types";
import { persistOnboardingComplete } from "@/features/onboarding/fetch-onboarding-profile";
import { buildOnboardingCatalog } from "@/features/onboarding/lib/onboarding-catalog";
import { resolveOnboardingDestination } from "@/features/onboarding/lib/onboarding-destination";
import {
  LS_ONBOARDING_DRAFT,
  readJsonStorage,
  writeJsonStorage,
} from "@/features/onboarding/lib/onboarding-storage";
import { fetchRecommendedCreators } from "@/features/home/fetch-home-extras";
import { OnboardingPageSkeleton } from "@/features/studio/components/studio-states";
import { readWelcomeInterests } from "@/features/welcome/welcome-storage";
import { cn } from "@/lib/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMockDataEnabled } from "@/mock/config";

const STEPS = [
  { id: "identity", label: "Piyasa kimliği" },
  { id: "interests", label: "İlgi alanları" },
  { id: "starter", label: "Başlangıç paketi" },
] as const;

function emptyDraft(): OnboardingDraft {
  const welcome = readWelcomeInterests();
  const topicMap: Record<string, string> = {
    crypto: "kripto",
    bist: "bist",
    forex: "fx",
    commodities: "emtia",
    signals: "kripto",
    news: "makro",
  };
  const mapped = welcome.map((w) => topicMap[w]).filter(Boolean) as string[];

  return {
    identity: null,
    interest_topic_ids: [...new Set(mapped)],
    creator_ids: [],
    market_theme_ids: [],
    signal_style: null,
    strategy: null,
    macro_vs_momentum: 0,
    watchlist_symbols: [],
    skipped: false,
  };
}

function toggle<T extends string>(arr: T[], id: T, max: number): T[] {
  if (arr.includes(id)) return arr.filter((x) => x !== id);
  if (arr.length >= max) return [...arr.slice(1), id];
  return [...arr, id];
}

export function OnboardingSetupClient() {
  const router = useRouter();
  const { user, isInitialized, markOnboardingComplete } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [creatorsLoaded, setCreatorsLoaded] = useState(false);
  const [creatorOptions, setCreatorOptions] = useState<{ id: string; label: string; handle: string }[]>([]);

  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const saved = readJsonStorage<Partial<OnboardingDraft> | null>(LS_ONBOARDING_DRAFT, null);
    return { ...emptyDraft(), ...(saved && typeof saved === "object" ? saved : {}), skipped: false };
  });

  useEffect(() => {
    writeJsonStorage(LS_ONBOARDING_DRAFT, draft);
  }, [draft]);

  useEffect(() => {
    if (!isSupabaseConfigured() || isMockDataEnabled()) {
      setCreatorsLoaded(true);
      return;
    }
    const client = getSupabaseBrowserClient();
    void fetchRecommendedCreators(client, 8).then((rows) => {
      setCreatorOptions(
        rows.map((c) => ({
          id: c.id,
          label: c.name,
          handle: c.handle.startsWith("@") ? c.handle : `@${c.handle}`,
        })),
      );
      setCreatorsLoaded(true);
    });
  }, []);

  const catalog = useMemo(() => buildOnboardingCatalog(creatorOptions), [creatorOptions]);

  const onFinish = useCallback(async () => {
    if (!user?.id) return;
    setSaving(true);
    setSaveError(null);
    const finalDraft = { ...draft, skipped: false };
    const client = isMockDataEnabled() || !isSupabaseConfigured() ? null : getSupabaseBrowserClient();

    if (client) {
      const result = await persistOnboardingComplete(client, user.id, finalDraft);
      if (!result.ok && result.error) {
        setSaveError("Tercihlerin kaydedilemedi. Tekrar deneyin veya atla.");
        setSaving(false);
        return;
      }
    }

    markOnboardingComplete();
    await applyOnboardingBootstrap(client, user.id, finalDraft);

    if (!client) {
      const { getOnboardingRepository } = await import("@/features/onboarding/repository");
      getOnboardingRepository().applyBootstrap(user.id, finalDraft);
    }

    const dest = resolveOnboardingDestination(finalDraft);
    window.location.assign(dest);
  }, [draft, user?.id, markOnboardingComplete]);

  const onSkip = useCallback(async () => {
    if (!user?.id) return;
    setSaving(true);
    setSaveError(null);
    const skipDraft: OnboardingDraft = { ...emptyDraft(), skipped: true };
    const client = isMockDataEnabled() || !isSupabaseConfigured() ? null : getSupabaseBrowserClient();

    if (client) {
      await persistOnboardingComplete(client, user.id, skipDraft);
    }

    markOnboardingComplete();
    await applyOnboardingBootstrap(client, user.id, skipDraft);

    if (!client) {
      const { getOnboardingRepository } = await import("@/features/onboarding/repository");
      getOnboardingRepository().skipWithMinimalSeed(user.id);
    }

    window.location.assign("/discover");
  }, [user?.id, markOnboardingComplete]);

  if (!isInitialized || !creatorsLoaded) {
    return <OnboardingPageSkeleton />;
  }

  if (!user) {
    return (
      <div className="setup-guest">
        <div className="setup-panel">
          <header className="setup-panel__head">
            <h1 className="setup-panel__title">Kurulum</h1>
            <p className="setup-panel__sub">Kişisel akışını oluşturmak için oturum aç.</p>
          </header>
          <Link href="/auth/login?next=/onboarding/setup" className="setup-btn-primary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            Giriş yap
          </Link>
        </div>
      </div>
    );
  }

  const canNext =
    step === 0
      ? Boolean(draft.identity)
      : step === 1
        ? draft.interest_topic_ids.length > 0
        : draft.watchlist_symbols.length > 0 || draft.creator_ids.length > 0;

  return (
    <div className="setup-split">
      <div className="setup-split__bg" aria-hidden>
        <div className="setup-split__grid" />
        <div className="setup-split__glow setup-split__glow--1" />
        <div className="setup-split__glow setup-split__glow--2" />
      </div>

      <header className="setup-split__topbar">
        <Link href="/" className="setup-split__brand">
          <img src="/logo.png" alt="" width={48} height={48} className="setup-split__logo" />
          <span>
            <span className="setup-split__brand-name">Marketly</span>
            <span className="setup-split__brand-tag">Kişisel kurulum</span>
          </span>
        </Link>
        <span className="setup-split__step-badge">
          {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
        </span>
      </header>

      <div className="setup-split__stage">
        <aside className="setup-split__guide-col">
          <div className="setup-guide">
            <p className="setup-guide__kicker">Kişisel kurulum</p>
            <h1 className="setup-guide__title">
              Akışını <span className="setup-guide__title-accent">yapılandır.</span>
            </h1>
            <p className="setup-guide__subtitle">Üç kısa adımda öneri motoru seni tanır — watchlist ve takip hazır olur.</p>

            <ol className="setup-guide__steps">
              {STEPS.map((s, i) => (
                <li
                  key={s.id}
                  className={cn("setup-guide__step", i < step && "is-done", i === step && "is-active")}
                >
                  <span className="setup-guide__step-num">{i < step ? "✓" : i + 1}</span>
                  {s.label}
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <main className="setup-split__main">
          <div className="setup-panel">
            {step === 0 ? (
              <>
                <header className="setup-panel__head">
                  <h2 className="setup-panel__title">Piyasa kimliğin</h2>
                  <p className="setup-panel__sub">Akış ve öneriler bu seçime göre şekillenir.</p>
                </header>
                <div className="setup-identity-grid">
                  {catalog.identities.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      className={cn("setup-identity-card", draft.identity === it.id && "is-selected")}
                      onClick={() => setDraft((d) => ({ ...d, identity: it.id }))}
                    >
                      <span className="setup-identity-label">{it.label}</span>
                      <span className="setup-identity-sub">{it.sub}</span>
                    </button>
                  ))}
                </div>
                <p className="setup-panel__section-label">Hızlı şablon</p>
                <div className="setup-chip-grid">
                  {catalog.personas.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="setup-chip"
                      title={p.subline}
                      onClick={() => setDraft((d) => ({ ...d, ...p.preset, skipped: false }))}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <header className="setup-panel__head">
                  <h2 className="setup-panel__title">İlgi alanların</h2>
                  <p className="setup-panel__sub">En fazla 4 konu — keşfet ve ana akış buna göre sıralanır.</p>
                </header>
                <div className="setup-chip-grid">
                  {catalog.topics.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={cn("setup-chip", draft.interest_topic_ids.includes(t.id) && "is-selected")}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          interest_topic_ids: toggle(d.interest_topic_ids, t.id, 4),
                        }))
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <header className="setup-panel__head">
                  <h2 className="setup-panel__title">Başlangıç paketi</h2>
                  <p className="setup-panel__sub">Watchlist ve takip — ilk açılışta boş ekran görmeyesin.</p>
                </header>
                <p className="setup-panel__section-label">Semboller</p>
                <div className="setup-chip-grid">
                  {catalog.watchlist_starter_symbols.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      className={cn("setup-chip", draft.watchlist_symbols.includes(sym) && "is-selected")}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          watchlist_symbols: toggle(d.watchlist_symbols, sym, 5),
                        }))
                      }
                    >
                      {sym}
                    </button>
                  ))}
                </div>
                {catalog.creators.length > 0 ? (
                  <>
                    <p className="setup-panel__section-label">Analistler</p>
                    <div className="setup-chip-grid">
                      {catalog.creators.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={cn("setup-chip", draft.creator_ids.includes(c.id) && "is-selected")}
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              creator_ids: toggle(d.creator_ids, c.id, 3),
                            }))
                          }
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </>
            ) : null}

            {saveError ? (
              <div role="status" className="auth-form-alert auth-form-alert--warn" style={{ marginBottom: 12 }}>
                {saveError}
              </div>
            ) : null}

            <div className="setup-panel__actions">
              <button type="button" className="setup-skip" onClick={() => void onSkip()} disabled={saving}>
                Şimdilik atla
              </button>
              <div className="setup-panel__actions-right">
                {step > 0 ? (
                  <button type="button" className="setup-btn-secondary" onClick={() => setStep((s) => s - 1)} disabled={saving}>
                    Geri
                  </button>
                ) : null}
                {step < STEPS.length - 1 ? (
                  <button type="button" className="setup-btn-primary" disabled={!canNext || saving} onClick={() => setStep((s) => s + 1)}>
                    İleri
                  </button>
                ) : (
                  <button type="button" className="setup-btn-primary" disabled={!canNext || saving} onClick={() => void onFinish()}>
                    {saving ? "Kaydediliyor…" : "Başla"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="setup-split__footer">
        <span>© Marketly</span>
        <Link href="/discover">Misafir olarak gez</Link>
      </footer>
    </div>
  );
}
