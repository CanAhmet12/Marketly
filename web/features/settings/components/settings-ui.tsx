"use client";

import Link from "next/link";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/* ── Toggle ── */

export function SettingsToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn("stg-toggle", on ? "stg-toggle--on" : "stg-toggle--off")}
    >
      <span className="stg-toggle-knob" />
    </button>
  );
}

export function SettingsToggleRow({
  label,
  sub,
  on,
  onChange,
}: {
  label: string;
  sub?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="stg-toggle-row">
      <div className="stg-toggle-row-text">
        <div className="stg-toggle-label">{label}</div>
        {sub ? <div className="stg-toggle-sub">{sub}</div> : null}
      </div>
      <SettingsToggle on={on} onChange={onChange} />
    </div>
  );
}

export function SettingsAccordion({
  title,
  hint,
  defaultOpen = true,
  children,
  className,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={cn("stg-accordion", className)} open={defaultOpen}>
      <summary className="stg-accordion-summary">
        <span>{title}</span>
        {hint ? <span className="stg-accordion-hint">{hint}</span> : null}
      </summary>
      <div className="stg-accordion-body">{children}</div>
    </details>
  );
}

export function SettingsToggleGroup(props: Omit<React.ComponentProps<typeof SettingsAccordion>, "className">) {
  return (
    <SettingsAccordion {...props}>
      <div className="stg-toggles">{props.children}</div>
    </SettingsAccordion>
  );
}

export function SettingsFormGroup(props: Omit<React.ComponentProps<typeof SettingsAccordion>, "className">) {
  return (
    <SettingsAccordion {...props}>
      <div className="stg-form-stack">{props.children}</div>
    </SettingsAccordion>
  );
}

/* ── Section chrome ── */

export function SettingsSectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <header className="stg-section-head">
      <h2 id="stg-active-section-title" className="stg-section-title">{title}</h2>
      {desc ? <p className="stg-section-desc">{desc}</p> : null}
    </header>
  );
}

export function SettingsHydrationBadge({ children }: { children: ReactNode }) {
  return <div className="stg-hydration">{children}</div>;
}

export function SettingsInfoBox({ children }: { children: ReactNode }) {
  return <div className="stg-info">{children}</div>;
}

export function SettingsEmptyHint({
  title,
  desc,
  actionLabel,
  actionHref,
}: {
  title: string;
  desc?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="stg-empty-hint">
      <div className="stg-empty-hint-icon" aria-hidden>◇</div>
      <div className="stg-empty-hint-body">
        <div className="stg-empty-hint-title">{title}</div>
        {desc ? <p className="stg-empty-hint-desc">{desc}</p> : null}
        {actionLabel && actionHref ? (
          <Link href={actionHref} className="stg-empty-hint-action">{actionLabel}</Link>
        ) : null}
      </div>
    </div>
  );
}

export function SettingsCardBlock({
  title,
  desc,
  children,
  accent,
}: {
  title?: string;
  desc?: string;
  children?: ReactNode;
  accent?: "security" | "studio" | "data" | "personal" | "billing";
}) {
  return (
    <div className="stg-card-block" data-accent={accent}>
      {title ? <div className="stg-card-block-title">{title}</div> : null}
      {desc ? <p className="stg-card-block-desc">{desc}</p> : null}
      {children}
    </div>
  );
}

/* ── Fields ── */

export function SettingsField({
  label,
  hint,
  children,
  wide,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn("stg-field", wide && "stg-field--wide")}>
      <label className="stg-label">{label}</label>
      {children}
      {hint ? <div className="stg-field-hint">{hint}</div> : null}
    </div>
  );
}

export function SettingsTextInput({
  label,
  hint,
  wide,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; wide?: boolean }) {
  return (
    <SettingsField label={label} hint={hint} wide={wide}>
      <input className={cn("stg-input", className)} {...props} />
    </SettingsField>
  );
}

export function SettingsTextarea({
  label,
  hint,
  wide,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; wide?: boolean }) {
  return (
    <SettingsField label={label} hint={hint} wide={wide}>
      <textarea className={cn("stg-textarea", className)} {...props} />
    </SettingsField>
  );
}

export function SettingsSelect({
  label,
  hint,
  wide,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; wide?: boolean; children: ReactNode }) {
  return (
    <SettingsField label={label} hint={hint} wide={wide}>
      <select className={cn("stg-select", className)} {...props}>{children}</select>
    </SettingsField>
  );
}

/* ── Meta cards (Upload DNA) ── */

export function SettingsMetaGrid({ children }: { children: ReactNode }) {
  return <div className="stg-meta-grid">{children}</div>;
}

export function SettingsMetaCard({
  icon,
  label,
  accent,
  children,
  wide,
}: {
  icon: string;
  label: string;
  accent?: "name" | "handle" | "avatar" | "security" | "billing";
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn("stg-meta-card", wide && "stg-meta-card--wide")} data-accent={accent}>
      <span className="stg-meta-card-icon" aria-hidden>{icon}</span>
      <div className="stg-meta-card-body">
        <span className="stg-meta-card-label">{label}</span>
        {children}
      </div>
    </div>
  );
}

export function SettingsMetaInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="stg-meta-card-input" {...props} />;
}

