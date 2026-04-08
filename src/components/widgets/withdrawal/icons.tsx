"use client";

import { useState } from "react";

export const PHASE_ICONS = {
  initiate: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v12M2 8l6-6 6 6" />
    </svg>
  ),
  prove: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L3 4v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V4L8 2Z" />
    </svg>
  ),
  finalize: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 8 6 12 14 4" />
    </svg>
  ),
  check: (color: string) => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 8 7 12 13 4" />
    </svg>
  ),
};

export function StatusDescIcon({ icon, color }: { icon: "info" | "action" | "check"; color: string }) {
  const sharedProps = {
    width: 14,
    height: 14,
    viewBox: "0 0 16 16",
    fill: "none" as const,
    stroke: color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { flexShrink: 0, marginTop: 2 },
  };

  if (icon === "check") {
    return (
      <svg {...sharedProps} strokeWidth="1.8">
        <polyline points="3 8 7 12 13 4" />
      </svg>
    );
  }
  if (icon === "action") {
    return (
      <svg {...sharedProps} strokeWidth="1.6">
        <circle cx="8" cy="8" r="6" />
        <path d="M6 8l2 2 4-4" />
      </svg>
    );
  }
  return (
    <svg {...sharedProps} strokeWidth="1.6">
      <circle cx="8" cy="8" r="6" />
      <line x1="8" y1="7" x2="8" y2="11" />
      <circle cx="8" cy="5" r="0.5" fill={color} stroke="none" />
    </svg>
  );
}

export function InfoDot({ tip }: { tip: string }) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: "relative", marginLeft: 5.2, marginBottom: -4, cursor: "help", zIndex: 2, width: 8, height: 8 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0369a1", boxShadow: show ? "0 0 4px rgba(3,105,161,0.5)" : "none", transition: "box-shadow 0.15s" }} />
      {show && (
        <div style={{
          position: "absolute", left: 12, top: -6,
          background: "color-mix(in srgb, #394950 5%, var(--panel))", border: "1px solid color-mix(in srgb, #7dd3fc 20%, var(--border))",
          padding: "4px 10px", fontSize: 11, color: "var(--foreground)",
          whiteSpace: "nowrap", zIndex: 10,
        }}>
          {tip}
        </div>
      )}
    </div>
  );
}
