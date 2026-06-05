"use client";

import type { ReactNode } from "react";

import type { VirtualItem } from "@tanstack/react-virtual";

type ContainerProps<T> = {
  items: T[];
  enabled: boolean;
  virtualItems: VirtualItem[] | null;
  totalSize: number;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  wrap?: "li" | "div";
};

/** Container scroll — `<ul>` / `<div>` içinde absolute satırlar */
export function renderContainerVirtualList<T>({
  items,
  enabled,
  virtualItems,
  totalSize,
  getKey,
  renderItem,
  wrap = "li",
}: ContainerProps<T>): ReactNode[] {
  if (!enabled || !virtualItems) {
    return items.map((item, index) => {
      const content = renderItem(item, index);
      const key = getKey(item, index);
      if (wrap === "li") {
        return <li key={key}>{content}</li>;
      }
      return (
        <div key={key} className="virtual-list-item">
          {content}
        </div>
      );
    });
  }

  return virtualItems.map((vRow) => {
    const item = items[vRow.index]!;
    const content = renderItem(item, vRow.index);
    const key = getKey(item, vRow.index);
    const style = {
      position: "absolute" as const,
      top: 0,
      left: 0,
      width: "100%",
      transform: `translateY(${vRow.start}px)`,
    };

    if (wrap === "li") {
      return (
        <li key={vRow.key} style={style} className="virtual-list-item">
          {content}
        </li>
      );
    }
    return (
      <div key={vRow.key} style={style} className="virtual-list-item">
        {content}
      </div>
    );
  });
}

type WindowProps<T> = {
  items: T[];
  enabled: boolean;
  virtualItems: VirtualItem[] | null;
  totalSize: number;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
};

/** Window scroll — sinyaller feed */
export function renderWindowVirtualList<T>({
  items,
  enabled,
  virtualItems,
  totalSize,
  getKey,
  renderItem,
}: WindowProps<T>): ReactNode {
  if (!enabled || !virtualItems) {
    return (
      <>
        {items.map((item, index) => (
          <li key={getKey(item, index)}>{renderItem(item, index)}</li>
        ))}
      </>
    );
  }

  return (
    <div style={{ height: totalSize, position: "relative", width: "100%" }}>
      {virtualItems.map((vRow) => {
        const item = items[vRow.index]!;
        return (
          <div
            key={vRow.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${vRow.start}px)`,
            }}
          >
            {renderItem(item, vRow.index)}
          </div>
        );
      })}
    </div>
  );
}
