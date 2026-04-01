"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TxInfoPanel } from "@/components/widgets/TxInfoPanel";
import { CalldataResultSection } from "@/components/widgets/CalldataResultSection";
import { EventLogView } from "@/components/widgets/EventLogView";
import { useTxSearch } from "@/hooks/useTxSearch";
import { isValidHex } from "@/lib/utils/hex";
import { supportedChains } from "@/lib/chains/chainList";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { SupportedChainsPopup } from "@/components/widgets/SupportedChainsPopup";
import { AbiArchiveLink } from "@/components/ui/AbiArchiveLink";

function TxAnalyzerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hashFromUrl = searchParams.get("hash") ?? "";

  const { status, result, error, search, reset } = useTxSearch();
  const [inputHash, setInputHash] = useState(hashFromUrl);
  const [validationError, setValidationError] = useState("");

  const loading = status === "searching";

  // Sync input field and auto-search when URL hash param changes
  useEffect(() => {
    if (hashFromUrl) {
      setInputHash(hashFromUrl);
      if (isValidHex(hashFromUrl) && hashFromUrl.length === 66) {
        search(hashFromUrl);
      }
    } else {
      setInputHash("");
      reset();
    }
  }, [hashFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const trimmed = inputHash.trim();
    if (!trimmed) {
      setValidationError("Please enter a transaction hash.");
      return;
    }
    if (!isValidHex(trimmed) || trimmed.length !== 66) {
      setValidationError(
        "Invalid hash. Enter a 66-char hex starting with 0x."
      );
      return;
    }
    setValidationError("");
    // Push hash to URL
    router.push(`/tx-analyzer?hash=${trimmed}`);
  };

  const hasCalldata =
    result?.txInfo.input &&
    result.txInfo.input !== "0x";

  return (
    <main style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Page intro */}
          <div className="page-intro" style={{ paddingBottom: 16, borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2em", fontWeight: 700, margin: "0 0 10px" }}>
              Transaction Analyzer
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 8px", lineHeight: 1.7 }}>
              Enter any EVM transaction hash to instantly retrieve full on-chain details — block number, timestamp,
              from/to addresses, value transferred, gas used, decoded calldata, and event logs. Searches across
              Ethereum, Arbitrum, Optimism, Base, Polygon, BNB Chain, Avalanche, and more in parallel.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 8px", lineHeight: 1.7 }}>
              This is a pure developer debugging tool. It has no wallet connection, no token transfers, no payments,
              and no cryptocurrency investment features — only on-chain data inspection.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 12px", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--foreground)" }}>How to use:</strong> Paste a 66-character transaction
              hash starting with <code style={{ fontSize: 12 }}>0x</code> into the search box below and press{" "}
              <strong style={{ color: "var(--foreground)" }}>Search</strong>.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", alignItems: "center" }}>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>Try an example:</span>
              <a
                href="/tx-analyzer?hash=0x6c4a761a25a3deeaecbaea8aa1774271cd8c11c774e25a309bbae62d99b982ff"
                style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none" }}
              >
                Example TX #1 →
              </a>
              <a
                href="/tx-analyzer?hash=0x1416a84f25468f558199cb562939f1e8db305cb5ed2e6e1e0c1a0f8e0fd92b58"
                style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none" }}
              >
                Example TX #2 →
              </a>
              <a
                href="/docs/tx-analyzer"
                style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none", marginLeft: "auto" }}
              >
                Full Guide →
              </a>
            </div>
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
                  fontWeight: 600,
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
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSearch()}
                  disabled={loading}
                  style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 14 }}
                  autoFocus={!hashFromUrl}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  style={{
                    background: loading ? "var(--muted)" : "var(--accent)",
                    color: "#000",
                    border: "none",
                    fontWeight: 600,
                    minWidth: 90,
                    transition: "background 0.15s",
                  }}
                >
                  {loading ? "Searching…" : "Search"}
                </button>
              </div>
              {validationError && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px 12px",
                    borderRadius: 4,
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

          {/* Loading */}
          {loading && (
            <LoadingSpinner
              message="Searching across chains…"
              subMessage={`Querying ${supportedChains.length} chains in parallel`}
            />
          )}

          {/* Not found */}
          {status === "not-found" && (
            <div className="panel">
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="32" height="32" viewBox="0 0 16 16" fill="none" stroke="var(--warning)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6.5" cy="6.5" r="4.5" />
                  <line x1="10.5" y1="10.5" x2="14" y2="14" />
                  <line x1="4.5" y1="6.5" x2="8.5" y2="6.5" />
                </svg>
                <p style={{ color: "var(--warning)", fontWeight: 600, margin: 0 }}>
                  Transaction not found
                </p>
                <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                  The transaction was not found on any of the {supportedChains.length} supported chains.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && error && (
            <ErrorDisplay kind="rpc" message={error} />
          )}

          {/* Result */}
          {status === "found" && result && (
            <>
              <TxInfoPanel txInfo={result.txInfo} />

              {hasCalldata && (
                <CalldataResultSection
                  calldata={result.txInfo.input}
                  decodedList={result.decodedCalldataVariants}
                />
              )}

              <EventLogView
                rawLogs={result.rawLogs}
                decodedEventVariants={result.decodedEventVariants}
              />
            </>
          )}
        </div>
      </main>
  );
}

// useSearchParams must be inside a Suspense boundary
export default function TxAnalyzerPage() {
  return (
    <Suspense>
      <TxAnalyzerContent />
    </Suspense>
  );
}
