"use client";

import { CopyButton } from "./CopyButton";
import type { SelectorMatch } from "@/lib/utils/selectorSearch";

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "var(--muted)",
  marginBottom: 4,
};

const codeStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  color: "var(--foreground)",
  wordBreak: "break-all",
};

const badgeStyle = (mutability: string): React.CSSProperties => ({
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 500,
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
    <div className="panel" style={{ marginBottom: 12 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <code style={codeStyle}>{match.signature}</code>
          </div>
        </div>

        {/* Inputs */}
        <div>
          <div style={labelStyle}>Inputs</div>
          {match.inputs.length === 0 ? (
            <span style={{ fontSize: 13, color: "var(--muted)" }}>No inputs</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {match.inputs.map((input, i) => (
                <div key={i} style={codeStyle}>
                  <span style={{ color: "var(--muted)" }}>{input.type}</span>
                  {input.name && (
                    <span style={{ marginLeft: 6 }}>{input.name}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outputs */}
        <div>
          <div style={labelStyle}>Outputs</div>
          {match.outputs.length === 0 ? (
            <span style={{ fontSize: 13, color: "var(--muted)" }}>No outputs</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {match.outputs.map((output, i) => (
                <div key={i} style={codeStyle}>
                  <span style={{ color: "var(--muted)" }}>{output.type}</span>
                  {output.name && (
                    <span style={{ marginLeft: 6 }}>{output.name}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* State Mutability */}
        <div>
          <div style={labelStyle}>State Mutability</div>
          <span style={badgeStyle(match.stateMutability)}>
            {match.stateMutability}
          </span>
        </div>
      </div>
    </div>
  );
}
