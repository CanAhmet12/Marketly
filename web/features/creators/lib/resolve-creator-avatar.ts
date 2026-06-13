/** Kanal sayfası ile aynı — boş URL null; SafeAvatar/ui-avatars fallback kullanır */
export function resolveCreatorAvatarUrl(avatarUrl: string | null | undefined): string | null {
  const trimmed = avatarUrl?.trim();
  return trimmed || null;
}
