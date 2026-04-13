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
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "var(--foreground)",
          marginBottom: 6,
        }}
      >
        Search Function Selector
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--muted)",
          marginBottom: 24,
        }}
      >
        Look up EVM function names by their 4-byte selector.
      </p>

      <div className="panel">
        <div className="panel-header">Function Selector Lookup</div>
        <div className="panel-body">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="0xe45929eb"
              style={{
                flex: 1,
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                padding: "8px 16px",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: "8px 20px",
                borderRadius: 9999,
                background: "var(--foreground)",
                color: "var(--background)",
                border: "none",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Search
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--error)",
                fontSize: 13,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="8" cy="8" r="6" />
                <line x1="8" y1="5" x2="8" y2="9" />
                <circle cx="8" cy="11" r="0.5" fill="currentColor" />
              </svg>
              {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <DetailsToggle summary="About this tool">
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--muted)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <p>
              A <strong style={{ color: "var(--foreground)" }}>function selector</strong> is the
              first 4 bytes of the keccak256 hash of a Solidity function signature. It identifies
              which function to call in a smart contract.
            </p>
            <p>
              For example, <code style={{ fontFamily: "var(--font-mono)" }}>transfer(address,uint256)</code>{" "}
              produces selector <code style={{ fontFamily: "var(--font-mono)" }}>0xa9059cbb</code>.
            </p>
            <p>
              This tool performs a reverse lookup: given a selector hex, it finds all known
              matching function signatures from the{" "}
              <a
                href="https://github.com/imelon2/abi-archive-trie"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--foreground)", textDecoration: "underline" }}
              >
                ABI Archive
              </a>.
            </p>
          </div>
        </DetailsToggle>
      </div>
    </div>
  );
}
