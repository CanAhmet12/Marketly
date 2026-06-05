/** Shared Studio surface tokens — dense, calm, creator-analytical (no “admin dashboard” chrome). */
export const studioUi = {
  /** Page column: prevent horizontal bleed on narrow viewports */
  page: "min-w-0 max-w-full overflow-x-hidden",
  /** Primary panel / card */
  panel:
    "rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
  panelPad: "p-[var(--sp-3)] min-[640px]:p-[var(--sp-4)]",
  /** Inline workflow / system hints */
  hint: "rounded-[10px] border border-[color-mix(in_srgb,var(--color-border)_82%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_4%,var(--color-surface-muted))] px-[var(--sp-3)] py-2 text-[12px] font-medium leading-snug text-[var(--color-text-secondary)]",
  /** List / table outer */
  listWrap: "overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
  divide: "divide-y divide-[color-mix(in_srgb,var(--color-divider)_65%,transparent)]",
} as const;
