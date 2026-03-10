"use client";

import { useState } from "react";
import { NavBar } from "@/components/ui/NavBar";
import { DecodedCalldataView } from "@/components/widgets/DecodedCalldataView";
import { RawCalldataView } from "@/components/widgets/RawCalldataView";
import { decodeCalldata } from "@/lib/utils/decoder";
import { isValidHex } from "@/lib/utils/hex";
import type { DecodedCalldata } from "@/types";

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
      setValidationError("calldata를 입력하세요.");
      return;
    }
    if (!isValidHex(trimmed)) {
      setValidationError("유효하지 않은 hex 문자열입니다. 0x로 시작해야 합니다.");
      return;
    }
    if (trimmed.length < 10) {
      setValidationError(
        "calldata가 너무 짧습니다. function selector(4바이트) 이상 입력하세요."
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
              <span>Calldata Decoder</span>
            </div>
            <div className="panel-body">
              <textarea
                placeholder="0x로 시작하는 calldata hex를 입력하세요 (예: 0xa9059cbb000...)"
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
                    background: "var(--accent)",
                    color: "#000",
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
          {status === "done" && submittedCalldata && (
            <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
              <DecodedCalldataView
                calldata={submittedCalldata}
                decoded={decoded}
              />
              <RawCalldataView calldata={submittedCalldata} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
