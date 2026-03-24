"use client";

import { useState } from "react";
import { CalldataResultSection } from "@/components/widgets/CalldataResultSection";
import { decodeCalldata } from "@/lib/utils/decoder";
import { isValidHex } from "@/lib/utils/hex";
import type { DecodedCalldata } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AbiArchiveLink } from "@/components/ui/AbiArchiveLink";

type Status = "idle" | "decoding" | "done";

export default function CalldataDecoderPage() {
  const [input, setInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [decoded, setDecoded] = useState<DecodedCalldata | null>(null);
  const [submittedCalldata, setSubmittedCalldata] = useState("");

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
      setValidationError("Please enter calldata.");
      return;
    }
    if (!isValidHex(trimmed)) {
      setValidationError("Invalid hex. Must start with 0x.");
      return;
    }
    if (trimmed.length < 10) {
      setValidationError(
        "Calldata too short. Enter at least 4 bytes (function selector)."
      );
      return;
    }

    setStatus("decoding");
    setDecoded(null);
    setSubmittedCalldata(trimmed);

    const result = await decodeCalldata(trimmed);
    setDecoded(result);
    setStatus("done");
  };

  return (
    <main style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Page intro */}
          <div className="page-intro" style={{ paddingBottom: 16, borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2em", fontWeight: 700, margin: "0 0 10px" }}>
              Calldata Decoder
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 8px", lineHeight: 1.7 }}>
              Paste any raw calldata hex string and instantly see the decoded function name, parameter types, and
              values. The decoder extracts the first 4 bytes as a function selector, looks it up against the{" "}
              <a href="https://github.com/imelon2/abi-archive-trie" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                abi-archive-trie
              </a>{" "}
              signature database, and ABI-decodes the remaining bytes into human-readable parameters.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 8px", lineHeight: 1.7 }}>
              This is a read-only developer tool for inspecting on-chain data. It performs no transactions,
              has no wallet integration, and involves no cryptocurrency transfers or payments.
            </p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 12px", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--foreground)" }}>How to use:</strong> Paste a hex string starting
              with <code style={{ fontSize: 12 }}>0x</code> (minimum 4 bytes / 10 characters) into the input
              below and press <strong style={{ color: "var(--foreground)" }}>Decode</strong>.
            </p>
            <a
              href="/docs/calldata-decoder"
              style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none" }}
            >
              Full Guide →
            </a>
          </div>

          {/* Input panel */}
          <div className="panel">
            <div className="panel-header">
              <span>Calldata Decoder</span>
            </div>
            <div className="panel-body">
              <textarea
                placeholder="Enter calldata hex starting with 0x (e.g. 0xa9059cbb000...)"
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                rows={4}
                style={{ resize: "vertical", minHeight: 80 }}
              />
              {validationError && (
                <p style={{ color: "var(--error)", fontSize: 14, marginTop: 6 }}>
                  {validationError}
                </p>
              )}
              <div className="action-row" style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <AbiArchiveLink />
                <button
                  onClick={handleDecode}
                  disabled={status === "decoding" || !!validationError}
                  style={{
                    background: "var(--accent)",
                    color: "#000",
                    border: "none",
                    fontWeight: 600,
                    minWidth: 80,
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
          {status === "done" && submittedCalldata && (
            <CalldataResultSection
              calldata={submittedCalldata}
              decoded={decoded}
            />
          )}
        </div>
      </main>
  );
}
