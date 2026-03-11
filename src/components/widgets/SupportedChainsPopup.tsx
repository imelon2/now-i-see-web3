"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supportedChains } from "@/lib/chains/chainList";

function Modal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const filtered = supportedChains.filter((chain) =>
    chain.name.toLowerCase().includes(query.toLowerCase())
  );

  // ESC key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          zIndex: 900,
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal card */}
      <div
        style={{
          position: "fixed",
          top: "15vh",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 901,
          background: "var(--panel-header)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          width: "min(420px, calc(100vw - 32px))",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          animation: "slideUp 0.18s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 2 C5 5 5 11 8 14 C11 11 11 5 8 2Z" />
              <line x1="2" y1="8" x2="14" y2="8" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>
              Supported Chains
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--accent)",
                background: "rgba(88,166,255,0.1)",
                border: "1px solid rgba(88,166,255,0.25)",
                borderRadius: 10,
                padding: "1px 8px",
              }}
            >
              {filtered.length} / {supportedChains.length}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              padding: 4,
              lineHeight: 1,
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        {/* Search input */}
        <div style={{ padding: "10px 12px 0", flexShrink: 0 }}>
          <input
            autoFocus
            type="text"
            placeholder="Search chains..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", fontSize: 13, boxSizing: "border-box" }}
          />
        </div>

        {/* Chain list */}
        <div style={{ overflowY: "auto", padding: "8px 12px 12px" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>
              No chains found
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filtered.map((chain) => {
              const rpcUrl = chain.rpcUrls.default.http[0] ?? "";
              return (
                <div
                  key={chain.id}
                  style={{
                    padding: "8px 10px",
                    background: "var(--background)",
                    borderRadius: 5,
                    fontSize: 13,
                  }}
                >
                  {/* Row 1: Name + badges */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "var(--foreground)", fontWeight: 500 }}>
                      {chain.name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <code style={{ fontSize: 11, color: "var(--muted)" }}>
                        {chain.id}
                      </code>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        {chain.nativeCurrency.symbol}
                      </span>
                    </div>
                  </div>
                  {/* Row 2: RPC URL */}
                  <div style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {rpcUrl}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>,
    document.body
  );
}

export function SupportedChainsPopup() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--muted)",
          fontSize: 12,
          padding: "4px 10px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          borderRadius: 4,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 2 C5 5 5 11 8 14 C11 11 11 5 8 2Z" />
          <line x1="2" y1="8" x2="14" y2="8" />
        </svg>
        Supported Chains ({supportedChains.length})
      </button>

      {open && <Modal onClose={() => setOpen(false)} />}
    </>
  );
}
