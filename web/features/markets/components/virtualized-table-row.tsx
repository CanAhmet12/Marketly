"use client";

import { cloneElement, memo, type CSSProperties, type HTMLAttributes, type ReactElement } from "react";

type Props = {
  enabled: boolean;
  start: number;
  size: number;
  children: ReactElement<HTMLAttributes<HTMLTableRowElement>>;
};

/** Sanal tablo satırı — sabit yükseklik `<tr>` child'a transform uygular */
export const VirtualizedTableRow = memo(function VirtualizedTableRow({
  enabled,
  start,
  size,
  children,
}: Props) {
  if (!enabled) return children;

  const childStyle = children.props.style;
  return cloneElement(children, {
    style: {
      ...childStyle,
      display: "table",
      width: "100%",
      tableLayout: "fixed",
      position: "absolute",
      top: 0,
      left: 0,
      height: size,
      transform: `translateY(${start}px)`,
    } satisfies CSSProperties,
  });
});
