"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { OnboardingPageSkeleton } from "@/features/studio/components/studio-states";
import type { OnboardingDraft } from "@/features/onboarding/domain/types";
import { getOnboardingRepository } from "@/features/onboarding/repository";
import { cn } from "@/lib/cn";

const repo = () => getOnboardingRepository();

const emptyDraft = (): OnboardingDraft => ({
  identity: null,
  interest_topic_ids: [],
  creator_ids: [],
  market_theme_ids: [],
  signal_style: null,
  strategy: null,
  macro_vs_momentum: 0,
  watchlist_symbols: [],
  skipped: false,
});

function toggle<T extends string>(arr: T[], id: T, max: number): T[] {
  const has = arr.includes(id);
  if (has) return arr.filter((x) => x !== id);
  if (arr.length >= max) return [...arr.slice(1), id];
  return [...arr, id];
}

export function OnboardingWizardClient() {
  const { user, isInitialized } = useAuth();
  const uid = user?.id ?? null;
  const catalog = useMemo(() => repo().getCatalog(), []);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const saved = typeof window !== "undefined" ? repo().loadDraft() : null;
    if (saved && typeof saved === "object") {
      return { ...emptyDraft(), ...saved, skipped: false };
    }
    return emptyDraft();
  });
  const [done, setDone] = useState(false);

  useEffect(() => {
    repo().saveDraft(draft);
  }, [draft]);

  const intel = useMemo(() => repo().getIntelPartial(draft), [draft]);

  const applyPersona = useCallback((preset: Partial<OnboardingDraft>) => {
    setDraft((d) => ({ ...d, ...preset, skipped: false }));
  }, []);

  const onFinish = useCallback(() => {
    repo().applyBootstrap(uid, { ...draft, skipped: false });
    setDone(true);
  }, [uid, draft]);

  const onSkip = useCallback(() => {
    repo().skipWithMinimalSeed(uid);
    setDone(true);
  }, [uid]);

  if (!isInitialized) {
    return <OnboardingPageSkeleton />;
  }

  if (!user) {
    return (
      <div className="px-[var(--sp-3)] py-[var(--sp-6)]">
        <EmptyState
          title="Başlangıç rehberi"
          description="Kişiselleştirmeyi kaydetmek için oturum açın."
          actionLabel="Oturum aç"
          actionHref="/auth/login?next=/onboarding"
          tone="social"
          compact
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-[520px] px-[var(--sp-3)] py-[var(--sp-6)]">
        <div className="rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-4)] shadow-[var(--shadow-card)]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Hazır</p>
          <h1 className="mt-1 text-[18px] font-bold text-[var(--color-text)]">Piyasa kimliğiniz güncellendi</h1>
          <p className="mt-2 text-[13px] font-medium leading-snug text-[var(--color-text-secondary)]">Öneri motoru ve keşfet akışları yeni sinyallerle hizalanacak.</p>
          <div className="mt-4 flex flex-wrap gap-1">
            {catalog.nav_after.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sparseCatalog = catalog.identities.length === 0;
  if (sparseCatalog) {
    return (
      <div className="mx-auto w-full max-w-[440px] px-[var(--sp-3)] py-[var(--sp-5)]">
        <div className="rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-4)] shadow-[var(--shadow-card)]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-meta)]">Rehber</p>
          <p className="mt-1 text-[16px] font-bold text-[var(--color-text)]">Sunucu kataloğu bekleniyor</p>
          <p className="mt-2 text-[13px] font-medium leading-snug text-[var(--color-text-secondary)]">
            Bu ortamda adım adım onboarding RPC henüz bağlı değil. Akışı Ayarlar veya ana sayfadan sürdürebilirsiniz.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/settings"
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            >
              Ayarlar
            </Link>
            <Link href="/" className="rounded-full bg-[var(--color-text)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-surface)] hover:opacity-90">
              Ana akış
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = ["Kimlik", "Konular", "Üreticiler", "Temalar", "Stil", "Liste", "Özet"];

  return (
    <div className="mx-auto w-full max-w-[560px] px-[var(--sp-3)] py-[var(--sp-4)]">
      <div className="mb-[var(--sp-3)] flex flex-wrap gap-1">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold transition",
              step === i ? "bg-[var(--color-text)] text-[var(--color-surface)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
            )}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <div className="rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] px-[var(--sp-3)] py-[var(--sp-3)] shadow-[var(--shadow-card)]">
        <p className="text-[10px] font-bold uppercase text-[var(--color-meta)]">İlerleme {intel.progress_pct}%</p>
        <p className="mt-1 text-[11px] font-medium text-[var(--color-text-secondary)]">{intel.confidence_hint}</p>
        <p className="mt-0.5 text-[11px] font-medium text-[var(--color-meta)]">{intel.adaptive_hint}</p>

        {step === 0 ? (
          <div className="mt-3">
            <h2 className="text-[15px] font-bold text-[var(--color-text)]">Piyasa kimliği</h2>
            <p className="mt-1 text-[12px] font-medium text-[var(--color-text-secondary)]">Erken dönem öneri ağırlıklarınızı seçin.</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {catalog.identities.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, identity: it.id }))}
                  className={cn(
                    "max-w-full rounded-full border px-2.5 py-1 text-left text-[11px] font-bold transition",
                    draft.identity === it.id
                      ? "border-[var(--color-text)] bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] text-[var(--color-text)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
                  )}
                >
                  <span className="block">{it.label}</span>
                  <span className="mt-0.5 block text-[10px] font-medium text-[var(--color-meta)]">{it.sub}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase text-[var(--color-meta)]">Hızlı persona</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {catalog.personas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  title={p.subline}
                  onClick={() => applyPersona(p.preset)}
                  className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                >
                  {p.label}
                </button>
              ))}
            </div>
            {draft.identity === "creator" ? (
              <ul className="mt-3 space-y-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
                {catalog.creator_hints.map((h) => (
                  <li key={h}>· {h}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-3">
            <h2 className="text-[15px] font-bold text-[var(--color-text)]">İlgi konuları</h2>
            <div className="mt-2 flex flex-wrap gap-1">
              {catalog.topics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, interest_topic_ids: toggle(d.interest_topic_ids, t.id, 6) }))}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                    draft.interest_topic_ids.includes(t.id) ? "bg-[var(--color-text)] text-[var(--color-surface)]" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-3">
            <h2 className="text-[15px] font-bold text-[var(--color-text)]">Üretici takibi</h2>
            <div className="mt-2 flex flex-wrap gap-1">
              {catalog.creators.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, creator_ids: toggle(d.creator_ids, c.id, 5) }))}
                  className={cn(
                    "max-w-[11rem] truncate rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                    draft.creator_ids.includes(c.id) ? "bg-[var(--color-text)] text-[var(--color-surface)]" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-3">
            <h2 className="text-[15px] font-bold text-[var(--color-text)]">Piyasa temaları</h2>
            <div className="mt-2 flex flex-wrap gap-1">
              {catalog.market_themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, market_theme_ids: toggle(d.market_theme_ids, t.id, 4) }))}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                    draft.market_theme_ids.includes(t.id) ? "bg-[var(--color-text)] text-[var(--color-surface)]" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-3 space-y-3">
            <div>
              <h2 className="text-[15px] font-bold text-[var(--color-text)]">Sinyal stili</h2>
              <div className="mt-2 flex flex-wrap gap-1">
                {catalog.signal_styles.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, signal_style: s.id }))}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                      draft.signal_style === s.id ? "bg-[var(--color-text)] text-[var(--color-surface)]" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-[var(--color-text)]">Strateji</h3>
              <div className="mt-2 flex flex-wrap gap-1">
                {catalog.strategies.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, strategy: s.id }))}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                      draft.strategy === s.id ? "bg-[var(--color-text)] text-[var(--color-surface)]" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[12px] font-bold text-[var(--color-text)]" htmlFor="mm">
                Makro ↔ momentum
              </label>
              <input
                id="mm"
                type="range"
                min={-1}
                max={1}
                step={0.1}
                value={draft.macro_vs_momentum}
                onChange={(e) => setDraft((d) => ({ ...d, macro_vs_momentum: Number(e.target.value) }))}
                className="mt-2 w-full accent-[var(--color-primary-dark)]"
              />
              <p className="mt-1 text-[11px] font-medium text-[var(--color-meta)]">{intel.exploration_line}</p>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mt-3">
            <h2 className="text-[15px] font-bold text-[var(--color-text)]">Watchlist başlangıcı</h2>
            <div className="mt-2 flex flex-wrap gap-1">
              {catalog.watchlist_starter_symbols.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, watchlist_symbols: toggle(d.watchlist_symbols, sym, 6) }))}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                    draft.watchlist_symbols.includes(sym) ? "bg-[var(--color-text)] text-[var(--color-surface)]" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
                  )}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="mt-3 text-[12px] font-medium text-[var(--color-text-secondary)]">
            <p className="font-bold text-[var(--color-text)]">Özet</p>
            <p className="mt-2">
              Kimlik: {draft.identity ? catalog.identities.find((i) => i.id === draft.identity)?.label ?? draft.identity : "—"}
            </p>
            <p>Konular: {draft.interest_topic_ids.join(", ") || "—"}</p>
            <p>Üreticiler: {draft.creator_ids.length} seçim</p>
            <p>Temalar: {draft.market_theme_ids.join(", ") || "—"}</p>
            <p>Stil: {draft.signal_style ?? "—"} · Strateji: {draft.strategy ?? "—"}</p>
            <p>Liste: {draft.watchlist_symbols.join(", ") || "—"}</p>
            <p className="mt-2 text-[11px] text-[var(--color-meta)]">{intel.strategy_summary}</p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[color-mix(in_srgb,var(--color-border)_55%,transparent)] pt-3">
          <button type="button" className="text-[12px] font-bold text-[var(--color-text-secondary)] hover:underline" onClick={onSkip}>
            Şimdilik atla
          </button>
          <div className="flex flex-wrap gap-2">
            {step > 0 ? (
              <button type="button" className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]" onClick={() => setStep((s) => Math.max(0, s - 1))}>
                Geri
              </button>
            ) : null}
            {step < steps.length - 1 ? (
              <button type="button" className="rounded-full bg-[var(--color-text)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-surface)] hover:opacity-90" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>
                İleri
              </button>
            ) : (
              <button type="button" className="rounded-full bg-[var(--color-text)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-surface)] hover:opacity-90" onClick={onFinish}>
                Kaydet ve devam
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