/* ── Stats ── */

export function SettingsStatsGrid({ children }: { children: ReactNode }) {
  return <div className="stg-stats-grid">{children}</div>;
}

export function SettingsStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stg-stat">
      <div className="stg-stat-label">{label}</div>
      <div className="stg-stat-value">{value}</div>
    </div>
  );
}

export function SettingsStatWide({ label, value }: { label: string; value: string }) {
  return (
    <div className="stg-stat stg-stat--wide">
      <div className="stg-stat-label">{label}</div>
      <div className="stg-stat-value">{value}</div>
    </div>
  );
}

/* ── Quick links ── */

export function SettingsQuickLinks({ children }: { children: ReactNode }) {
  return <div className="stg-quick-links">{children}</div>;
}

export function SettingsQuickLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="stg-quick-link">{children}</Link>;
}

/* ── Buttons ── */

export function SettingsBtnRow({ children }: { children: ReactNode }) {
  return <div className="stg-btn-row">{children}</div>;
}

type BtnVariant = "outline" | "ghost" | "danger" | "danger-muted";

export function SettingsButton({
  children,
  variant = "outline",
  href,
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  variant?: BtnVariant;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const cls = cn(
    "stg-btn",
    variant === "outline" && "stg-btn--outline",
    variant === "ghost" && "stg-btn--ghost",
    variant === "danger" && "stg-btn--danger",
    variant === "danger-muted" && "stg-btn--outline stg-btn--danger-muted",
  );

  if (href) {
    return <Link href={href} className={cls}>{children}</Link>;
  }

  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

/* ── User card ── */

export function SettingsUserCard({
  initials,
  displayName,
  email,
}: {
  initials: string;
  displayName: string;
  email?: string;
}) {
  return (
    <div className="stg-user-card">
      <div className="stg-user-avatar">{initials}</div>
      <div className="stg-user-meta">
        <div className="stg-user-name">{displayName}</div>
        {email ? <div className="stg-user-email">{email}</div> : null}
      </div>
    </div>
  );
}

/* ── Intel / muted ── */

export function SettingsIntelTable({ children }: { children: ReactNode }) {
  return <div className="stg-intel-table">{children}</div>;
}

export function SettingsIntelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="stg-intel-row">
      <span className="stg-intel-key">{label}</span>
      <span className="stg-intel-val">{value}</span>
    </div>
  );
}

export function SettingsMutedBox({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="stg-muted-box">
      <div className="stg-muted-title">{title}</div>
      {lines.map((line) => (
        <div key={line} className="stg-muted-line">{line}</div>
      ))}
    </div>
  );
}

/* ── Membership ── */

export function SettingsMembershipList({ children }: { children: ReactNode }) {
  return <div className="stg-membership-list">{children}</div>;
}

export function SettingsMembershipItem({
  title,
  sub,
  href,
}: {
  title: string;
  sub: string;
  href: string;
}) {
  return (
    <div className="stg-membership-item">
      <div className="stg-membership-body">
        <div className="stg-membership-title">{title}</div>
        <div className="stg-membership-sub">{sub}</div>
      </div>
      <Link href={href} className="stg-membership-link">Aç →</Link>
    </div>
  );
}

/* ── Creator ── */

export function SettingsCreatorBlock({
  headline,
  bullets,
  links,
}: {
  headline: string;
  bullets: string[];
  links: { upload: string; subscriptions: string; close_friends: string };
}) {
  return (
    <div className="stg-creator-block">
      <div className="stg-creator-title">{headline}</div>
      <ul className="stg-creator-bullets">
        {bullets.map((b) => (
          <li key={b} className="stg-creator-bullet">{b}</li>
        ))}
      </ul>
      <div className="stg-creator-links">
        <Link href={links.upload} className="stg-creator-link">Yayınla</Link>
        <Link href={links.subscriptions} className="stg-creator-link stg-creator-link--muted">Üyelik</Link>
        <Link href={links.close_friends} className="stg-creator-link stg-creator-link--muted">Özel Daireler</Link>
      </div>
    </div>
  );
}

/* ── Export / danger ── */

export function SettingsExportBlock({
  title,
  desc,
  actionLabel,
  disabled,
  onAction,
}: {
  title: string;
  desc: string;
  actionLabel: string;
  disabled?: boolean;
  onAction?: () => void;
}) {
  return (
    <div className="stg-export-block">
      <div className="stg-export-title">{title}</div>
      <p className="stg-export-desc">{desc}</p>
      <SettingsButton variant="outline" disabled={disabled} onClick={onAction}>{actionLabel}</SettingsButton>
    </div>
  );
}

export function SettingsDangerZone({
  title,
  desc,
  actionLabel,
  disabled,
  onAction,
}: {
  title: string;
  desc: string;
  actionLabel: string;
  disabled?: boolean;
  onAction?: () => void;
}) {
  return (
    <div className="stg-danger-zone">
      <div className="stg-danger-zone-title">{title}</div>
      <p className="stg-danger-zone-desc">{desc}</p>
      <SettingsButton variant="danger" disabled={disabled} onClick={onAction}>{actionLabel}</SettingsButton>
    </div>
  );
}
