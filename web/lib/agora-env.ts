/** Mobil `EXPO_PUBLIC_AGORA_APP_ID` ile aynı değer — web `.env.local` içinde tanımlayın. */
export function getAgoraAppId(): string {
  return process.env.NEXT_PUBLIC_AGORA_APP_ID?.trim() ?? "";
}

export function isAgoraConfigured(): boolean {
  return getAgoraAppId().length > 0;
}
