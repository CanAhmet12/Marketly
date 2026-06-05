"use client";

import { useCallback, useEffect, useState } from "react";

import { getPersonalizationRepository } from "@/features/personalization/repository";
import type { SettingsBundle, SettingsProfileSeed } from "@/features/social/repository";
import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isWebWriteEnabled } from "@/lib/supabase/write-guard";

const repo = () => getSocialRepository();

type ProfileDbRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email_notifications: boolean | null;
  email_digest_frequency: string | null;
};

/** BE-REP-004: profiles tablosundan kullanıcı ayarlarını yükle */
async function fetchProfileSettings(userId: string): Promise<Partial<SettingsBundle["profile"] & SettingsBundle["notifications"]> | null> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from("profiles")
      .select("id, username, full_name, bio, avatar_url, email_notifications, email_digest_frequency")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as ProfileDbRow;
    return {
      // profile fields
      display_name:  row.full_name ?? row.username ?? undefined,
      username:      row.username ?? undefined,
      bio:           row.bio ?? undefined,
      avatar_url:    row.avatar_url ?? undefined,
      // notification fields (mapped to bundle)
      push_enabled:  row.email_notifications ?? true,
    } as any;
  } catch {
    return null;
  }
}

/** BE-REP-004: profiles tablosuna güncelleme yaz — sadece kendi satırı */
async function saveProfileSettings(
  userId: string,
  profile: Partial<SettingsBundle["profile"]>,
  notifications?: Partial<SettingsBundle["notifications"]>,
): Promise<void> {
  // WG-002: write-gate — salt-okuma fazında profiles UPDATE bloke
  if (!isWebWriteEnabled()) return;
  try {
    const client = getSupabaseBrowserClient();
    const patch: Record<string, unknown> = {};
    if (profile.display_name !== undefined) patch.full_name = profile.display_name;
    if (profile.username     !== undefined) patch.username  = profile.username;
    if (profile.bio          !== undefined) patch.bio       = profile.bio;
    if (profile.avatar_url   !== undefined) patch.avatar_url = profile.avatar_url;
    if (notifications?.push_enabled !== undefined) patch.email_notifications = notifications.push_enabled;
    if (Object.keys(patch).length === 0) return;
    await client
      .from("profiles")
      .update(patch)
      .eq("id", userId); // RLS: authenticated user sadece kendi satırını güncelleyebilir
  } catch (e) {
    console.warn("[settings] profile save error", e);
  }
}

export function useSettingsPreferences(userId: string, profileSeed: SettingsProfileSeed | null) {
  const [bundle, setBundle] = useState<SettingsBundle>(() => repo().getSettings(userId, profileSeed));
  const [hydrated, setHydrated] = useState(false);
  const liveMode = !isMockDataEnabled() && isSupabaseConfigured();

  useEffect(() => {
    if (liveMode && userId) {
      // BE-REP-004: Supabase'den gerçek profil ayarlarını yükle
      fetchProfileSettings(userId).then((dbPrefs) => {
        setBundle((prev) => {
          const base = repo().getSettings(userId, profileSeed);
          return {
            ...base,
            profile: { ...base.profile, ...(dbPrefs ?? {}) },
          };
        });
        setHydrated(true);
      });
    } else {
      queueMicrotask(() => {
        setBundle(repo().getSettings(userId, profileSeed));
        setHydrated(true);
      });
    }
  }, [userId, profileSeed, liveMode]);

  const updateProfile = useCallback(
    (patch: Partial<SettingsBundle["profile"]>) => {
      setBundle((prev) => {
        const next = repo().updateSettings(userId, { profile: { ...prev.profile, ...patch } });
        // BE-REP-004: live modda Supabase'e de yaz
        if (liveMode) saveProfileSettings(userId, patch);
        return next;
      });
    },
    [userId, liveMode],
  );

  const updateNotifications = useCallback(
    (patch: Partial<SettingsBundle["notifications"]>) => {
      setBundle((prev) => {
        const next = repo().updateSettings(userId, { notifications: { ...prev.notifications, ...patch } });
        // BE-REP-004: live modda email_notifications Supabase'e yaz
        if (liveMode) saveProfileSettings(userId, {}, patch);
        return next;
      });
    },
    [userId, liveMode],
  );

  const updatePrivacy = useCallback(
    (patch: Partial<SettingsBundle["privacy"]>) => {
      setBundle((prev) => repo().updateSettings(userId, { privacy: { ...prev.privacy, ...patch } }));
    },
    [userId],
  );

  const updateAppearance = useCallback(
    (patch: Partial<SettingsBundle["appearance"]>) => {
      setBundle((prev) => repo().updateSettings(userId, { appearance: { ...prev.appearance, ...patch } }));
    },
    [userId],
  );

  const updateSecurity = useCallback(
    (patch: Partial<SettingsBundle["security"]>) => {
      setBundle((prev) => repo().updateSettings(userId, { security: { ...prev.security, ...patch } }));
    },
    [userId],
  );

  const resetMock = useCallback(() => {
    getPersonalizationRepository().clearBehavioralMemory();
    setBundle(repo().resetSettings(userId));
  }, [userId]);

  return {
    bundle,
    hydrated,
    updateProfile,
    updateNotifications,
    updatePrivacy,
    updateAppearance,
    updateSecurity,
    resetMock,
  };
}
