import type { AuthRepository } from "./auth-repository";
import type { AuthFormPresentation, AuthShellPresentation, AuthSurfaceId } from "../domain/types";

const SHELL: AuthShellPresentation = {
  brand_line: "Marketly",
  ethos_line: "Canlı kimlik doğrulama ve kişiselleştirme Supabase üzerinden bağlanır.",
  foot_note: "Supabase Auth yapılandırmasını tamamlayın.",
  cross_links: [
    { href: "/discover", label: "Keşfet" },
    { href: "/markets", label: "Piyasalar" },
  ],
};

const FORMS: Record<AuthSurfaceId, AuthFormPresentation> = {
  login: {
    title: "Giriş yap",
    subtitle: "E-posta ve şifrenle hesabına bağlan.",
    primary_cta: "Giriş yap",
    secondary_hint: null,
  },
  register: {
    title: "Hesap oluştur",
    subtitle: "Ücretsiz kayıt — ardından 3 adımlık kişisel kurulum.",
    primary_cta: "Hesap oluştur",
    secondary_hint: "E-posta onayı canlı ortamda gerekebilir.",
  },
  forgot: {
    title: "Şifre sıfırlama",
    subtitle: "E-posta ile tek kullanımlık bağlantı.",
    primary_cta: "Gönder",
    secondary_hint: null,
  },
  update: {
    title: "Şifre güncelle",
    subtitle: "Oturum doğrulandıktan sonra yeni şifrenizi girin.",
    primary_cta: "Kaydet",
    secondary_hint: null,
  },
};

export class SupabaseAuthRepository implements AuthRepository {
  getShellPresentation(): AuthShellPresentation {
    return SHELL;
  }

  getFormPresentation(surface: AuthSurfaceId): AuthFormPresentation {
    return FORMS[surface] ?? FORMS.login;
  }
}
