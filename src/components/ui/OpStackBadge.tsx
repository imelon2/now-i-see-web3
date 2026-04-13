"use client";

import { getDecodingTag } from "@/lib/decodingTags";

const TAG = getDecodingTag("optimism-format")!;

/**
 * OP Stack badge using the shared "optimism-format" DecodingTag style.
 * Used in Deposit/Withdrawal Process panel headers.
 */
export function OpStackBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 9999,
        background: TAG.bg,
        color: TAG.color,
        border: `1px solid ${TAG.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {TAG.label}
    </span>
  );
}
