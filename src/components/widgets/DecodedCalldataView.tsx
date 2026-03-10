import { CopyButton } from "@/components/ui/CopyButton";
import { HexDisplay } from "@/components/ui/HexDisplay";
import { extractSelector } from "@/lib/utils/hex";
import type { DecodedCalldata } from "@/types";

interface Props {
  calldata: string;
  decoded: DecodedCalldata | null;
}

/** JSON syntax highlight */
function JsonHighlight({ json }: { json: string }) {
  const highlighted = json.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          // key
          return `<span style="color:var(--muted)">${match}</span>`;
        }
        // string value
        return `<span style="color:var(--accent)">${match}</span>`;
      }
      if (match === "true" || match === "false") {
        return `<span style="color:var(--success)">${match}</span>`;
      }
      if (match === "null") {
        return `<span style="color:var(--muted)">${match}</span>`;
      }
      // number
      return `<span style="color:var(--warning)">${match}</span>`;
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

export function DecodedCalldataView({ calldata, decoded }: Props) {
  const selector = extractSelector(calldata);

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
        <CopyButton text={jsonStr} />
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
          <code style={{ color: "var(--accent)", fontSize: 15 }}>
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
