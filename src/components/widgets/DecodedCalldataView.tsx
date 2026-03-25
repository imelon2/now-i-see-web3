import { CopyButton } from "@/components/ui/CopyButton";
import { HexDisplay } from "@/components/ui/HexDisplay";
import { extractSelector } from "@/lib/utils/hex";
import type { DecodedCalldata } from "@/types";

interface Props {
  calldata: string;
  decoded: DecodedCalldata | null;
  abiIndex?: number;
  abiTotal?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

/** Escape HTML special characters to prevent XSS */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** JSON syntax highlight */
function JsonHighlight({ json }: { json: string }) {
  const highlighted = json.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      const safe = escapeHtml(match);
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          // key
          return `<span style="color:var(--muted)">${safe}</span>`;
        }
        // string value
        return `<span style="color:var(--foreground)">${safe}</span>`;
      }
      if (match === "true" || match === "false") {
        return `<span style="color:var(--foreground)">${safe}</span>`;
      }
      if (match === "null") {
        return `<span style="color:var(--muted)">${safe}</span>`;
      }
      // number
      return `<span style="color:var(--foreground)">${safe}</span>`;
    }
  );

  return (
    <pre
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: highlighted }}
      style={{
        margin: 0,
        fontSize: 14,
        lineHeight: 1.7,
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        fontFamily: "var(--font-mono)",
      }}
    />
  );
}

export function DecodedCalldataView({ calldata, decoded, abiIndex, abiTotal, onPrev, onNext }: Props) {
  const selector = extractSelector(calldata);
  const showNav = abiTotal !== undefined && abiTotal > 1;

  if (!decoded) {
    return (
      <div className="panel" style={{ flex: 1 }}>
        <div className="panel-header">
          <span>Decoded Calldata</span>
        </div>
        <div className="panel-body">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              padding: "8px 12px",
              background: "rgba(248,81,73,0.08)",
              border: "1px solid rgba(248,81,73,0.3)",
              borderRadius: 4,
            }}
          >
            <span style={{ color: "var(--error)", fontSize: 14 }}>
              ✗ ABI not found.
            </span>
          </div>
          {selector && (
            <div style={{ color: "var(--muted)", fontSize: 14 }}>
              <span>Function Selector: </span>
              <HexDisplay hex={selector} head={10} tail={0} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const paramsJson = Object.fromEntries(
    decoded.params.map((p) => [p.name, p.value])
  );
  const jsonStr = JSON.stringify(paramsJson, null, 2);

  return (
    <div className="panel" style={{ flex: 1 }}>
      <div className="panel-header">
        <span>Decoded Calldata</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {showNav && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={onPrev}
                disabled={abiIndex === 0}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: abiIndex === 0 ? "var(--muted)" : "var(--foreground)",
                  borderRadius: 3,
                  padding: "1px 7px",
                  fontSize: 13,
                  cursor: abiIndex === 0 ? "default" : "pointer",
                  lineHeight: 1.6,
                }}
              >
                {"<"}
              </button>
              <span style={{ color: "var(--muted)", fontSize: 13, minWidth: 40, textAlign: "center" }}>
                {(abiIndex ?? 0) + 1}/{abiTotal}
              </span>
              <button
                onClick={onNext}
                disabled={abiIndex === (abiTotal ?? 1) - 1}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: abiIndex === (abiTotal ?? 1) - 1 ? "var(--muted)" : "var(--foreground)",
                  borderRadius: 3,
                  padding: "1px 7px",
                  fontSize: 13,
                  cursor: abiIndex === (abiTotal ?? 1) - 1 ? "default" : "pointer",
                  lineHeight: 1.6,
                }}
              >
                {">"}
              </button>
            </div>
          )}
          <CopyButton text={jsonStr} />
        </div>
      </div>
      <div className="panel-body">
        {/* Function signature */}
        <div
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "8px 12px",
            marginBottom: 12,
          }}
        >
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Function </span>
          <code style={{ fontSize: 15, wordBreak: "break-all", overflowWrap: "break-word" }}>
            {decoded.signature}
          </code>
        </div>

        {/* JSON output */}
        {decoded.params.length > 0 ? (
          <div
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "10px 12px",
            }}
          >
            <JsonHighlight json={jsonStr} />
          </div>
        ) : (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No parameters</p>
        )}
      </div>
    </div>
  );
}
