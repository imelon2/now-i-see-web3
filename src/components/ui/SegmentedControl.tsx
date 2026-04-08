"use client";

import React, { useRef } from "react";

export interface SegmentItem<K extends string = string> {
  key: K;
  label: string;
  icon?: (active: boolean) => React.ReactNode;
}

export interface SegmentedControlProps<K extends string = string> {
  items: SegmentItem<K>[];
  active: K;
  onChange: (key: K) => void;
  ariaLabel?: string;
}

/**
 * Pill-style segmented control. Visually distinct from Tabs so nested
 * tab groups (e.g. inside a Withdrawal tab) don't create tab-in-tab confusion.
 */
export function SegmentedControl<K extends string = string>({
  items,
  active,
  onChange,
  ariaLabel = "Segmented control",
}: SegmentedControlProps<K>) {
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const last = items.length - 1;
    let nextIdx: number | null = null;
    if (e.key === "ArrowRight") nextIdx = idx === last ? 0 : idx + 1;
    else if (e.key === "ArrowLeft") nextIdx = idx === 0 ? last : idx - 1;
    else if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = last;
    if (nextIdx !== null) {
      e.preventDefault();
      const nextKey = items[nextIdx].key;
      onChange(nextKey);
      btnRefs.current[nextKey]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: 3,
        background: "var(--background)",
        border: "1px solid var(--border)",
        borderRadius: 9999,
      }}
    >
      {items.map((item, i) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            ref={(el) => {
              btnRefs.current[item.key] = el;
            }}
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.key)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? "var(--foreground)" : "var(--muted)",
              background: isActive ? "var(--panel)" : "transparent",
              border: "1px solid",
              borderColor: isActive ? "var(--border)" : "transparent",
              borderRadius: 9999,
              cursor: "pointer",
              transition: "color 0.15s ease-out, background 0.15s ease-out",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = "var(--foreground)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = "var(--muted)";
            }}
          >
            {item.icon?.(isActive)}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
