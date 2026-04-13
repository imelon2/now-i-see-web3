"use client";

import { CopyButton } from "./CopyButton";
import type { SelectorMatch } from "@/lib/utils/selectorSearch";

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted)",
  marginBottom: 6,
  fontWeight: 400,
};

const badgeStyle = (mutability: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 400,
  border: "1px solid var(--border)",
  color:
    mutability === "view" || mutability === "pure"
      ? "var(--muted)"
      : "var(--foreground)",
});

export function SelectorResultCard({
  match,
  index,
}: {
  match: SelectorMatch;
  index: number;
}) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span style={{ fontFamily: "var(--font-mono)" }}>
          {index + 1}. {match.functionName}
        </span>
        <CopyButton text={match.signature} size="sm" />
      </div>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Signature */}
        <div>
          <div style={labelStyle}>Signature</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <code
              style={{
                fontSize: 14,
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {match.signature}
            </code>
          </div>
        </div>

        {/* Inputs */}
        <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div style={labelStyle}>Inputs</div>
          {match.inputs.length === 0 ? (
            <span style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>No inputs</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {match.inputs.map((input, i) => (
                <code key={i} style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>
                  <span style={{ color: "var(--muted)" }}>{input.type}</span>
                  {input.name && (
                    <span style={{ color: "var(--foreground)", marginLeft: 6 }}>{input.name}</span>
                  )}
                </code>
              ))}
            </div>
          )}
        </div>

        {/* Outputs */}
        <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div style={labelStyle}>Outputs</div>
          {match.outputs.length === 0 ? (
            <span style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>No outputs</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {match.outputs.map((output, i) => (
                <code key={i} style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>
                  <span style={{ color: "var(--muted)" }}>{output.type}</span>
                  {output.name && (
                    <span style={{ color: "var(--foreground)", marginLeft: 6 }}>{output.name}</span>
                  )}
                </code>
              ))}
            </div>
          )}
        </div>

        {/* State Mutability */}
        <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div style={labelStyle}>State Mutability</div>
          <span style={badgeStyle(match.stateMutability)}>
            {match.stateMutability}
          </span>
        </div>
      </div>
    </div>
  );
}
