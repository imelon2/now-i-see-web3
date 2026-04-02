"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  summary: string;
  children: React.ReactNode;
}

export function DetailsToggle({ summary, children }: Props) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const measure = useCallback(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, []);

  useEffect(() => {
    measure();
  }, [children, measure]);

  return (
    <div>
      <button
        onClick={() => {
          if (!open) measure();
          setOpen((v) => !v);
        }}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "var(--muted)",
          fontSize: 13,
          userSelect: "none",
          transition: "color 0.2s",
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}
        >
          <polyline points="3,1 7,5 3,9" />
        </svg>
        {summary}
      </button>
      <div
        ref={contentRef}
        style={{
          overflow: "hidden",
          maxHeight: open ? height : 0,
          opacity: open ? 1 : 0,
          transition: "max-height 0.35s ease, opacity 0.3s ease",
        }}
      >
        <div style={{ paddingTop: 12 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
