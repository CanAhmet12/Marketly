"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/states";
import { useAuth } from "@/features/auth/use-auth";
import { InterestProfileStrip } from "@/features/personalization/components/interest-profile-strip";
import { usePersonalizationSnapshot } from "@/features/personalization/hooks/use-personalization-snapshot";
import { useSettingsHubLive } from "@/features/settings/hooks/use-settings-hub-live";
import { getSettingsRepository } from "@/features/settings/repository";
import {
  resolveSettingsSection,
  settingsSectionToParam,
  type SettingsSectionId,
} from "@/features/settings/settings-section-params";
import { SettingsPageSkeleton } from "@/features/social/components/social-states";
import { useSettingsPreferences } from "@/features/social/hooks/use-settings-preferences";
import { isMockDataEnabled } from "@/mock/config";
import { cn } from "@/lib/cn";

/* ───────────────────────────────────────────────── types */

type SectionId = SettingsSectionId;

const NAV_GROUPS: { title: string; items: { id: SectionId; label: string }[] }[] = [
  {
    title: "Hesap",
    items: [
      { id: "hesap",    label: "Genel Bakış" },
      { id: "profil",   label: "Profil" },
      { id: "uyelik",   label: "Üyelik" },
      { id: "studio",   label: "Studio" },
    ],
  },
  {
    title: "Tercihler",
    items: [
      { id: "bildirimler", label: "Bildirimler" },
      { id: "gizlilik",    label: "Gizlilik" },
      { id: "gorunum",     label: "Görünüm" },
      { id: "guvenlik",    label: "Güvenlik" },
    ],
  },
  {
    title: "Kişiselleştirme",
    items: [
      { id: "kisisellesme", label: "Yönetim" },
      { id: "ilgi",          label: "İlgi Profili" },
    ],
  },
  {
    title: "Veri",
    items: [
      { id: "veri", label: "Veri & Hesap" },
    ],
  },
];

/* ───────────────────────────────────────────────── sub-components */

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn("sg-toggle-btn", on ? "sg-toggle-btn--on" : "sg-toggle-btn--off")}
    >
      <span className="sg-toggle-knob" />
    </button>
  );
}

