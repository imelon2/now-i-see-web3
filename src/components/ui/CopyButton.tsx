"use client";

import { useState } from "react";

interface Props {
  text: string;
  size?: "sm" | "md";
}

export function CopyButton({ text, size = "sm" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iconSize = size === "sm" ? 14 : 16;

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy"}
      style={{
        padding: size === "sm" ? "3px 6px" : "5px 8px",
        background: "transparent",
        border: "1px solid transparent",
        color: copied ? "var(--success)" : "var(--muted)",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        transition: "color 0.15s",
      }}
    >
      {copied ? (
        /* Check icon */
        <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,8 6,12 14,4" />
        </svg>
      ) : (
        /* Clipboard icon */
        <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="8" height="11" rx="1" />
          <path d="M5 4H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-1" />
        </svg>
      )}
    </button>
  );
}
