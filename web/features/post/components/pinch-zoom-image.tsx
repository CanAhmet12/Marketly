"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function PinchZoomImage({ src, alt = "", className, onClick }: Props) {
  const [scale, setScale] = useState(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef({ dist: 0, scale: 1 });

  const reset = useCallback(() => {
    setScale(1);
    pointers.current.clear();
  }, []);

  useEffect(() => {
    reset();
  }, [src, reset]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      pinchStart.current = { dist: distance(pts[0]!, pts[1]!), scale };
    }
  }, [scale]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size < 2) return;
    const pts = [...pointers.current.values()];
    const dist = distance(pts[0]!, pts[1]!);
    if (pinchStart.current.dist <= 0) return;
    const next = Math.min(3, Math.max(1, (pinchStart.current.scale * dist) / pinchStart.current.dist));
    setScale(next);
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) {
        pinchStart.current = { dist: 0, scale };
        if (pointers.current.size === 0 && scale < 1.05) reset();
      }
    },
    [reset, scale],
  );

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    setScale((s) => Math.min(3, Math.max(1, s + delta)));
  }, []);

  return (
    <div
      className="pd-lightbox-zoom"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      onDoubleClick={reset}
    >
      <img
        key={src}
        src={src}
        alt={alt}
        className={className}
        style={{ transform: `scale(${scale})` }}
        onClick={onClick}
        draggable={false}
      />
    </div>
  );
}
