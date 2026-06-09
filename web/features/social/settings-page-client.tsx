"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { HubPageShell } from "@/features/hub/components/hub-page-shell";
import { SettingsAvatarUpload, SettingsAvatarUploadHint } from "@/features/settings/components/settings-avatar-upload";
import { SettingsDataActions } from "@/features/settings/components/settings-data-actions";
import { SettingsNavPanel } from "@/features/settings/components/settings-nav-panel";
import { SettingsPageHeader } from "@/features/settings/components/settings-page-header";
import { SettingsSecurityActions } from "@/features/settings/components/settings-security-actions";
import {
  SettingsBtnRow,
  SettingsButton,
  SettingsCardBlock,
  SettingsCreatorBlock,
  SettingsEmptyHint,
  SettingsFormGroup,
  SettingsHydrationBadge,
  SettingsInfoBox,
  SettingsIntelRow,
  SettingsIntelTable,
  SettingsMembershipItem,
  SettingsMembershipList,
  SettingsMetaCard,
  SettingsMetaGrid,
  SettingsMetaInput,
  SettingsMutedBox,
  SettingsQuickLink,
  SettingsQuickLinks,
  SettingsSectionHeader,
  SettingsSelect,
  SettingsStat,
  SettingsStatsGrid,
  SettingsStatWide,
  SettingsTextarea,
  SettingsToggleGroup,
  SettingsToggleRow,
  SettingsUserCard,
} from "@/features/settings/components/settings-ui";
import {
  SettingsPageSkeleton,
  SettingsSectionSkeleton,
  SettingsUnauthShell,
} from "@/features/settings/components/settings-states";
import { InterestProfileStrip } from "@/features/personalization/components/interest-profile-strip";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { useSettingsHubLive } from "@/features/settings/hooks/use-settings-hub-live";
import { getSettingsRepository } from "@/features/settings/repository";
import {
  resolveSettingsSection,
  settingsSectionToParam,
  type SettingsSectionId,
} from "@/features/settings/settings-section-params";
import { useSettingsPreferences } from "@/features/social/hooks/use-settings-preferences";
import { cn } from "@/lib/cn";
import { isMockDataEnabled } from "@/mock/config";

/* ───────────────────────────────────────────────── types */

type SectionId = SettingsSectionId;

/* ───────────────────────────────────────────────── main */

