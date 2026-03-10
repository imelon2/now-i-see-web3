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
            placeholder="Transaction hash (0x...)"
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
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
        {validationError && (
          <p style={{ color: "var(--error)", fontSize: 14, marginTop: 6 }}>
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
}
