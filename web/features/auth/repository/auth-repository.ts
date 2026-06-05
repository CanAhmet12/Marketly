import type { AuthFormPresentation, AuthShellPresentation, AuthSurfaceId } from "@/features/auth/domain/types";

export type AuthRepository = {
  getShellPresentation(): AuthShellPresentation;
  getFormPresentation(surface: AuthSurfaceId): AuthFormPresentation;
};
