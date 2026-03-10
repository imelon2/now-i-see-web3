"use client";

import { useState } from "react";
import { ErrorDecoderPanel } from "@/components/widgets/ErrorDecoderPanel";
import { RawCalldataView } from "@/components/widgets/RawCalldataView";
import { decodeError } from "@/lib/utils/decoder";
import { isValidHex } from "@/lib/utils/hex";
import type { DecodedError } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type Status = "idle" | "decoding" | "done";
type FailureReason = "no-abi" | "decode-failed" | undefined;

export default function ErrorDecoderPage() {
  const [input, setInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [decoded, setDecoded] = useState<DecodedError | null>(null);
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
    setDecoded(null);
    setFailureReason(undefined);
    setSubmittedData(trimmed);

    const result = await decodeError(trimmed);

    if (result.status === "success") {
      setDecoded(result.data);
      setFailureReason(undefined);
    } else {
      setDecoded(null);
      setFailureReason(result.status);
    }
    setStatus("done");
  };

  return (
    <main style={{ padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Page intro */}
          <div style={{ paddingBottom: 8, borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2em", fontWeight: 700, margin: "0 0 6px" }}>
              Error Data Decoder
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              Easily decode Ethereum error data with this tool. Enter hex data to see the decoded results.
            </p>
          </div>

          {/* Input panel */}
          <div className="panel">
            <div className="panel-header">
              <span>Error Decoder</span>
            </div>
            <div className="panel-body">
              <textarea
                placeholder="Enter error data hex starting with 0x (e.g. 0x08c379a0000...)"
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
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleDecode}
                  disabled={status === "decoding" || !!validationError}
                  style={{
                    background: "var(--error)",
                    color: "#fff",
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
          {status === "done" && submittedData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ErrorDecoderPanel
                errorData={submittedData}
                decoded={decoded}
                failureReason={failureReason}
              />
              <RawCalldataView calldata={submittedData} />
            </div>
          )}
        </div>
      </main>
  );
}
