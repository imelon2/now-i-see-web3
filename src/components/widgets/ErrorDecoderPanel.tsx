import { CopyButton } from "@/components/ui/CopyButton";
import { HexDisplay } from "@/components/ui/HexDisplay";
import { formatParamValue } from "@/lib/utils/format";
import { extractSelector } from "@/lib/utils/hex";
import type { DecodedError } from "@/types";

interface Props {
  errorData: string;
  decoded: DecodedError | null;
  /** Reason for decode failure when decoded is null */
  failureReason?: "no-abi" | "decode-failed";
  abiIndex?: number;
  abiTotal?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

export function ErrorDecoderPanel({ errorData, decoded, failureReason, abiIndex, abiTotal, onPrev, onNext }: Props) {
  const selector = extractSelector(errorData);
  const showNav = abiTotal !== undefined && abiTotal > 1;

  const failureMessage =
    failureReason === "decode-failed"
      ? "ABI found but decoding failed."
      : "ABI not found.";

  return (
    <div className="panel" style={{ flex: 1 }}>
      <div className="panel-header">
        <span>Decoded Error</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {decoded && showNav && (
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
          {decoded && <CopyButton text={JSON.stringify(decoded, null, 2)} />}
        </div>
      </div>
      <div className="panel-body">
        {decoded ? (
          <>
            {/* Error signature */}
            <div
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "8px 12px",
                marginBottom: 12,
              }}
            >
              <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 4 }}>
                Error
              </div>
              <code style={{ fontSize: 15, wordBreak: "break-all", overflowWrap: "break-word" }}>
                {decoded.signature}
              </code>
            </div>

            {/* Parameter table */}
            {decoded.params.length > 0 ? (
              <div className="table-scroll">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 300 }}>
                <thead>
                  <tr style={{ color: "var(--muted)", fontSize: 13 }}>
                    <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)", width: "25%" }}>Name</th>
                    <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)", width: "20%" }}>Type</th>
                    <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {decoded.params.map((param, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "6px 8px" }}>{param.name}</td>
                      <td style={{ padding: "6px 8px" }}>
                        <code style={{ fontSize: 14 }}>
                          {param.type}
                        </code>
                      </td>
                      <td style={{ padding: "6px 8px", wordBreak: "break-all" }}>
                        <code style={{ fontSize: 14 }}>
                          {formatParamValue(param.value)}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>No parameters</p>
            )}

            {/* Raw Error Data */}
            {errorData && errorData.length > 10 && (
              <div
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  padding: "8px 12px",
                  marginTop: 12,
                  wordBreak: "break-all",
                  overflowWrap: "break-word",
                }}
              >
                <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>
                  Raw Error Data
                </div>
                <code style={{ fontSize: 13 }}>{errorData}</code>
              </div>
            )}
          </>
        ) : (
          /* Decode failed */
          <div>
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
                ✗ {failureMessage}
              </span>
            </div>
            {selector && (
              <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>
                <span>Error Selector: </span>
                <HexDisplay hex={selector} head={10} tail={0} />
              </div>
            )}
            {errorData && errorData.length > 10 && (
              <div
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  padding: "8px 12px",
                  wordBreak: "break-all",
                  overflowWrap: "break-word",
                }}
              >
                <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>
                  Raw Error Data
                </div>
                <code style={{ fontSize: 13 }}>{errorData}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
