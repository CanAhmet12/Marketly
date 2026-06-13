/** React Query dışı async yüklemeler — global kapı bu sayacı da izler */

const pending = new Set<string>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function registerPageLoad(id: string) {
  if (pending.has(id)) return;
  pending.add(id);
  emit();
}

export function unregisterPageLoad(id: string) {
  if (!pending.has(id)) return;
  pending.delete(id);
  emit();
}

export function getPendingPageLoadCount(): number {
  return pending.size;
}

export function subscribePageLoadRegistry(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
