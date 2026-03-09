"use client";

import { useState } from "react";
import { isValidHex } from "@/lib/utils/hex";

interface Props {
  onSearch: (hash: string) => void;
  loading: boolean;
}

export function TransactionSearch({ onSearch, loading }: Props) {
  const [hash, setHash] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSearch = () => {
    const trimmed = hash.trim();
    if (!trimmed) {
      setValidationError("트랜잭션 해시를 입력하세요.");
      return;
    }
    if (!isValidHex(trimmed) || trimmed.length !== 66) {
      setValidationError(
        "유효하지 않은 해시입니다. 0x로 시작하는 66자리 hex를 입력하세요."
      );
      return;
    }
    setValidationError("");
    onSearch(trimmed);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Transaction Search</span>
      </div>
      <div className="panel-body">
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="트랜잭션 해시를 입력하세요 (0x...)"
            value={hash}
            onChange={(e) => {
              setHash(e.target.value);
              setValidationError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSearch()}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              background: "var(--accent)",
              color: "#000",
              border: "none",
              whiteSpace: "nowrap",
              fontWeight: 600,
              minWidth: 80,
            }}
          >
            {loading ? "검색 중…" : "검색"}
          </button>
        </div>
        {validationError && (
          <p style={{ color: "var(--error)", fontSize: 12, marginTop: 6 }}>
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
}
