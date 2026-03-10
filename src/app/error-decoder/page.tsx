"use client";

import { useState } from "react";
import { NavBar } from "@/components/ui/NavBar";
import { ErrorDecoderPanel } from "@/components/widgets/ErrorDecoderPanel";
import { RawCalldataView } from "@/components/widgets/RawCalldataView";
import { decodeError } from "@/lib/utils/decoder";
import { isValidHex } from "@/lib/utils/hex";
import type { DecodedError } from "@/types";

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
      setValidationError(
        "유효하지 않은 hex 문자열입니다. 0x로 시작하는 hex를 입력하세요."
      );
    } else {
      setValidationError("");
    }
  };

  const handleDecode = async () => {
    const trimmed = input.trim();

    if (!trimmed) {
      setValidationError("에러 데이터를 입력하세요.");
      return;
    }
    if (!isValidHex(trimmed)) {
      setValidationError("유효하지 않은 hex 문자열입니다. 0x로 시작해야 합니다.");
      return;
    }
    if (trimmed.length < 10) {
      setValidationError(
        "에러 데이터가 너무 짧습니다. error selector(4바이트) 이상 입력하세요."
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />

      <main
        style={{
          flex: 1,
          padding: 20,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 입력 패널 */}
          <div className="panel">
            <div className="panel-header">
              <span>Error Decoder</span>
            </div>
            <div className="panel-body">
              <textarea
                placeholder="0x로 시작하는 에러 데이터 hex를 입력하세요 (예: 0x08c379a0000...)"
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                rows={4}
                style={{ resize: "vertical", minHeight: 80 }}
              />
              {validationError && (
                <p style={{ color: "var(--error)", fontSize: 12, marginTop: 6 }}>
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
                  {status === "decoding" ? "디코딩 중…" : "Decode"}
                </button>
              </div>
            </div>
          </div>

          {/* 결과: 디코딩 + Raw 나란히 */}
          {status === "done" && submittedData && (
            <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
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
    </div>
  );
}
