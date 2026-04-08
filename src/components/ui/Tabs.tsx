"use client";

import React, { useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface TabItem<K extends string = string> {
  key: K;
  label: string;
  icon?: (active: boolean) => React.ReactNode;
  /** When true, adds a subtle pulsing glow around the tab button. */
  aura?: boolean;
}

export interface TabPanel<K extends string = string> {
  key: K;
  content: React.ReactNode;
}

export interface TabsProps<K extends string = string> {
  items: TabItem<K>[];
  active: K;
  onChange: (key: K) => void;
  idPrefix?: string;
  /**
   * All panels are mounted simultaneously and stacked in a single CSS grid
   * cell so the container auto-sizes to the tallest panel. Inactive panels
   * are visually hidden but stay in the layout.
   */
  panels: TabPanel<K>[];
}

/**
 * Animated pill tabs (FAQ-tabs style) with framer-motion bottom-up fill.
 * Accessible: role=tablist/tab/tabpanel, aria-selected, aria-controls,
 * roving tabIndex, ArrowLeft/Right/Home/End keyboard nav.
 *
 * Stable height: panels are grid-stacked so the parent height equals the
 * tallest panel and never reflows on tab switch.
 */
export function Tabs<K extends string = string>({
  items,
  active,
  onChange,
  idPrefix = "tab",
  panels,
}: TabsProps<K>) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusTab = useCallback((key: string) => {
    tabRefs.current[key]?.focus();
  }, []);

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
      focusTab(nextKey);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        role="tablist"
        aria-label="Transaction result sections"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          position: "relative",
          zIndex: 1,
        }}
      >
        {items.map((item, i) => {
          const isActive = item.key === active;
          const tabId = `${idPrefix}-tab-${item.key}`;
          const panelId = `${idPrefix}-panel-${item.key}`;
          return (
            <button
              key={item.key}
              ref={(el) => {
                tabRefs.current[item.key] = el;
              }}
              role="tab"
              id={tabId}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(item.key)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={item.aura ? "tab-aura" : undefined}
              style={{
                position: "relative",
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 500,
                lineHeight: 1.4,
                borderRadius: 6,
                border: `1px solid ${isActive ? "var(--foreground)" : "var(--border)"}`,
                background: "transparent",
                color: isActive ? "var(--background)" : "var(--muted)",
                cursor: "pointer",
                transition: "color 0.5s ease, border-color 0.5s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--foreground)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--muted)";
              }}
            >
              <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 6 }}>
                {item.icon?.(isActive)}
                {item.label}
              </span>
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    aria-hidden
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.5, ease: "backIn" }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 0,
                      background: "var(--foreground)",
                    }}
                  />
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateAreas: '"stack"',
          alignItems: "start",
        }}
      >
        {panels.map(({ key, content }) => {
          const isActive = key === active;
          const tabId = `${idPrefix}-tab-${key}`;
          const panelId = `${idPrefix}-panel-${key}`;
          return (
            <motion.div
              key={key}
              role="tabpanel"
              id={panelId}
              aria-labelledby={tabId}
              aria-hidden={!isActive}
              initial={false}
              animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 12 }}
              transition={{ duration: 0.3, ease: "backIn" }}
              style={{
                gridArea: "stack",
                pointerEvents: isActive ? "auto" : "none",
                visibility: isActive ? "visible" : "hidden",
                minWidth: 0,
              }}
            >
              {content}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
