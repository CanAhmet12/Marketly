import type { AuthRepository } from "./auth-repository";
import type { AuthFormPresentation, AuthShellPresentation, AuthSurfaceId } from "../domain/types";

const SHELL: AuthShellPresentation = {
  brand_line: "Marketly",
  ethos_line: "Piyasa kimliğinizi tek merkezde toplayın — sakin, üretici odaklı, veri disiplinli.",
  foot_note: "Mock modunda oturum tarayıcıda simüle edilir; canlıda Supabase Auth.",
  cross_links: [
    { href: "/discover", label: "Keşfet" },
    { href: "/markets", label: "Piyasalar" },
    { href: "/signals", label: "Sinyaller" },
    { href: "/watchlist", label: "Watchlist" },
  ],
};

const FORMS: Record<AuthSurfaceId, AuthFormPresentation> = {
  login: {
    title: "Oturum",
    subtitle: "İzleme listeniz, sinyaller ve odalar kaldığınız yerden devam eder.",
    primary_cta: "Devam et",
    secondary_hint: "İki faktörlü doğrulama yakında.",
  },
  register: {
    title: "Piyasa profili oluştur",
    subtitle: "Kayıt sonrası kısa rehber ile öneri motoru sizi tanır.",
    primary_cta: "Hesabı aç",
    secondary_hint: "E-posta onayı canlı ortamda gerekebilir.",
  },
  forgot: {
    title: "Erişim sıfırlama",
    subtitle: "Bağlantı güvenli oturumla sınırlıdır; spam klasörünü kontrol edin.",
    primary_cta: "Bağlantı gönder",
    secondary_hint: null,
  },
  update: {
    title: "Yeni şifre",
    subtitle: "Güçlü şifre + benzersiz kelimeler; oturumlarınız yenilenir.",
    primary_cta: "Şifreyi güncelle",
    secondary_hint: null,
  },
};

export class MockAuthRepository implements AuthRepository {
  getShellPresentation(): AuthShellPresentation {
    return SHELL;
  }

  getFormPresentation(surface: AuthSurfaceId): AuthFormPresentation {
    return FORMS[surface] ?? FORMS.login;
  }
}
