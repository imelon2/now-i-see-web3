"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeSelector } from "@/lib/utils/selectorSearch";
import { DetailsToggle } from "@/components/ui/DetailsToggle";

export default function SearchFunctionSelectorPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSearch() {
    const normalized = normalizeSelector(input);
    if (!normalized) {
      setError("Invalid selector. Enter a 4-byte hex value (e.g. 0xe45929eb).");
      return;
    }
    setError(null);
    router.push(`/search-function-selector/${normalized}`);
  }

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Page header */}
        <div>
          <h1 style={{ fontSize: "1.5em", fontWeight: 400, margin: "0 0 6px" }}>
            Search Function Selector
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            Look up EVM function names by their 4-byte selector.
          </p>
        </div>

        {/* Input panel */}
        <div className="panel">
          <div className="panel-header">
            <span>Function Selector Lookup</span>
          </div>
          <div className="panel-body">
            <label
              htmlFor="selector-input"
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--muted)",
                marginBottom: 6,
                fontWeight: 400,
              }}
            >
              Selector Hex
            </label>
            <input
              id="selector-input"
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="0xe45929eb"
              style={{
                width: "100%",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
              }}
            />

            {error && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: "rgba(248,81,73,0.1)",
                  border: "1px solid rgba(248,81,73,0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--error)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6" />
                  <line x1="8" y1="5.5" x2="8" y2="8.5" />
                  <circle cx="8" cy="10.5" r="0.5" fill="var(--error)" />
                </svg>
                <span style={{ color: "var(--error)", fontSize: 13 }}>
                  {error}
                </span>
              </div>
            )}

            <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSearch}
                style={{
                  background: "var(--foreground)",
                  color: "var(--background)",
                  border: "1px solid var(--border)",
                  fontWeight: 400,
                  minWidth: 90,
                  transition: "background 0.15s",
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* About this tool */}
        <DetailsToggle summary="About this tool">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              A <strong style={{ color: "var(--foreground)" }}>function selector</strong> is the
              first 4 bytes of the keccak256 hash of a Solidity function signature. It identifies
              which function to call in a smart contract.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              For example, <code style={{ fontSize: 12 }}>transfer(address,uint256)</code>{" "}
              produces selector <code style={{ fontSize: 12 }}>0xa9059cbb</code>.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "var(--foreground)" }}>How to use:</strong>{" "}
              Enter a 4-byte hex selector (e.g. <code style={{ fontSize: 12 }}>0xe45929eb</code>)
              and press <strong style={{ color: "var(--foreground)" }}>Search</strong> to find all
              known matching function signatures from the{" "}
              <a href="https://github.com/imelon2/abi-archive-trie" target="_blank" rel="noopener noreferrer" style={{ color: "var(--foreground)", textDecoration: "underline" }}>ABI Archive</a>.
            </p>
          </div>
        </DetailsToggle>
      </div>
    </main>
  );
}
