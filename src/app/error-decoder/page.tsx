"use client";

import { useState } from "react";
import { ErrorDecoderPanel } from "@/components/widgets/ErrorDecoderPanel";
import { RawCalldataView } from "@/components/widgets/RawCalldataView";
import { decodeErrorAll } from "@/lib/utils/decoder";
import { isValidHex } from "@/lib/utils/hex";
import type { DecodedError } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AbiArchiveLink } from "@/components/ui/AbiArchiveLink";

type Status = "idle" | "decoding" | "done";
type FailureReason = "no-abi" | "decode-failed" | undefined;

export default function ErrorDecoderPage() {
  const [input, setInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [decodedList, setDecodedList] = useState<DecodedError[]>([]);
  const [abiIndex, setAbiIndex] = useState(0);
  const [failureReason, setFailureReason] = useState<FailureReason>(undefined);
  const [submittedData, setSubmittedData] = useState("");

  const handleChange = (value: string) => {
    setInput(value);
    const trimmed = value.trim();
    if (trimmed && !isValidHex(trimmed)) {
      setValidationError("Invalid hex string. Must start with 0x.");
    } else {
      setValidationError("");
    }
  };

  const handleDecode = async () => {
    const trimmed = input.trim();

    if (!trimmed) {
      setValidationError("Please enter error data.");
      return;
    }
    if (!isValidHex(trimmed)) {
      setValidationError("Invalid hex. Must start with 0x.");
      return;
    }
    if (trimmed.length < 10) {
      setValidationError(
        "Error data too short. Enter at least 4 bytes (error selector)."
      );
      return;
    }

    setStatus("decoding");
    setDecodedList([]);
    setAbiIndex(0);
    setFailureReason(undefined);
    setSubmittedData(trimmed);

    const { results, failureReason: reason } = await decodeErrorAll(trimmed);
    setDecodedList(results);
    setFailureReason(results.length > 0 ? undefined : reason);
    setStatus("done");
  };

  const decoded = decodedList.length > 0 ? decodedList[abiIndex] ?? null : null;

  return (
    <main style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Page intro */}
          <div className="page-intro" style={{ paddingBottom: 16, borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2em", fontWeight: 700, margin: "0 0 10px" }}>
              Error Data Decoder
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 8px", lineHeight: 1.7 }}>
              When a Solidity smart contract transaction reverts, the EVM returns ABI-encoded revert data that is
              impossible to read without decoding. Paste the raw revert hex and this tool will identify and decode
              it as a standard <code style={{ fontSize: 12 }}>Error(string)</code>, a{" "}
              <code style={{ fontSize: 12 }}>Panic(uint256)</code> code (e.g. overflow, division by zero,
              out-of-bounds), or any custom error defined in a contract ABI.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 8px", lineHeight: 1.7 }}>
              This is a read-only developer debugging tool. It performs no transactions, has no wallet
              integration, and involves no cryptocurrency transfers or payments.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 12px", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--foreground)" }}>How to use:</strong> Paste the revert data hex
              starting with <code style={{ fontSize: 12 }}>0x</code> (minimum 4 bytes / 10 characters) into
              the input below and press <strong style={{ color: "var(--foreground)" }}>Decode</strong>.
            </p>
            <a
              href="/docs/error-decoder"
              style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none" }}
            >
              Full Guide →
            </a>
          </div>

          {/* Input panel */}
          <div className="panel">
            <div className="panel-header">
              <span>Error Decoder</span>
            </div>
            <div className="panel-body">
              <label
                htmlFor="error-data-input"
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--muted)",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Error Data Hex
              </label>
              <textarea
                id="error-data-input"
                placeholder="0x08c379a0000..."
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                rows={4}
                style={{ resize: "vertical", minHeight: 80, fontFamily: "var(--font-mono)", fontSize: 13 }}
              />
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
              <div className="action-row" style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <AbiArchiveLink />
                <button
                  onClick={handleDecode}
                  disabled={status === "decoding" || !!validationError}
                  style={{
                    background: status === "decoding" ? "var(--muted)" : "var(--error)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    minWidth: 90,
                    transition: "background 0.15s",
                  }}
                >
                  {status === "decoding" ? "Decoding…" : "Decode"}
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {status === "decoding" && (
            <LoadingSpinner message="Fetching ABI and decoding…" />
          )}

          {/* Result */}
          {status === "done" && submittedData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ErrorDecoderPanel
                errorData={submittedData}
                decoded={decoded}
                failureReason={failureReason}
                abiIndex={abiIndex}
                abiTotal={decodedList.length}
                onPrev={() => setAbiIndex((i) => Math.max(0, i - 1))}
                onNext={() => setAbiIndex((i) => Math.min(decodedList.length - 1, i + 1))}
              />
              <RawCalldataView calldata={submittedData} />
            </div>
          )}
        </div>
      </main>
  );
}
