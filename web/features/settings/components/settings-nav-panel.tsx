"use client";

import type { SettingsSectionId } from "@/features/settings/settings-section-params";
import {
  SettingsIconBildirim,
  SettingsIconGizlilik,
  SettingsIconGorunum,
  SettingsIconGuvenlik,
  SettingsIconHesap,
  SettingsIconIlgi,
  SettingsIconKisisel,
  SettingsIconProfil,
  SettingsIconStudio,
  SettingsIconUyelik,
  SettingsIconVeri,
} from "@/features/settings/components/settings-nav-icons";
import { cn } from "@/lib/cn";

export type SettingsNavItem = {
  id: SettingsSectionId;
  label: string;
  tone: string;
  Icon: typeof SettingsIconHesap;
};

export type SettingsNavGroup = {
  title: string;
  items: SettingsNavItem[];
};

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    title: "Hesap",
    items: [
      { id: "hesap", label: "Genel Bakış", tone: "overview", Icon: SettingsIconHesap },
      { id: "profil", label: "Profil", tone: "profile", Icon: SettingsIconProfil },
      { id: "uyelik", label: "Üyelik", tone: "membership", Icon: SettingsIconUyelik },
      { id: "studio", label: "Studio", tone: "studio", Icon: SettingsIconStudio },
    ],
  },
  {
    title: "Tercihler",
    items: [
      { id: "bildirimler", label: "Bildirimler", tone: "notify", Icon: SettingsIconBildirim },
      { id: "gizlilik", label: "Gizlilik", tone: "privacy", Icon: SettingsIconGizlilik },
      { id: "gorunum", label: "Görünüm", tone: "appearance", Icon: SettingsIconGorunum },
      { id: "guvenlik", label: "Güvenlik", tone: "security", Icon: SettingsIconGuvenlik },
    ],
  },
  {
    title: "Kişiselleştirme",
    items: [
      { id: "kisisellesme", label: "Yönetim", tone: "personal", Icon: SettingsIconKisisel },
      { id: "ilgi", label: "İlgi Profili", tone: "interest", Icon: SettingsIconIlgi },
    ],
  },
  {
    title: "Veri",
    items: [{ id: "veri", label: "Veri & Hesap", tone: "data", Icon: SettingsIconVeri }],
  },
];

type Props = {
  active: SettingsSectionId;
  displayName?: string;
  initials?: string;
  email?: string;
  onSelect: (id: SettingsSectionId) => void;
  hideStudio?: boolean;
  hideInterest?: boolean;
};

export function SettingsNavPanel({
  active,
  displayName,
  initials,
  email,
  onSelect,
  hideStudio,
  hideInterest,
}: Props) {
  return (
    <nav className="stg-nav" aria-label="Ayarlar bölümleri">
      {displayName ? (
        <div className="stg-nav-user">
          <div className="stg-nav-avatar">{initials || "CR"}</div>
          <div className="stg-nav-user-meta">
            <span className="stg-nav-user-name">{displayName}</span>
            {email ? <span className="stg-nav-user-email">{email}</span> : null}
          </div>
        </div>
      ) : null}

      {SETTINGS_NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => {
          if (item.id === "studio" && hideStudio) return false;
          if (item.id === "ilgi" && hideInterest) return false;
          return true;
        });
        if (items.length === 0) return null;

        return (
          <div key={group.title} className="stg-nav-group">
            <p className="stg-nav-group-title">{group.title}</p>
            <div className="stg-nav-list">
              {items.map((item) => {
                const on = active === item.id;
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={on ? "page" : undefined}
                    onClick={() => onSelect(item.id)}
                    className={cn("stg-nav-item", on && "stg-nav-item--active")}
                    data-tone={item.tone}
                  >
                    <span className="stg-nav-item-icon" aria-hidden>
                      <Icon />
                    </span>
                    <span className="stg-nav-item-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
