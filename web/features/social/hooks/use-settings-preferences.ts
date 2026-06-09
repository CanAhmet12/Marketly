"use client";

import { useCallback, useEffect, useState } from "react";

import { getPersonalizationRepository } from "@/features/personalization/repository";
import { fetchSettingsFromDb, saveSettingsToDb } from "@/features/settings/lib/settings-persistence";
import type { SettingsBundle, SettingsProfileSeed } from "@/features/social/repository";
import { getSocialRepository } from "@/features/social/repository";
import { isMockDataEnabled } from "@/mock/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const repo = () => getSocialRepository();

export function useSettingsPreferences(userId: string, profileSeed: SettingsProfileSeed | null) {
  const [bundle, setBundle] = useState<SettingsBundle>(() => repo().getSettings(userId, profileSeed));
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const liveMode = !isMockDataEnabled() && isSupabaseConfigured();

  useEffect(() => {
    if (liveMode && userId) {
      fetchSettingsFromDb(userId).then((dbPrefs) => {
        setBundle((prev) => {
          const base = repo().getSettings(userId, profileSeed);
          if (!dbPrefs) return base;
          return {
            ...base,
            profile: { ...base.profile, ...dbPrefs.profile },
            notifications: { ...base.notifications, ...dbPrefs.notifications },
            privacy: { ...base.privacy, ...dbPrefs.privacy },
            appearance: { ...base.appearance, ...dbPrefs.appearance },
            security: { ...base.security, ...dbPrefs.security },
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

  const persist = useCallback(
    (next: SettingsBundle, patch: Partial<SettingsBundle>) => {
      if (liveMode && userId) {
        setSaveError(null);
        void saveSettingsToDb(userId, patch, next).catch(() => {
          setSaveError("Tercihler kaydedilemedi.");
        });
      }
    },
    [liveMode, userId],
  );

  const updateProfile = useCallback(
    (patch: Partial<SettingsBundle["profile"]>) => {
      setBundle((prev) => {
        const next = repo().updateSettings(userId, { profile: { ...prev.profile, ...patch } });
        persist(next, { profile: { ...prev.profile, ...patch } });
        return next;
      });
    },
    [userId, persist],
  );

  const updateNotifications = useCallback(
    (patch: Partial<SettingsBundle["notifications"]>) => {
      setBundle((prev) => {
        const next = repo().updateSettings(userId, { notifications: { ...prev.notifications, ...patch } });
        persist(next, { notifications: { ...prev.notifications, ...patch } });
        return next;
      });
    },
    [userId, persist],
  );

  const updatePrivacy = useCallback(
    (patch: Partial<SettingsBundle["privacy"]>) => {
      setBundle((prev) => {
        const next = repo().updateSettings(userId, { privacy: { ...prev.privacy, ...patch } });
        persist(next, { privacy: { ...prev.privacy, ...patch } });
        return next;
      });
    },
    [userId, persist],
  );

  const updateAppearance = useCallback(
    (patch: Partial<SettingsBundle["appearance"]>) => {
      setBundle((prev) => {
        const next = repo().updateSettings(userId, { appearance: { ...prev.appearance, ...patch } });
        persist(next, { appearance: { ...prev.appearance, ...patch } });
        return next;
      });
    },
    [userId, persist],
  );

  const updateSecurity = useCallback(
    (patch: Partial<SettingsBundle["security"]>) => {
      setBundle((prev) => {
        const next = repo().updateSettings(userId, { security: { ...prev.security, ...patch } });
        persist(next, { security: { ...prev.security, ...patch } });
        return next;
      });
    },
    [userId, persist],
  );

  const resetMock = useCallback(() => {
    getPersonalizationRepository().clearBehavioralMemory();
    setBundle(repo().resetSettings(userId));
  }, [userId]);

  return {
    bundle,
    hydrated,
    saveError,
    liveMode,
    updateProfile,
    updateNotifications,
    updatePrivacy,
    updateAppearance,
    updateSecurity,
    resetMock,
  };
}
