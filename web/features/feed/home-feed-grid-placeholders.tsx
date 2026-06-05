"use client";

import Link from "next/link";

type Variant = "no-config" | "empty-feed" | "filter-empty";

type Props = {
  variant: Variant;
  filterLabel?: string;
};

function SoftIcon({ variant }: { variant: "spark" | "link" | "search" | "user" }) {
  const common =
    "flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] shadow-[var(--shadow-card)]";
  if (variant === "spark") {
    return (
      <div className={common} aria-hidden>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-[var(--color-primary-dark)]">
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (variant === "link") {
    return (
      <div className={common} aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-primary-dark)]">
          <path d="M10 14l8-8M12 6h6v6" strokeLinecap="round" />
          <path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (variant === "search") {
    return (
      <div className={common} aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-[var(--color-primary-dark)]">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  return (
    <div className={common} aria-hidden>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-[var(--color-primary-dark)]">
        <circle cx="12" cy="9" r="3.5" />
        <path d="M6 20v-1a6 6 0 0 1 12 0v1" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** Grid içi onboarding — sahte gönderi yok */
export function HomeGridPlaceholderCards({ variant, filterLabel }: Props) {
  if (variant === "filter-empty") {
    return (
      <>
        <div className="col-span-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--gradient-surface)] p-5 shadow-[var(--shadow-card-md)]">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start sm:gap-5">
            <SoftIcon variant="search" />
            <div className="mt-4 min-w-0 sm:mt-0">
              <p className="text-base font-semibold text-[var(--color-text)]">
                {filterLabel ? `“${filterLabel}” için henüz içerik yok` : "Bu sekmede içerik yok"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
                Farklı bir kategori seçin veya içerik yükleyerek akışa katılın.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Link
                  href="/"
                  className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[#051308] transition hover:brightness-110 active:scale-[0.98]"
                >
                  Tümüne dön
                </Link>
                <Link
                  href="/upload"
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                >
                  İçerik yükle
                </Link>
              </div>
            </div>
          </div>
        </div>
        <GuidanceCard title="Arama" desc="Sembol veya konu ile keşfe devam edin." href="/results" action="Ara" icon="search" />
        <GuidanceCard title="Oluştur" desc="İlk video veya gönderinizle yeri doldurun." href="/upload" action="Başla" icon="spark" />
      </>
    );
  }

  if (variant === "no-config") {
    return (
      <>
        <div className="col-span-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-5 shadow-[var(--shadow-card-md)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <SoftIcon variant="link" />
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-[var(--color-text)]">Bağlantıyı tamamlayın</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
                Canlı içerik ve hesap özellikleri için ortam değişkenlerini ekleyin. Bu adım bir kez yapılır; ardından gönderiler burada belirir.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-[var(--color-text-sub)]">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" aria-hidden />
                  <span>Proje kökünde `.env.local` oluşturun</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" aria-hidden />
                  <span>Supabase URL ve anon anahtarını ekleyin</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" aria-hidden />
                  <span>Geliştirme sunucusunu yeniden başlatın</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <GuidanceCard title="Keşfet" desc="Bağlantı olmadan da arama ekranını gezebilirsiniz." href="/results" action="Keşfet" icon="search" />
        <GuidanceCard title="Hazırlık" desc="İçerik şablonunuzu hazırlayın; bağlantı sonrası tek tıkla yayınlayın." href="/upload" action="Oluştur" icon="spark" />
        <GuidanceCard title="Hesap" desc="Daha sonra aynı oturumla devam edin." href="/auth/login" action="Giriş" icon="user" />
      </>
    );
  }

  return (
    <>
      <div className="col-span-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--gradient-surface)] px-5 py-8 text-center shadow-[var(--shadow-card-md)] sm:px-8">
        <SoftIcon variant="spark" />
        <p className="mt-4 text-lg font-semibold text-[var(--color-text)]">Topluluk akışı hazır</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
          Henüz gönderi yok. İlk içeriği siz ekleyin veya arama ile keşfe çıkın — akış doldukça burası canlanır.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/upload"
            className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[#051308] shadow-md transition hover:brightness-110 active:scale-[0.98]"
          >
            İlk içeriği oluştur
          </Link>
          <Link
            href="/results"
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          >
            Keşfet
          </Link>
        </div>
      </div>
      <GuidanceCard title="Video veya gönderi" desc="Kısa analiz, eğitim veya piyasa yorumu paylaşın." href="/upload" action="Yükle" icon="spark" />
      <GuidanceCard title="Profil" desc="Kanalınızı tamamlayın; izleyici güveni artar." href="/auth/login" action="Hesap" icon="user" />
    </>
  );
}

function GuidanceCard({
  title,
  desc,
  href,
  action,
  icon,
}: {
  title: string;
  desc: string;
  href: string;
  action: string;
  icon: "spark" | "search" | "user";
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]/80 p-4 shadow-[var(--shadow-card)] transition duration-[var(--motion-soft)] hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-card-md)]">
      <div className="mb-3 opacity-90 transition group-hover:opacity-100">
        <SoftIcon variant={icon} />
      </div>
      <p className="text-sm font-semibold text-[var(--color-text)]">{title}</p>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-[var(--color-muted)]">{desc}</p>
      <Link
        href={href}
        className="mt-4 inline-flex w-max rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)]/35 hover:text-[var(--color-primary-dark)] active:scale-[0.98]"
      >
        {action}
      </Link>
    </div>
  );
}
