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

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: size === "sm" ? "2px 8px" : "6px 14px",
        fontSize: 11,
        background: "transparent",
        color: copied ? "var(--success)" : "var(--muted)",
        borderColor: "var(--border)",
        flexShrink: 0,
      }}
    >
      {copied ? "✓ 복사됨" : "복사"}
    </button>
  );
}
