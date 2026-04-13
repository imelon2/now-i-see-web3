"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserChains } from "@/hooks/useUserChains";
import { isValidHex } from "@/lib/utils/hex";
import { supportedChains } from "@/lib/chains/chainList";
import { SupportedChainsPopup } from "@/components/widgets/SupportedChainsPopup";
import { AbiArchiveLink } from "@/components/ui/AbiArchiveLink";
import { DetailsToggle } from "@/components/ui/DetailsToggle";

export default function TxAnalyzerPage() {
  const router = useRouter();
  const { viemChains: userViemChains } = useUserChains();
  const totalChains = supportedChains.length + userViemChains.length;
  const [inputHash, setInputHash] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSearch = () => {
    const trimmed = inputHash.trim();
    if (!trimmed) {
      setValidationError("Please enter a transaction hash.");
      return;
    }
    if (!isValidHex(trimmed) || trimmed.length !== 66) {
      setValidationError("Invalid hash. Enter a 66-char hex starting with 0x.");
      return;
    }
    setValidationError("");
    router.push(`/tx-analyzer/${trimmed}`);
  };

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Page header */}
        <div>
          <h1 style={{ fontSize: "1.5em", fontWeight: 400, margin: "0 0 6px" }}>
            Transaction Analyzer
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            Search a tx hash across {totalChains}+ chains in parallel.
          </p>
        </div>

        {/* Search bar */}
        <div className="panel">
          <div className="panel-header">
            <span>Transaction Search</span>
          </div>
          <div className="panel-body">
            <label
              htmlFor="tx-hash-input"
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--muted)",
                marginBottom: 6,
                fontWeight: 400,
              }}
            >
              Transaction Hash
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="tx-hash-input"
                type="text"
                placeholder="0x..."
                value={inputHash}
                onChange={(e) => {
                  setInputHash(e.target.value);
                  setValidationError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 14 }}
                autoFocus
              />
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
            {validationError && (
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
                  {validationError}
                </span>
              </div>
            )}
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <SupportedChainsPopup />
              <AbiArchiveLink />
            </div>
          </div>
        </div>

        {/* About this tool */}
        <DetailsToggle summary="About this tool">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              Enter any EVM transaction hash to instantly retrieve full on-chain details — block number, timestamp,
              from/to addresses, value transferred, gas used, decoded calldata, and event logs.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              This is a pure developer debugging tool. It has no wallet connection, no token transfers, no payments,
              and no cryptocurrency investment features — only on-chain data inspection.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "var(--foreground)" }}>How to use:</strong> Paste a 66-character transaction
              hash starting with <code style={{ fontSize: 12 }}>0x</code> into the search box above and press{" "}
              <strong style={{ color: "var(--foreground)" }}>Search</strong>.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", alignItems: "center" }}>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>Try an example:</span>
              <a href="/tx-analyzer/0x6c4a761a25a3deeaecbaea8aa1774271cd8c11c774e25a309bbae62d99b982ff" style={{ color: "var(--foreground)", fontSize: 13, textDecoration: "none" }}>Example TX #1 →</a>
              <a href="/tx-analyzer/0x1416a84f25468f558199cb562939f1e8db305cb5ed2e6e1e0c1a0f8e0fd92b58" style={{ color: "var(--foreground)", fontSize: 13, textDecoration: "none" }}>Example TX #2 →</a>
              <a href="/docs/tx-analyzer" style={{ color: "var(--foreground)", fontSize: 13, textDecoration: "none", marginLeft: "auto" }}>Full Guide →</a>
            </div>
          </div>
        </DetailsToggle>
      </div>
    </main>
  );
}
