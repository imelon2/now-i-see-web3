"use client";

import React from "react";

export type ErrorKind = "network" | "rpc" | "abi-fetch" | "generic";

interface ErrorDisplayProps {
  kind?: ErrorKind;
  message: string;
}

const KIND_LABEL: Record<ErrorKind, string> = {
  network:   "Network Error",
  rpc:       "RPC Error",
  "abi-fetch": "ABI Fetch Error",
  generic:   "Error",
};

const KIND_HINT: Record<ErrorKind, string> = {
  network:   "Check your internet connection or try again later.",
  rpc:       "RPC node error. Please try again later.",
  "abi-fetch": "Failed to fetch data from ABI archive.",
  generic:   "",
};

export function ErrorDisplay({ kind = "generic", message }: ErrorDisplayProps) {
  const hint = KIND_HINT[kind];

  return (
    <div
      style={{
        background: "rgba(248,81,73,0.06)",
        border: "1px solid rgba(248,81,73,0.3)",
        borderRadius: 12,
        padding: "12px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: hint ? 6 : 0,
        }}
      >
        <span style={{ color: "var(--error)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          ✗ {KIND_LABEL[kind]}
        </span>
      </div>
      {(() => {
        const lines = message.split("\n");
        const title = lines[0];
        const details = lines.slice(1).join("\n");
        return (
          <>
            <p style={{ color: "var(--foreground)", fontSize: 15, margin: 0 }}>{title}</p>
            {details && (
              <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4, marginBottom: 0, whiteSpace: "pre-line" }}>{details}</p>
            )}
          </>
        );
      })()}
      {hint && (
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4, marginBottom: 0 }}>
          {hint}
        </p>
      )}
    </div>
  );
}
