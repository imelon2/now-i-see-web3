import { CopyButton } from "@/components/ui/CopyButton";
import { HexDisplay } from "@/components/ui/HexDisplay";
import { formatParamValue } from "@/lib/utils/format";
import { extractSelector } from "@/lib/utils/hex";
import type { DecodedCalldata } from "@/types";

interface Props {
  calldata: string;
  decoded: DecodedCalldata | null;
}

export function DecodedCalldataView({ calldata, decoded }: Props) {
  const selector = extractSelector(calldata);

  return (
    <div className="panel" style={{ flex: 1 }}>
      <div className="panel-header">
        <span>Decoded Calldata</span>
        {decoded && <CopyButton text={JSON.stringify(decoded, null, 2)} />}
      </div>
      <div className="panel-body">
        {decoded ? (
          <>
            {/* 함수 시그니처 */}
            <div
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "8px 12px",
                marginBottom: 12,
              }}
            >
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>
                Function
              </div>
              <code style={{ color: "var(--accent)", fontSize: 13 }}>
                {decoded.signature}
              </code>
            </div>

            {/* 파라미터 테이블 */}
            {decoded.params.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ color: "var(--muted)", fontSize: 11 }}>
                    <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)", width: "25%" }}>Name</th>
                    <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)", width: "20%" }}>Type</th>
                    <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {decoded.params.map((param, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "6px 8px", color: "var(--foreground)" }}>
                        {param.name}
                      </td>
                      <td style={{ padding: "6px 8px" }}>
                        <code style={{ color: "var(--warning)", fontSize: 12 }}>
                          {param.type}
                        </code>
                      </td>
                      <td style={{ padding: "6px 8px", wordBreak: "break-all" }}>
                        <code style={{ color: "var(--foreground)", fontSize: 12 }}>
                          {formatParamValue(param.value)}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: 12 }}>
                파라미터 없음
              </p>
            )}
          </>
        ) : (
          /* ABI 없음 */
          <div>
            <p
              style={{
                color: "var(--warning)",
                fontSize: 12,
                marginBottom: 8,
              }}
            >
              ABI를 찾을 수 없습니다
            </p>
            {selector && (
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                <span>Function Selector: </span>
                <HexDisplay hex={selector} head={10} tail={0} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
