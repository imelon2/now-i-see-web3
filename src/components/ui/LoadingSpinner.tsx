"use client";

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

export function LoadingSpinner({ message, subMessage }: LoadingSpinnerProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        gap: 12,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          border: "2px solid var(--border)",
          borderTop: "2px solid var(--accent)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      {message && (
        <span style={{ color: "var(--muted)", fontSize: 15 }}>{message}</span>
      )}
      {subMessage && (
        <span style={{ color: "var(--muted)", fontSize: 13 }}>{subMessage}</span>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
