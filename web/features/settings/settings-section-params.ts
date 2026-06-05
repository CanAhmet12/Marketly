export type SettingsSectionId =
  | "hesap"
  | "profil"
  | "bildirimler"
  | "gizlilik"
  | "gorunum"
  | "guvenlik"
  | "kisisellesme"
  | "ilgi"
  | "uyelik"
  | "studio"
  | "veri";

const SECTIONS: readonly SettingsSectionId[] = [
  "hesap",
  "profil",
  "bildirimler",
  "gizlilik",
  "gorunum",
  "guvenlik",
  "kisisellesme",
  "ilgi",
  "uyelik",
  "studio",
  "veri",
];

export function resolveSettingsSection(raw: string | null): SettingsSectionId {
  if (!raw) return "hesap";
  if ((SECTIONS as readonly string[]).includes(raw)) return raw as SettingsSectionId;
  return "hesap";
}

export function settingsSectionToParam(id: SettingsSectionId): string | null {
  return id === "hesap" ? null : id;
}