function ToggleRow({
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
    <div className="sg-toggle-row">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="sg-toggle-label">{label}</div>
        {sub && <div className="sg-toggle-sub">{sub}</div>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="sg-stat">
      <div className="sg-stat-label">{label}</div>
      <div className="sg-stat-value">{value}</div>
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div id="sg-active-section-title" className="sg-section-title">{title}</div>
      {desc && <div className="sg-section-desc">{desc}</div>}
    </div>
  );
}

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

  const { bundle, hydrated, updateProfile, updateNotifications, updatePrivacy, updateAppearance, updateSecurity, resetMock } =
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

  /* ── loading / unauth ──────────────────────── */

  if (!isInitialized) {
    return <SettingsPageSkeleton />;
  }

  if (!user) {
    return (
      <div className="sg-shell ms-page-wrapper--no-top min-w-0">
        <div className="ms-container-wide pt-10">
          <EmptyState
            title="Oturum gerekli"
            description="Hesap kontrolü ve kişiselleştirme yönetimi için giriş yap."
            actionLabel="Oturum aç"
            actionHref={`/auth/login?next=${encodeURIComponent(pathname || "/settings")}`}
            tone="social"
            compact
          />
        </div>
      </div>
    );
  }

  /* ── section renderers ─────────────────────── */

  function renderSection() {
    switch (activeSection) {

      /* ── HESAP ── */
      case "hesap":
        return (
          <>
            <SectionHeader
              title="Hesap Genel Bakış"
              desc={hub.subline}
            />

            {hydrated && (
              <div className="sg-hydration">
                {mockOn ? "Demo modu — tercihler tarayıcıda kaydedilir." : "Canlı mod — oturum içi tercihler."}
              </div>
            )}

            {/* User identity */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--sg-border-2)" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "var(--sg-text-2)",
                fontFamily: "var(--font-mono,monospace)", letterSpacing: "0.04em",
                flexShrink: 0,
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--sg-text)" }}>{displayName}</div>
                <div style={{ fontSize: 12, color: "var(--sg-meta)" }}>{user?.email ?? ""}</div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="sg-stats-grid">
              <Stat label="Güven" value={hub.account_overview.trust_line} />
              <Stat label="Doğrulama" value={hub.account_overview.verification_line} />
              <Stat label="Premium" value={hub.account_overview.premium_line} />
              <Stat label="Oturum" value={hub.account_overview.session_hint} />
              <div style={{ gridColumn: "1 / -1" }}>
                <Stat label="Giriş geçmişi" value={hub.account_overview.login_history_hint} />
              </div>
            </div>

            {/* Quick links */}
            <div className="sg-quick-links" style={{ paddingTop: 0, borderBottom: "none", paddingBottom: 0 }}>
              <Link href={hub.links.subscriptions} className="sg-quick-link">Üyelikler</Link>
              <Link href={hub.links.close_friends} className="sg-quick-link">Özel Daireler</Link>
              <Link href={hub.links.notifications}  className="sg-quick-link">Bildirimler</Link>
              <Link href={hub.links.messages}        className="sg-quick-link">Mesajlar</Link>
              <Link href="/saved"                      className="sg-quick-link">Kaydedilenler</Link>
              <Link href="/price-alerts"               className="sg-quick-link">Fiyat Alarmları</Link>
              <Link href={hub.links.discover}        className="sg-quick-link">Keşfet</Link>
            </div>
          </>
        );

      /* ── PROFİL ── */
      case "profil":
        return (
          <>
            <SectionHeader title="Profil" desc="Görünen adın, kullanıcı adın ve biyografini yönet." />

            <div className="sg-field">
              <label className="sg-label">Görünen Ad</label>
              <input className="sg-input" value={bundle.profile.display_name}
                onChange={(e) => updateProfile({ display_name: e.target.value })}
                placeholder="Adın" />
            </div>

            <div className="sg-field">
              <label className="sg-label">Kullanıcı Adı</label>
              <input className="sg-input" value={bundle.profile.username}
                onChange={(e) => updateProfile({ username: e.target.value })}
                placeholder="@kullanici" />
            </div>

            <div className="sg-field">
              <label className="sg-label">Biyografi</label>
              <textarea className="sg-textarea" value={bundle.profile.bio}
                onChange={(e) => updateProfile({ bio: e.target.value })}
                placeholder="Kendin hakkında kısa bir açıklama…" />
            </div>

            <div className="sg-field">
              <label className="sg-label">Avatar URL</label>
              <input className="sg-input" value={bundle.profile.avatar_url ?? ""}
                onChange={(e) => updateProfile({ avatar_url: e.target.value || null })}
                placeholder="https://…" />
              <div className="sg-field-hint">Gerçek yükleme storage entegrasyonu ile açılacak.</div>
            </div>

            <Link href="/profile" className="sg-btn sg-btn--ghost">Profil sayfasına git →</Link>
          </>
        );

      /* ── BİLDİRİMLER ── */
      case "bildirimler":
        return (
          <>
            <SectionHeader title="Bildirimler & Uyarılar" desc="Hangi bildirimleri almak istediğini seç." />

            <div className="sg-toggle-group-title">Genel</div>
            <div className="sg-toggles">
              <ToggleRow label="Anlık bildirimler" sub="Push bildirimleri etkinleştir" on={bundle.notifications.push_enabled} onChange={(v) => updateNotifications({ push_enabled: v })} />
              <ToggleRow label="E-posta özeti" sub="Haftalık özet e-postası" on={bundle.notifications.email_digest} onChange={(v) => updateNotifications({ email_digest: v })} />
            </div>

            <div className="sg-toggle-group-title">Sosyal</div>
            <div className="sg-toggles">
              <ToggleRow label="Beğeni" on={bundle.notifications.likes} onChange={(v) => updateNotifications({ likes: v })} />
              <ToggleRow label="Yorum" on={bundle.notifications.comments} onChange={(v) => updateNotifications({ comments: v })} />
              <ToggleRow label="Takip" on={bundle.notifications.follows} onChange={(v) => updateNotifications({ follows: v })} />
              <ToggleRow label="Mesajlar" on={bundle.notifications.messages} onChange={(v) => updateNotifications({ messages: v })} />
              <ToggleRow label="Tartışma uyarıları" on={bundle.notifications.discussion_alerts} onChange={(v) => updateNotifications({ discussion_alerts: v })} />
              <ToggleRow label="Oda aktivitesi" on={bundle.notifications.room_activity} onChange={(v) => updateNotifications({ room_activity: v })} />
            </div>

            <div className="sg-toggle-group-title">Finans & Piyasa</div>
            <div className="sg-toggles">
              <ToggleRow label="Sinyaller" on={bundle.notifications.signals} onChange={(v) => updateNotifications({ signals: v })} />
              <ToggleRow label="Piyasa" on={bundle.notifications.market} onChange={(v) => updateNotifications({ market: v })} />
              <ToggleRow label="İzleme listesi uyarıları" on={bundle.notifications.watchlist_alerts} onChange={(v) => updateNotifications({ watchlist_alerts: v })} />
              <ToggleRow label="Portföy uyarıları" on={bundle.notifications.portfolio_alerts} onChange={(v) => updateNotifications({ portfolio_alerts: v })} />
              <ToggleRow label="Makro uyarıları" on={bundle.notifications.macro_alerts} onChange={(v) => updateNotifications({ macro_alerts: v })} />
            </div>

            <div className="sg-toggle-group-title">Creator</div>
            <div className="sg-toggles">
              <ToggleRow label="Canlı yayın" on={bundle.notifications.live} onChange={(v) => updateNotifications({ live: v })} />
              <ToggleRow label="Üretici özeti" on={bundle.notifications.creator_digest} onChange={(v) => updateNotifications({ creator_digest: v })} />
              <ToggleRow label="Premium güncellemeler" on={bundle.notifications.premium_updates} onChange={(v) => updateNotifications({ premium_updates: v })} />
            </div>

            <div className="sg-quick-links" style={{ paddingTop: 20, borderBottom: "none" }}>
              <Link href="/price-alerts" className="sg-quick-link">Fiyat alarmlarını yönet →</Link>
              <Link href="/saved" className="sg-quick-link">Kaydedilenler →</Link>
              <Link href="/notifications" className="sg-quick-link">Bildirim geçmişi →</Link>
            </div>
          </>
        );

      /* ── GİZLİLİK ── */
      case "gizlilik":
        return (
          <>
            <SectionHeader title="Gizlilik & Görünürlük" desc="Başkalarının seni nasıl gördüğünü kontrol et." />

            <div className="sg-toggle-group-title">Profil</div>
            <div className="sg-toggles">
              <ToggleRow label="Profil herkese açık" on={bundle.privacy.profile_public} onChange={(v) => updatePrivacy({ profile_public: v })} />
              <ToggleRow label="Aktiviteyi göster" on={bundle.privacy.show_activity} onChange={(v) => updatePrivacy({ show_activity: v })} />
              <ToggleRow label="Takip listesi herkese açık" on={bundle.privacy.follow_list_public} onChange={(v) => updatePrivacy({ follow_list_public: v })} />
              <ToggleRow label="Premium rozet görünür" on={bundle.privacy.premium_visibility} onChange={(v) => updatePrivacy({ premium_visibility: v })} />
            </div>

            <div className="sg-toggle-group-title">Mesajlaşma & Aktivite</div>
            <div className="sg-toggles">
              <ToggleRow label="Okundu bilgisi" on={bundle.privacy.read_receipts} onChange={(v) => updatePrivacy({ read_receipts: v })} />
              <ToggleRow label="İzleme aktivitesi görünür" on={bundle.privacy.watch_activity_visible} onChange={(v) => updatePrivacy({ watch_activity_visible: v })} />
              <ToggleRow label="Oda katılımı görünür" on={bundle.privacy.room_participation_visible} onChange={(v) => updatePrivacy({ room_participation_visible: v })} />
            </div>

            <div className="sg-toggle-group-title">Finans</div>
            <div className="sg-toggles">
              <ToggleRow label="Sinyal kopyası görünür" on={bundle.privacy.signal_copy_visible} onChange={(v) => updatePrivacy({ signal_copy_visible: v })} />
              <ToggleRow label="Özel daireler görünür" on={bundle.privacy.private_circle_visible} onChange={(v) => updatePrivacy({ private_circle_visible: v })} />
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="sg-field">
                <label className="sg-label">Bahsetmeye izin ver</label>
                <select className="sg-select" value={bundle.privacy.allow_mentions_from}
                  onChange={(e) => updatePrivacy({ allow_mentions_from: e.target.value as typeof bundle.privacy.allow_mentions_from })}>
                  <option value="everyone">Herkes</option>
                  <option value="followers">Takipçiler</option>
                  <option value="none">Kapalı</option>
                </select>
              </div>
              <div className="sg-field">
                <label className="sg-label">Tartışma görünürlüğü</label>
                <select className="sg-select" value={bundle.privacy.discussion_visibility}
                  onChange={(e) => updatePrivacy({ discussion_visibility: e.target.value as typeof bundle.privacy.discussion_visibility })}>
                  <option value="public">Herkese açık</option>
                  <option value="followers">Takipçiler</option>
                  <option value="private">Kapalı / davetli</option>
                </select>
              </div>
            </div>

            <Link href="/close-friends" className="sg-btn sg-btn--ghost">Özel Daireler →</Link>
          </>
        );

      /* ── GÖRÜNÜM ── */
      case "gorunum":
        return (
          <>
            <SectionHeader title="Görünüm" desc="Arayüz tercihlerini ayarla." />
            <div className="sg-toggles">
              <ToggleRow label="Kompakt akış" sub="Daha az boşlukla daha fazla içerik göster" on={bundle.appearance.compact_feed} onChange={(v) => updateAppearance({ compact_feed: v })} />
              <ToggleRow label="Hareketi azalt" sub="Animasyonları ve geçişleri devre dışı bırak" on={bundle.appearance.reduce_motion} onChange={(v) => updateAppearance({ reduce_motion: v })} />
            </div>
          </>
        );

      /* ── GÜVENLİK ── */
      case "guvenlik":
        return (
          <>
            <SectionHeader title="Güvenlik" desc="Hesap güvenliğini yönet." />

            <div className="sg-field">
              <label className="sg-label">İki Aşamalı Doğrulama</label>
              <select className="sg-select" value={bundle.security.two_factor_hint}
                onChange={(e) => updateSecurity({ two_factor_hint: e.target.value as typeof bundle.security.two_factor_hint })}>
                <option value="off">Kapalı</option>
                <option value="sms_mock">SMS (yakında)</option>
                <option value="app_mock">Authenticator (yakında)</option>
              </select>
              <div className="sg-field-hint">Gerçek 2FA entegrasyonu backend ile açılacak.</div>
            </div>

            <div className="sg-info">
              Şifre değişikliği, oturum yönetimi ve cihaz listesi yakında eklenecek.
            </div>
          </>
        );

      /* ── KİŞİSELLEŞTİRME ── */
      case "kisisellesme":
        return (
          <>
            <SectionHeader title="Kişiselleştirme Yönetimi" desc="Öneri ve adaptif öğrenme belleğini kontrol et." />

            <div className="sg-stats-grid">
              <Stat label="Güven bandı" value={hub.personalization.confidence_line} />
              <Stat label="Keşif" value={hub.personalization.exploration_line} />
              <Stat label="Yenilik" value={hub.personalization.novelty_line} />
              <Stat label="Drift" value={hub.personalization.drift_line} />
              <Stat label="Piyasa odağı" value={hub.personalization.market_focus_line} />
              <Stat label="Öneri belleği" value={hub.personalization.creator_cluster_hint} />
            </div>

            <div className="sg-btn-row">
              <button type="button" className="sg-btn sg-btn--outline" onClick={onResetRec}>
                Öneri belleğini sıfırla
              </button>
              <button type="button" className="sg-btn sg-btn--outline" onClick={onResetAdaptive}>
                Adaptif öğrenmeyi sıfırla
              </button>
              <button type="button" className="sg-btn sg-btn--outline" style={{ borderColor: "rgba(239,68,68,0.25)", color: "rgba(239,68,68,0.7)" }} onClick={onResetFull}>
                Tümünü sıfırla
              </button>
            </div>

            {!mockOn && hub.personalization.intel_lines.length === 0 ? (
              <div className="sg-info">İzleme listesi ve kayıtlarınla ilgi profilin oluşuyor.</div>
            ) : hub.personalization.intel_lines.length > 0 ? (
              <div className="sg-intel-table">
                {hub.personalization.intel_lines.map((row) => (
                  <div key={row.id} className="sg-intel-row">
                    <span className="sg-intel-key">{row.label}</span>
                    <span className="sg-intel-val">{row.value}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="sg-muted-box">
              <div className="sg-muted-title">Sessize alınanlar</div>
              <div className="sg-muted-line">
                Üretici {hub.personalization.muted.creators_count} · Varlık {hub.personalization.muted.assets_count} · Konu {hub.personalization.muted.topics_count}
              </div>
              {hub.personalization.muted.sample_assets.length > 0 && (
                <div style={{ fontSize: 11, color: "var(--sg-meta)", marginTop: 4 }}>
                  {hub.personalization.muted.sample_assets.join(", ")}
                </div>
              )}
            </div>
          </>
        );

      /* ── İLGİ PROFİLİ ── */
      case "ilgi":
        return (
          <>
            <SectionHeader title="İlgi Profili" desc="Platformdaki ilgi alanlarının ve eğilimlerinin özeti." />
            {mockOn ? (
              <InterestProfileStrip variant="full" intel={pSnap.intel} />
            ) : hub.personalization.intel_lines.length > 0 ? (
              <div className="sg-intel-table">
                {hub.personalization.intel_lines.map((row) => (
                  <div key={row.id} className="sg-intel-row">
                    <span className="sg-intel-key">{row.label}</span>
                    <span className="sg-intel-val">{row.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sg-info">Sembol izle, üretici takip et veya içerik kaydet — profil buna göre şekillenir.</div>
            )}
          </>
        );

      /* ── ÜYELİK ── */
      case "uyelik":
        return (
          <>
            <SectionHeader title="Üyelik & Erişim" desc="Aboneliklerini ve erişim seviyelerini yönet." />

            <div className="sg-membership-list">
              {hub.membership.lines.map((m) => (
                <div key={m.id} className="sg-membership-item">
                  <div style={{ minWidth: 0 }}>
                    <div className="sg-membership-title">{m.title}</div>
                    <div className="sg-membership-sub">{m.sub}</div>
                  </div>
                  <Link href={m.href} className="sg-membership-link">Aç →</Link>
                </div>
              ))}
            </div>

            <div className="sg-info">{hub.membership.billing_hint}</div>
          </>
        );

      /* ── STUDIO ── */
      case "studio":
        return (
          <>
            <SectionHeader title="Creator Studio" desc="İçerik üretici araçlarına erişim ve yapılandırma." />

            {hub.creator.visible ? (
              <>
                <div className="sg-creator-block">
                  <div className="sg-creator-title">{hub.creator.headline}</div>
                  <ul className="sg-creator-bullets">
                    {hub.creator.bullets.map((b) => (
                      <li key={b} className="sg-creator-bullet">{b}</li>
                    ))}
                  </ul>
                  <div className="sg-creator-links">
                    <Link href={hub.creator.links.upload}        className="sg-creator-link">Yayınla</Link>
                    <Link href={hub.creator.links.subscriptions} className="sg-creator-link" style={{ color: "var(--sg-text-2)" }}>Üyelik</Link>
                    <Link href={hub.creator.links.close_friends} className="sg-creator-link" style={{ color: "var(--sg-text-2)" }}>Özel Daireler</Link>
                  </div>
                </div>
                <Link href="/studio" className="sg-btn sg-btn--outline">Studio'ya Git →</Link>
              </>
            ) : (
              <div className="sg-info">Creator özellikleri hesabınızda henüz etkin değil.</div>
            )}
          </>
        );

      /* ── VERİ & HESAP ── */
      case "veri":
        return (
          <>
            <SectionHeader title="Veri & Hesap" desc="Veri dışa aktarımı ve hesap silme." />

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sg-text)", marginBottom: 4 }}>Veri Dışa Aktarma</div>
              <div style={{ fontSize: 12, color: "var(--sg-meta)", marginBottom: 12, lineHeight: 1.5 }}>
                Tüm verilerini JSON formatında indir — gönderiler, sinyaller, tercihler ve aktivite.
              </div>
              <button type="button" className="sg-btn sg-btn--outline" disabled style={{ opacity: 0.45, cursor: "not-allowed" }}>
                Veriyi dışa aktar (yakında)
              </button>
            </div>

            <div className="sg-danger-zone">
              <div className="sg-danger-zone-title">Tehlikeli Bölge</div>
              <div className="sg-danger-zone-desc">
                Hesabını kalıcı olarak silersin. Bu işlem geri alınamaz. Tüm içerikler, takipçiler ve tercihler silinir.
              </div>
              <button type="button" className="sg-btn sg-btn--danger" disabled>
                Hesabı sil (yakında)
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  }

  /* ── render ─────────────────────────────────── */

  return (
    <div className="sg-shell ms-page-wrapper--no-top" style={{ width: "100%", minWidth: 0 }}>
      <div className="ms-container-wide">
        <div className="sg-page">

          {/* Header */}
          <div className="sg-header">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div className="sg-header-title">Ayarlar</div>
                <div className="sg-header-sub">{hub.headline}</div>
              </div>
              <div className="sg-header-actions">
                {mockOn && (
                  <button type="button" className="sg-reset-btn" onClick={() => { resetMock(); bump(); }}>
                    Demo sıfırla
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="sg-grid">

            {/* Left sidebar */}
            <nav className="sg-sidebar" aria-label="Ayarlar bölümleri">
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="sg-nav-group">
                  <div className="sg-nav-group-title">{group.title}</div>
                  {group.items.map((item) => {
                    if (item.id === "ilgi" && !mockOn) return null;
                    if (item.id === "studio" && !hub.creator.visible) return null;
                    const active = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-current={active ? "page" : undefined}
                        onClick={() => pushSection(item.id)}
                        className={cn("sg-nav-item", active && "sg-nav-item--active")}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="sg-content" role="region" aria-labelledby="sg-active-section-title">
              {renderSection()}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
