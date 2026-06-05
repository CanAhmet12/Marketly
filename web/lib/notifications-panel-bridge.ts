/** Hesap menüsünden bildirim panelini açmak için hafif köprü (tek tüketici) */

let opener: (() => void) | null = null;

export function registerNotificationsPanelOpener(fn: () => void): () => void {
  opener = fn;
  return () => {
    if (opener === fn) opener = null;
  };
}

export function openNotificationsPanel(): void {
  opener?.();
}
