/**
 * View Transitions API — same-document SPA (P10 pilot)
 */
interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}

interface Document {
  startViewTransition?(callbackOptions: () => void | Promise<void>): ViewTransition;
}

export {};
