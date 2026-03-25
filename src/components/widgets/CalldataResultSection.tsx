"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { DecodedCalldataView } from "./DecodedCalldataView";
import { RawCalldataView } from "./RawCalldataView";
import type { DecodedCalldata } from "@/types";

interface Props {
  calldata: string;
  /** All decoded ABI variants for this calldata. Empty array = ABI not found. */
  decodedList: DecodedCalldata[];
}

export function CalldataResultSection({ calldata, decodedList }: Props) {
  const [rawOpen, setRawOpen] = useState(false);
  const [abiIndex, setAbiIndex] = useState(0);

  const decoded = decodedList.length > 0 ? decodedList[abiIndex] ?? null : null;

  if (!decoded) {
    return <RawCalldataView calldata={calldata} abiNotFound />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <DecodedCalldataView
        calldata={calldata}
        decoded={decoded}
        abiIndex={abiIndex}
        abiTotal={decodedList.length}
        onPrev={() => setAbiIndex((i) => Math.max(0, i - 1))}
        onNext={() => setAbiIndex((i) => Math.min(decodedList.length - 1, i + 1))}
      />

      {/* Raw Calldata toggle */}
      <div className="panel">
        <div
          style={{
            background: "var(--panel-header)",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setRawOpen((v) => !v)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--muted)",
              fontSize: 13,
              fontWeight: 600,

              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 12 }}>{rawOpen ? "▼" : "▶"}</span>
            Raw Calldata
          </button>
          <CopyButton text={calldata} />
        </div>
        {rawOpen && (
          <div className="panel-body">
            <RawCalldataView calldata={calldata} embedded />
          </div>
        )}
      </div>
    </div>
  );
}