export function SettingsPageClient() {
  const mockOn = isMockDataEnabled();
  const pSnap = usePersonalizationSnapshot();
  const { user, profile, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const uid = user?.id ?? "";
  const settingsRepo = useMemo(() => getSettingsRepository(), []);
  const [resetTick, setResetTick] = useState(0);

  const activeSection = useMemo(() => resolveSettingsSection(searchParams.get("section")), [searchParams]);

  const pushSection = useCallback(
    (id: SectionId) => {
      const sp = new URLSearchParams(searchParams.toString());
      const param = settingsSectionToParam(id);
      if (param) sp.set("section", param);
      else sp.delete("section");
      const qs = sp.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const seed = useMemo(
    () =>
      profile
        ? {
            display_name: profile.full_name ?? user?.displayName ?? null,
            username: profile.username ?? user?.username ?? null,
            bio: profile.bio,
            avatar_url: profile.avatar_url ?? user?.avatarUrl ?? null,
          }
        : user
          ? { display_name: user.displayName, username: user.username ?? null, bio: null, avatar_url: user.avatarUrl ?? null }
          : null,
    [profile, user],
  );

  const { bundle, hydrated, saveError, liveMode, updateProfile, updateNotifications, updatePrivacy, updateAppearance, updateSecurity, resetMock } =
    useSettingsPreferences(uid, seed);

  const baseHub = useMemo(() => {
    void resetTick;
    void pSnap.recommendRev;
    void pSnap.adaptiveRev;
    void pSnap.feedbackRev;
    void pSnap.explorationRev;
    void pSnap.watchRev;
    void pSnap.affinity.meta.eventCount;
    void mockOn;
    return settingsRepo.getAccountControlHub(user?.id ?? null);
  }, [
    settingsRepo, user?.id, resetTick,
    pSnap.recommendRev, pSnap.adaptiveRev, pSnap.feedbackRev,
    pSnap.explorationRev, pSnap.watchRev, pSnap.affinity.meta.eventCount, mockOn,
  ]);

  const { hub } = useSettingsHubLive(baseHub, user?.id ?? null, profile, bundle.notifications);

  const bump = useCallback(() => setResetTick((t) => t + 1), []);

  useEffect(() => {
    if (!user) return;
    if (activeSection === "studio" && !hub.creator.visible) pushSection("hesap");
  }, [activeSection, hub.creator.visible, user, pushSection]);

  const onResetFull     = useCallback(() => { settingsRepo.resetFullPersonalization();         bump(); }, [settingsRepo, bump]);
  const onResetRec      = useCallback(() => { settingsRepo.resetRecommendationMemory();        bump(); }, [settingsRepo, bump]);
  const onResetAdaptive = useCallback(() => { settingsRepo.resetAdaptiveLearningMemory();      bump(); }, [settingsRepo, bump]);

  const displayName = user?.displayName || user?.username || user?.email?.split("@")[0] || "";
  const initials    = displayName.slice(0, 2).toUpperCase() || "CR";

  const loginNext = pathname?.startsWith("/hub") ? pathname : "/hub/settings";

  const pageHeader = (
    <SettingsPageHeader
      mockOn={mockOn}
      onResetDemo={mockOn ? () => { resetMock(); bump(); } : undefined}
    />
  );

  /* ── loading / unauth ──────────────────────── */

  if (!isInitialized) {
    return (
      <HubPageShell zone="tools" className="hp-canvas--embedded-settings" header={pageHeader}>
        <SettingsPageSkeleton />
      </HubPageShell>
    );
  }

  if (!user) {
    return (
      <HubPageShell zone="tools" className="hp-canvas--embedded-settings" header={pageHeader}>
        <SettingsUnauthShell>
          <EmptyState
            title="Oturum gerekli"
            description="Hesap kontrolü ve kişiselleştirme yönetimi için giriş yap."
            actionLabel="Oturum aç"
            actionHref={`/auth/login?next=${encodeURIComponent(loginNext)}`}
            tone="social"
            compact
          />
        </SettingsUnauthShell>
      </HubPageShell>
    );
  }

  /* ── section renderers ─────────────────────── */

  function renderSection() {
    switch (activeSection) {

      /* ── HESAP ── */
      case "hesap":
        return (
          <>
            <SettingsSectionHeader title="Hesap Genel Bakış" desc={hub.subline} />

            {hydrated ? (
              <SettingsHydrationBadge>
                {mockOn ? "Demo modu — tercihler tarayıcıda kaydedilir." : "Canlı mod — oturum içi tercihler."}
              </SettingsHydrationBadge>
            ) : null}

            <SettingsUserCard initials={initials} displayName={displayName} email={user?.email ?? undefined} />

            <SettingsStatsGrid>
              <SettingsStat label="Güven" value={hub.account_overview.trust_line} />
              <SettingsStat label="Doğrulama" value={hub.account_overview.verification_line} />
              <SettingsStat label="Premium" value={hub.account_overview.premium_line} />
              <SettingsStat label="Oturum" value={hub.account_overview.session_hint} />
              <SettingsStatWide label="Giriş geçmişi" value={hub.account_overview.login_history_hint} />
            </SettingsStatsGrid>

            <SettingsQuickLinks>
              <SettingsQuickLink href={hub.links.subscriptions}>Üyelikler</SettingsQuickLink>
              <SettingsQuickLink href={hub.links.close_friends}>Özel Daireler</SettingsQuickLink>
              <SettingsQuickLink href={hub.links.notifications}>Bildirimler</SettingsQuickLink>
              <SettingsQuickLink href={hub.links.messages}>Mesajlar</SettingsQuickLink>
              <SettingsQuickLink href="/saved">Kaydedilenler</SettingsQuickLink>
              <SettingsQuickLink href="/price-alerts">Fiyat Alarmları</SettingsQuickLink>
              <SettingsQuickLink href={hub.links.discover}>Keşfet</SettingsQuickLink>
            </SettingsQuickLinks>
          </>
        );

      /* ── PROFİL ── */
      case "profil":
        return (
          <>
            <SettingsSectionHeader title="Profil" desc="Görünen adın, kullanıcı adın ve biyografini yönet." />

            {liveMode ? (
              <SettingsAvatarUpload
                avatarUrl={bundle.profile.avatar_url}
                initials={initials}
                onUploaded={(url) => updateProfile({ avatar_url: url })}
              />
            ) : null}

            <SettingsMetaGrid>
              <SettingsMetaCard icon="✦" label="Görünen ad" accent="name">
                <SettingsMetaInput
                  value={bundle.profile.display_name ?? ""}
                  onChange={(e) => updateProfile({ display_name: e.target.value })}
                  placeholder="Adın"
                />
              </SettingsMetaCard>
              <SettingsMetaCard icon="@" label="Kullanıcı adı" accent="handle">
                <SettingsMetaInput
                  value={bundle.profile.username ?? ""}
                  onChange={(e) => updateProfile({ username: e.target.value })}
                  placeholder="@kullanici"
                />
              </SettingsMetaCard>
              {!liveMode ? (
                <SettingsMetaCard icon="◉" label="Avatar URL" accent="avatar" wide>
                  <SettingsMetaInput
                    value={bundle.profile.avatar_url ?? ""}
                    onChange={(e) => updateProfile({ avatar_url: e.target.value || null })}
                    placeholder="https://…"
                  />
                </SettingsMetaCard>
              ) : null}
            </SettingsMetaGrid>

            <SettingsTextarea
              label="Biyografi"
              wide
              value={bundle.profile.bio ?? ""}
              onChange={(e) => updateProfile({ bio: e.target.value })}
              placeholder="Kendin hakkında kısa bir açıklama…"
            />

            <SettingsAvatarUploadHint mockOn={mockOn} />
            <SettingsButton variant="ghost" href="/profile">Profil sayfasına git →</SettingsButton>
          </>
        );

      /* ── BİLDİRİMLER ── */
      case "bildirimler":
        return (
          <>
            <SettingsSectionHeader title="Bildirimler & Uyarılar" desc="Hangi bildirimleri almak istediğini seç." />

            <SettingsToggleGroup title="Genel" hint="2 seçenek">
              <SettingsToggleRow label="Anlık bildirimler" sub="Push bildirimleri etkinleştir" on={bundle.notifications.push_enabled} onChange={(v) => updateNotifications({ push_enabled: v })} />
              <SettingsToggleRow label="E-posta özeti" sub="Haftalık özet e-postası" on={bundle.notifications.email_digest} onChange={(v) => updateNotifications({ email_digest: v })} />
            </SettingsToggleGroup>

            <SettingsToggleGroup title="Sosyal" hint="6 seçenek">
              <SettingsToggleRow label="Beğeni" on={bundle.notifications.likes} onChange={(v) => updateNotifications({ likes: v })} />
              <SettingsToggleRow label="Yorum" on={bundle.notifications.comments} onChange={(v) => updateNotifications({ comments: v })} />
              <SettingsToggleRow label="Takip" on={bundle.notifications.follows} onChange={(v) => updateNotifications({ follows: v })} />
              <SettingsToggleRow label="Mesajlar" on={bundle.notifications.messages} onChange={(v) => updateNotifications({ messages: v })} />
              <SettingsToggleRow label="Tartışma uyarıları" on={bundle.notifications.discussion_alerts} onChange={(v) => updateNotifications({ discussion_alerts: v })} />
              <SettingsToggleRow label="Oda aktivitesi" on={bundle.notifications.room_activity} onChange={(v) => updateNotifications({ room_activity: v })} />
            </SettingsToggleGroup>

            <SettingsToggleGroup title="Finans & Piyasa" hint="5 seçenek">
              <SettingsToggleRow label="Sinyaller" on={bundle.notifications.signals} onChange={(v) => updateNotifications({ signals: v })} />
              <SettingsToggleRow label="Piyasa" on={bundle.notifications.market} onChange={(v) => updateNotifications({ market: v })} />
              <SettingsToggleRow label="İzleme listesi uyarıları" on={bundle.notifications.watchlist_alerts} onChange={(v) => updateNotifications({ watchlist_alerts: v })} />
              <SettingsToggleRow label="Portföy uyarıları" on={bundle.notifications.portfolio_alerts} onChange={(v) => updateNotifications({ portfolio_alerts: v })} />
              <SettingsToggleRow label="Makro uyarıları" on={bundle.notifications.macro_alerts} onChange={(v) => updateNotifications({ macro_alerts: v })} />
            </SettingsToggleGroup>

            <SettingsToggleGroup title="Creator" hint="3 seçenek" defaultOpen={false}>
              <SettingsToggleRow label="Canlı yayın" on={bundle.notifications.live} onChange={(v) => updateNotifications({ live: v })} />
              <SettingsToggleRow label="Üretici özeti" on={bundle.notifications.creator_digest} onChange={(v) => updateNotifications({ creator_digest: v })} />
              <SettingsToggleRow label="Premium güncellemeler" on={bundle.notifications.premium_updates} onChange={(v) => updateNotifications({ premium_updates: v })} />
            </SettingsToggleGroup>

            <SettingsQuickLinks>
              <SettingsQuickLink href="/price-alerts">Fiyat alarmlarını yönet →</SettingsQuickLink>
              <SettingsQuickLink href="/saved">Kaydedilenler →</SettingsQuickLink>
              <SettingsQuickLink href="/notifications">Bildirim geçmişi →</SettingsQuickLink>
            </SettingsQuickLinks>
          </>
        );

      /* ── GİZLİLİK ── */
      case "gizlilik":
        return (
          <>
            <SettingsSectionHeader title="Gizlilik & Görünürlük" desc="Başkalarının seni nasıl gördüğünü kontrol et." />

            <SettingsToggleGroup title="Profil" hint="4 seçenek">
              <SettingsToggleRow label="Profil herkese açık" on={bundle.privacy.profile_public} onChange={(v) => updatePrivacy({ profile_public: v })} />
              <SettingsToggleRow label="Aktiviteyi göster" on={bundle.privacy.show_activity} onChange={(v) => updatePrivacy({ show_activity: v })} />
              <SettingsToggleRow label="Takip listesi herkese açık" on={bundle.privacy.follow_list_public} onChange={(v) => updatePrivacy({ follow_list_public: v })} />
              <SettingsToggleRow label="Premium rozet görünür" on={bundle.privacy.premium_visibility} onChange={(v) => updatePrivacy({ premium_visibility: v })} />
            </SettingsToggleGroup>

            <SettingsToggleGroup title="Mesajlaşma & Aktivite" hint="3 seçenek">
              <SettingsToggleRow label="Okundu bilgisi" on={bundle.privacy.read_receipts} onChange={(v) => updatePrivacy({ read_receipts: v })} />
              <SettingsToggleRow label="İzleme aktivitesi görünür" on={bundle.privacy.watch_activity_visible} onChange={(v) => updatePrivacy({ watch_activity_visible: v })} />
              <SettingsToggleRow label="Oda katılımı görünür" on={bundle.privacy.room_participation_visible} onChange={(v) => updatePrivacy({ room_participation_visible: v })} />
            </SettingsToggleGroup>

            <SettingsToggleGroup title="Finans" hint="2 seçenek" defaultOpen={false}>
              <SettingsToggleRow label="Sinyal kopyası görünür" on={bundle.privacy.signal_copy_visible} onChange={(v) => updatePrivacy({ signal_copy_visible: v })} />
              <SettingsToggleRow label="Özel daireler görünür" on={bundle.privacy.private_circle_visible} onChange={(v) => updatePrivacy({ private_circle_visible: v })} />
            </SettingsToggleGroup>

            <SettingsFormGroup title="Detaylı ayarlar" hint="2 alan" defaultOpen={false}>
              <SettingsSelect
                label="Bahsetmeye izin ver"
                value={bundle.privacy.allow_mentions_from}
                onChange={(e) => updatePrivacy({ allow_mentions_from: e.target.value as typeof bundle.privacy.allow_mentions_from })}
              >
                <option value="everyone">Herkes</option>
                <option value="followers">Takipçiler</option>
                <option value="none">Kapalı</option>
              </SettingsSelect>
              <SettingsSelect
                label="Tartışma görünürlüğü"
                value={bundle.privacy.discussion_visibility}
                onChange={(e) => updatePrivacy({ discussion_visibility: e.target.value as typeof bundle.privacy.discussion_visibility })}
              >
                <option value="public">Herkese açık</option>
                <option value="followers">Takipçiler</option>
                <option value="private">Kapalı / davetli</option>
              </SettingsSelect>
            </SettingsFormGroup>

            <SettingsButton variant="ghost" href="/close-friends">Özel Daireler →</SettingsButton>
          </>
        );

      /* ── GÖRÜNÜM ── */
      case "gorunum":
        return (
          <>
            <SettingsSectionHeader title="Görünüm" desc="Arayüz tercihlerini ayarla." />
            <SettingsToggleGroup title="Arayüz" hint="2 seçenek">
              <SettingsToggleRow label="Kompakt akış" sub="Daha az boşlukla daha fazla içerik göster" on={bundle.appearance.compact_feed} onChange={(v) => updateAppearance({ compact_feed: v })} />
              <SettingsToggleRow label="Hareketi azalt" sub="Animasyonları ve geçişleri devre dışı bırak" on={bundle.appearance.reduce_motion} onChange={(v) => updateAppearance({ reduce_motion: v })} />
            </SettingsToggleGroup>
          </>
        );

      /* ── GÜVENLİK ── */
      case "guvenlik":
        return (
          <>
            <SettingsSectionHeader title="Güvenlik" desc="Hesap güvenliğini yönet." />

            <SettingsCardBlock
              title="İki aşamalı doğrulama"
              desc="Ekstra güvenlik katmanı — girişlerde ikinci adım ister."
              accent="security"
            >
              <SettingsSelect
                label="2FA modu"
                value={bundle.security.two_factor_hint}
                onChange={(e) => updateSecurity({ two_factor_hint: e.target.value as typeof bundle.security.two_factor_hint })}
                hint="Gerçek 2FA entegrasyonu backend ile açılacak."
              >
                <option value="off">Kapalı</option>
                <option value="sms_mock">SMS (yakında)</option>
                <option value="app_mock">Authenticator (yakında)</option>
              </SettingsSelect>
            </SettingsCardBlock>

            <SettingsSecurityActions />
          </>
        );

      /* ── KİŞİSELLEŞTİRME ── */
      case "kisisellesme":
        return (
          <>
            <SettingsSectionHeader title="Kişiselleştirme Yönetimi" desc="Öneri ve adaptif öğrenme belleğini kontrol et." />

            <SettingsStatsGrid>
              <SettingsStat label="Güven bandı" value={hub.personalization.confidence_line} />
              <SettingsStat label="Keşif" value={hub.personalization.exploration_line} />
              <SettingsStat label="Yenilik" value={hub.personalization.novelty_line} />
              <SettingsStat label="Drift" value={hub.personalization.drift_line} />
              <SettingsStat label="Piyasa odağı" value={hub.personalization.market_focus_line} />
              <SettingsStat label="Öneri belleği" value={hub.personalization.creator_cluster_hint} />
            </SettingsStatsGrid>

            <SettingsFormGroup title="Bellek yönetimi" hint="3 işlem">
              <SettingsBtnRow>
                <SettingsButton variant="outline" onClick={onResetRec}>Öneri belleğini sıfırla</SettingsButton>
                <SettingsButton variant="outline" onClick={onResetAdaptive}>Adaptif öğrenmeyi sıfırla</SettingsButton>
                <SettingsButton variant="danger-muted" onClick={onResetFull}>Tümünü sıfırla</SettingsButton>
              </SettingsBtnRow>
            </SettingsFormGroup>

            {!mockOn && hub.personalization.intel_lines.length === 0 ? (
              <SettingsEmptyHint
                title="Profilin oluşuyor"
                desc="İzleme listesi ve kayıtlarınla ilgi profilin şekilleniyor."
                actionLabel="Keşfet →"
                actionHref={hub.links.discover}
              />
            ) : hub.personalization.intel_lines.length > 0 ? (
              <SettingsIntelTable>
                {hub.personalization.intel_lines.map((row) => (
                  <SettingsIntelRow key={row.id} label={row.label} value={row.value} />
                ))}
              </SettingsIntelTable>
            ) : null}

            <SettingsMutedBox
              title="Sessize alınanlar"
              lines={[
                `Üretici ${hub.personalization.muted.creators_count} · Varlık ${hub.personalization.muted.assets_count} · Konu ${hub.personalization.muted.topics_count}`,
                ...(hub.personalization.muted.sample_assets.length > 0
                  ? [hub.personalization.muted.sample_assets.join(", ")]
                  : []),
              ]}
            />
          </>
        );

      /* ── İLGİ PROFİLİ ── */
      case "ilgi":
        return (
          <>
            <SettingsSectionHeader title="İlgi Profili" desc="Platformdaki ilgi alanlarının ve eğilimlerinin özeti." />
            {mockOn ? (
              <SettingsCardBlock title="Canlı ilgi haritası" accent="personal">
                <InterestProfileStrip variant="full" intel={pSnap.intel} />
              </SettingsCardBlock>
            ) : hub.personalization.intel_lines.length > 0 ? (
              <SettingsIntelTable>
                {hub.personalization.intel_lines.map((row) => (
                  <SettingsIntelRow key={row.id} label={row.label} value={row.value} />
                ))}
              </SettingsIntelTable>
            ) : (
              <SettingsEmptyHint
                title="Henüz veri yok"
                desc="Sembol izle, üretici takip et veya içerik kaydet — profil buna göre şekillenir."
                actionLabel="Keşfet →"
                actionHref={hub.links.discover}
              />
            )}
          </>
        );

      /* ── ÜYELİK ── */
      case "uyelik":
        return (
          <>
            <SettingsSectionHeader title="Üyelik & Erişim" desc="Aboneliklerini ve erişim seviyelerini yönet." />

            <SettingsMembershipList>
              {hub.membership.lines.map((m) => (
                <SettingsMembershipItem key={m.id} title={m.title} sub={m.sub} href={m.href} />
              ))}
            </SettingsMembershipList>

            <SettingsCardBlock title="Faturalandırma" accent="billing" desc={hub.membership.billing_hint} />
          </>
        );

      /* ── STUDIO ── */
      case "studio":
        return (
          <>
            <SettingsSectionHeader title="Creator Studio" desc="İçerik üretici araçlarına erişim ve yapılandırma." />

            {hub.creator.visible ? (
              <>
                <SettingsCreatorBlock
                  headline={hub.creator.headline}
                  bullets={hub.creator.bullets}
                  links={hub.creator.links}
                />
                <SettingsButton variant="outline" href="/hub/studio">Studio&apos;ya Git →</SettingsButton>
              </>
            ) : (
              <SettingsEmptyHint
                title="Creator erişimi kapalı"
                desc="Creator özellikleri hesabınızda henüz etkin değil."
                actionLabel="Yayınla sayfası →"
                actionHref="/hub/upload"
              />
            )}
          </>
        );

      /* ── VERİ & HESAP ── */
      case "veri":
        return (
          <>
            <SettingsSectionHeader title="Veri & Hesap" desc="Veri dışa aktarımı ve hesap silme." />
            <SettingsDataActions userId={uid} bundle={bundle} />
          </>
        );

      default:
        return null;
    }
  }

  /* ── render ─────────────────────────────────── */

  return (
    <HubPageShell zone="tools" className="hp-canvas--embedded-settings" header={pageHeader}>
      <div className="stg-studio">
        <div className="stg-page">
          <div className="stg-workspace">
            <SettingsNavPanel
              active={activeSection}
              displayName={displayName}
              initials={initials}
              email={user?.email ?? undefined}
              onSelect={pushSection}
              hideStudio={!hub.creator.visible}
              hideInterest={!mockOn}
            />

            <div
              className={cn("stg-panel", !hydrated && "stg-panel--loading")}
              data-section={activeSection}
              role="region"
              aria-labelledby="stg-active-section-title"
              aria-busy={!hydrated}
            >
              {saveError ? <div className="stg-save-banner">{saveError}</div> : null}
              {!hydrated ? <SettingsSectionSkeleton /> : renderSection()}
            </div>
          </div>
        </div>
      </div>
    </HubPageShell>
  );
}
