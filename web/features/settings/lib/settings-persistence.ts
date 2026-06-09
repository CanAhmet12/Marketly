import type { SettingsBundle } from "@/features/social/repository";
import { getDefaultMockSettings } from "@/mock/adapters/settings-preferences";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isWebWriteEnabled } from "@/lib/supabase/write-guard";

type ProfileSettingsRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email_notifications: boolean | null;
  email_digest_frequency: string | null;
  web_settings_json: Record<string, unknown> | null;
};

export type WebSettingsJson = {
  notifications?: Partial<Omit<SettingsBundle["notifications"], "push_enabled" | "email_digest">>;
  privacy?: Partial<SettingsBundle["privacy"]>;
  appearance?: Partial<SettingsBundle["appearance"]>;
  security?: Partial<SettingsBundle["security"]>;
};

function digestToBool(freq: string | null | undefined): boolean {
  return Boolean(freq && freq !== "never");
}

function boolToDigest(on: boolean, current: string | null | undefined): string {
  if (!on) return "never";
  if (current && current !== "never") return current;
  return "weekly";
}

function parseWebJson(raw: unknown): WebSettingsJson {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as WebSettingsJson;
}

/** profiles + web_settings_json → SettingsBundle parçaları */
export async function fetchSettingsFromDb(userId: string): Promise<Partial<SettingsBundle> | null> {
  try {
    const client = getSupabaseBrowserClient();

    const fullSelect =
      "id, username, full_name, bio, avatar_url, email_notifications, email_digest_frequency, web_settings_json";
    const basicSelect =
      "id, username, full_name, bio, avatar_url, email_notifications, email_digest_frequency";

    let row: ProfileSettingsRow | null = null;

    const fullRes = await client.from("profiles").select(fullSelect).eq("id", userId).maybeSingle();
    if (!fullRes.error && fullRes.data) {
      row = fullRes.data as ProfileSettingsRow;
    } else {
      const basicRes = await client.from("profiles").select(basicSelect).eq("id", userId).maybeSingle();
      if (basicRes.error || !basicRes.data) return null;
      row = { ...(basicRes.data as ProfileSettingsRow), web_settings_json: null };
    }

    const web = parseWebJson(row.web_settings_json);
    const defaults = getDefaultMockSettings({
      display_name: row.full_name,
      username: row.username,
      bio: row.bio,
      avatar_url: row.avatar_url,
    });

    return {
      profile: {
        display_name: row.full_name ?? defaults.profile.display_name,
        username: row.username ?? defaults.profile.username,
        bio: row.bio ?? defaults.profile.bio,
        avatar_url: row.avatar_url,
      },
      notifications: {
        ...defaults.notifications,
        ...(web.notifications ?? {}),
        push_enabled: row.email_notifications ?? defaults.notifications.push_enabled,
        email_digest: digestToBool(row.email_digest_frequency),
      },
      privacy: { ...defaults.privacy, ...(web.privacy ?? {}) },
      appearance: { ...defaults.appearance, ...(web.appearance ?? {}) },
      security: { ...defaults.security, ...(web.security ?? {}) },
    };
  } catch {
    return null;
  }
}

/** Kolon + JSONB birleşik kayıt */
export async function saveSettingsToDb(
  userId: string,
  patch: Partial<SettingsBundle>,
  current: SettingsBundle,
): Promise<void> {
  if (!isWebWriteEnabled()) return;

  try {
    const client = getSupabaseBrowserClient();
    const profilePatch: Record<string, unknown> = {};
    const nextNotifications = patch.notifications
      ? { ...current.notifications, ...patch.notifications }
      : current.notifications;
    const nextPrivacy = patch.privacy ? { ...current.privacy, ...patch.privacy } : current.privacy;
    const nextAppearance = patch.appearance ? { ...current.appearance, ...patch.appearance } : current.appearance;
    const nextSecurity = patch.security ? { ...current.security, ...patch.security } : current.security;

    const { push_enabled: _p, email_digest: _e, ...notifRest } = nextNotifications;
    const webJson: WebSettingsJson = {
      notifications: notifRest,
      privacy: nextPrivacy,
      appearance: nextAppearance,
      security: nextSecurity,
    };

    if (patch.profile) {
      if (patch.profile.display_name !== undefined) profilePatch.full_name = patch.profile.display_name;
      if (patch.profile.username !== undefined) profilePatch.username = patch.profile.username;
      if (patch.profile.bio !== undefined) profilePatch.bio = patch.profile.bio;
      if (patch.profile.avatar_url !== undefined) profilePatch.avatar_url = patch.profile.avatar_url;
    }

    if (patch.notifications) {
      if (patch.notifications.push_enabled !== undefined) {
        profilePatch.email_notifications = patch.notifications.push_enabled;
      }
      if (patch.notifications.email_digest !== undefined) {
        const { data: cur } = await client
          .from("profiles")
          .select("email_digest_frequency")
          .eq("id", userId)
          .maybeSingle();
        const curFreq = (cur as { email_digest_frequency?: string | null } | null)?.email_digest_frequency;
        profilePatch.email_digest_frequency = boolToDigest(
          patch.notifications.email_digest,
          curFreq ?? "weekly",
        );
      }
    }

    profilePatch.web_settings_json = webJson;

    if (Object.keys(profilePatch).length === 0) return;

    const { error } = await client.from("profiles").update(profilePatch).eq("id", userId);
    if (error?.message?.includes("web_settings_json")) {
      const { web_settings_json: _drop, ...withoutJson } = profilePatch;
      if (Object.keys(withoutJson).length > 0) {
        await client.from("profiles").update(withoutJson).eq("id", userId);
      }
    }
  } catch (e) {
    console.warn("[settings] save error", e);
  }
}
