"use client";

import { useMemo } from "react";

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
  groupStart?: boolean;
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
  onSelect: (id: SettingsSectionId) => void;
  hideStudio?: boolean;
  hideInterest?: boolean;
};

export function SettingsNavPanel({ active, onSelect, hideStudio, hideInterest }: Props) {
  const items = useMemo(() => {
    const flat: SettingsNavItem[] = [];
    for (const group of SETTINGS_NAV_GROUPS) {
      let groupStarted = false;
      for (const item of group.items) {
        if (item.id === "studio" && hideStudio) continue;
        if (item.id === "ilgi" && hideInterest) continue;
        flat.push({ ...item, groupStart: !groupStarted });
        groupStarted = true;
      }
    }
    return flat;
  }, [hideStudio, hideInterest]);

  return (
    <nav className="stg-nav-top" aria-label="Ayarlar bölümleri">
      <div className="stg-nav-segment" role="tablist">
        {items.map((item) => {
          const on = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-current={on ? "page" : undefined}
              onClick={() => onSelect(item.id)}
              className={cn("stg-nav-tab", on && "stg-nav-tab--active", item.groupStart && "stg-nav-tab--group-start")}
              data-tone={item.tone}
            >
              <span className="stg-nav-tab-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
