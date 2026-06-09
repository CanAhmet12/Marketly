"use client";

import Link from "next/link";

type Variant =
  | "error"
  | "empty"
  | "no-config"
  | "following-login"
  | "following-empty"
  | "filtered"
  | "feedback-filtered";

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
};

type Props = {
  variant: Variant;
  onRetry?: () => void;
  loginHref?: string;
};

const COPY: Record<Variant, { title: string; desc: string; icon: "error" | "empty" | "config" | "login" | "filter" | "users" }> = {
  error: {
    title: "Akış şu anda yüklenemiyor",
    desc: "Bağlantı veya veri kaynağı geçici olarak yanıt vermemiş olabilir. Birkaç saniye sonra tekrar deneyin.",
    icon: "error",
  },
  empty: {
    title: "Akışını oluştur",
    desc: "İlgilendiğin creatorları ve piyasa başlıklarını keşfettikçe burası sana özel içeriklerle canlanır.",
    icon: "empty",
  },
  "no-config": {
    title: "Bağlantıyı tamamlayın",
    desc: "Canlı içerik için Supabase ortam değişkenlerini ekleyin. Bu adım bir kez yapılır; ardından gönderiler burada belirir.",
    icon: "config",
  },
  "following-login": {
    title: "Takip akışı için giriş yapın",
    desc: "Takip ettiğin üreticilerin gönderilerini görmek için hesabına giriş yap.",
    icon: "login",
  },
  "following-empty": {
    title: "Takip ettiğin üreticilerden henüz gönderi yok",
    desc: "Keşfetten ilginç creator'ları bul ve takip et — akışın burada belirecek.",
    icon: "users",
  },
  filtered: {
    title: "Bu sekmede içerik yok",
    desc: "Senin için sekmesine dönüp genel akışı görebilirsin.",
    icon: "filter",
  },
  "feedback-filtered": {
    title: "Geri bildirim akışı filtreledi",
    desc: "Sessize alınan üreticiler veya gizlenen gönderiler nedeniyle liste boş olabilir.",
    icon: "filter",
  },
};

function StateIcon({ kind }: { kind: (typeof COPY)[Variant]["icon"] }) {
  const cls = "hv-ref-feed-state__icon-svg";
  switch (kind) {
    case "error":
      return (
        <svg className={cls} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "config":
      return (
        <svg className={cls} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M10 14l8-8M12 6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "login":
      return (
        <svg className={cls} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 20v-1a6 6 0 0 1 12 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 19v-1a5 5 0 0 1 5-5M14 18v-1a4 4 0 0 1 3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "filter":
      return (
        <svg className={cls} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={cls} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      );
  }
}

function actionsFor(variant: Variant, onRetry?: () => void, loginHref?: string): Action[] {
  switch (variant) {
    case "error":
      return [{ label: "Tekrar dene", onClick: onRetry, primary: true }];
    case "empty":
      return [
        { label: "İlk içeriği oluştur", href: "/upload", primary: true },
        { label: "Keşfet", href: "/results" },
      ];
    case "no-config":
      return [
        { label: "Keşfet", href: "/results", primary: true },
        { label: "Giriş yap", href: "/auth/login" },
      ];
    case "following-login":
      return [{ label: "Giriş yap", href: loginHref ?? "/auth/login", primary: true }];
    case "following-empty":
      return [
        { label: "Creator keşfet", href: "/discover?tab=creators", primary: true },
        { label: "Keşfet", href: "/discover" },
      ];
    case "filtered":
      return [{ label: "Senin için", href: "/?chip=for_you", primary: true }];
    case "feedback-filtered":
      return [
        { label: "Ayarlar", href: "/settings", primary: true },
        { label: "Senin için", href: "/?chip=for_you" },
      ];
  }
}

function ActionBtn({ action }: { action: Action }) {
  const cls = action.primary ? "hv-ref-feed-state__btn hv-ref-feed-state__btn--primary" : "hv-ref-feed-state__btn";
  if (action.href) {
    return (
      <Link href={action.href} className={cls}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={action.onClick}>
      {action.label}
    </button>
  );
}

export function HomeFeedState({ variant, onRetry, loginHref }: Props) {
  const copy = COPY[variant];
  const actions = actionsFor(variant, onRetry, loginHref);
  const role = variant === "error" ? "alert" : "status";

  return (
    <div className="hv-ref-feed-state" data-variant={variant} role={role}>
      <div className="hv-ref-feed-state__icon" aria-hidden>
        <StateIcon kind={copy.icon} />
      </div>
      <h2 className="hv-ref-feed-state__title">{copy.title}</h2>
      <p className="hv-ref-feed-state__desc">{copy.desc}</p>
      {variant === "no-config" ? (
        <ul className="hv-ref-feed-state__steps">
          <li>Proje kökünde <code>.env.local</code> oluşturun</li>
          <li>Supabase URL ve anon anahtarını ekleyin</li>
          <li>Geliştirme sunucusunu yeniden başlatın</li>
        </ul>
      ) : null}
      {actions.length > 0 ? (
        <div className="hv-ref-feed-state__actions">
          {actions.map((a) => (
            <ActionBtn key={a.label} action={a} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
