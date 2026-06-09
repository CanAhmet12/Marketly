"use client";

import { useCallback, useRef } from "react";

type TapEvent = React.TouchEvent | React.MouseEvent;

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("a, button, input, textarea, select, [role='menu'], [role='menuitem']"));
}

/** Çift dokunuş / çift tıklama algısı — etkileşimli öğelerde devre dışı. */
export function useDoubleTap(onDoubleTap: (e: TapEvent) => void, delayMs = 320) {
  const lastTapRef = useRef(0);

  return useCallback(
    (e: TapEvent) => {
      if (isInteractiveTarget(e.target)) return;
      const now = Date.now();
      if (now - lastTapRef.current <= delayMs) {
        e.preventDefault();
        lastTapRef.current = 0;
        onDoubleTap(e);
      } else {
        lastTapRef.current = now;
      }
    },
    [delayMs, onDoubleTap],
  );
}
