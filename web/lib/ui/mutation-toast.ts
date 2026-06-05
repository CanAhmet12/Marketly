export const MUTATION_TOAST_EVENT = "marketly-mutation-toast";

export type MutationToastDetail = {
  message: string;
  tone?: "error" | "info";
};

/** P6-006: Optimistic rollback — sessiz geri alma + kısa bildirim */
export function showMutationToast(message: string, tone: MutationToastDetail["tone"] = "error") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<MutationToastDetail>(MUTATION_TOAST_EVENT, {
      detail: { message, tone },
    }),
  );
}
