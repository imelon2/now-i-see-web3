"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TxInfoPanel } from "@/components/widgets/TxInfoPanel";
import { CalldataResultSection } from "@/components/widgets/CalldataResultSection";
import { EventLogView } from "@/components/widgets/EventLogView";
import { useTxSearch } from "@/hooks/useTxSearch";
import { isValidHex } from "@/lib/utils/hex";
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
    result.txInfo.input !== "0x" &&
    result.txInfo.input.length >= 10;

  return (
    <main style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Page intro */}
          <div style={{ paddingBottom: 8, borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2em", fontWeight: 700, margin: "0 0 6px" }}>
              Transaction Analyzer
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              Analyze and decode EVM blockchain transaction data with our powerful tools.
              Get detailed insights into transaction information, method calls, events, and batch data.
            </p>
          </div>

          {/* Search bar */}
          <div className="panel">
            <div className="panel-header">
              <span>Transaction Search</span>
            </div>
            <div className="panel-body">
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Transaction hash (0x...)"
                  value={inputHash}
                  onChange={(e) => {
                    setInputHash(e.target.value);
                    setValidationError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSearch()}
                  disabled={loading}
                  style={{ flex: 1 }}
                  autoFocus={!hashFromUrl}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  style={{
                    background: "var(--accent)",
                    color: "#000",
                    border: "none",
                    fontWeight: 600,
                    minWidth: 80,
                  }}
                >
                  {loading ? "Searching…" : "Search"}
                </button>
              </div>
              {validationError && (
                <p style={{ color: "var(--error)", fontSize: 14, marginTop: 6 }}>
                  {validationError}
                </p>
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
              subMessage="Querying 12 chains in parallel"
            />
          )}

          {/* Not found */}
          {status === "not-found" && (
            <div className="panel" style={{ textAlign: "center", padding: 40 }}>
              <p style={{ color: "var(--warning)", marginBottom: 8 }}>
                Transaction not found
              </p>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>
                The transaction was not found on any supported chain.
              </p>
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
                  decoded={result.decodedCalldata}
                />
              )}

              <EventLogView
                rawLogs={result.rawLogs}
                decodedEvents={result.decodedEvents}
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
