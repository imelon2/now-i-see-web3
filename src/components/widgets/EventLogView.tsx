import { CopyButton } from "@/components/ui/CopyButton";
import { HexDisplay } from "@/components/ui/HexDisplay";
import { formatParamValue } from "@/lib/utils/format";
import type { DecodedEvent } from "@/types";
import type { Log } from "viem";

interface Props {
  rawLogs: Log[];
  decodedEvents: (DecodedEvent | null)[];
}

function RawLogView({ log }: { log: Log }) {
  return (
    <div style={{ fontSize: 12 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: "var(--muted)" }}>Address: </span>
        <HexDisplay hex={log.address ?? ""} head={20} tail={8} />
      </div>
      {log.topics.map((topic, i) => (
        <div key={i} style={{ marginBottom: 4 }}>
          <span style={{ color: "var(--muted)" }}>topic[{i}]: </span>
          <code style={{ color: "var(--accent)", wordBreak: "break-all" }}>
            {topic}
          </code>
        </div>
      ))}
      <div>
        <span style={{ color: "var(--muted)" }}>data: </span>
        <HexDisplay hex={log.data as string} head={20} tail={10} />
      </div>
    </div>
  );
}

function DecodedLogView({ event }: { event: DecodedEvent }) {
  return (
    <div style={{ fontSize: 12 }}>
      {/* 이벤트 시그니처 */}
      <div
        style={{
          background: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          padding: "6px 10px",
          marginBottom: 10,
        }}
      >
        <span style={{ color: "var(--muted)", fontSize: 11 }}>Event: </span>
        <code style={{ color: "var(--accent)" }}>{event.signature}</code>
      </div>

      <div style={{ marginBottom: 8 }}>
        <span style={{ color: "var(--muted)" }}>Address: </span>
        <HexDisplay hex={event.address} head={20} tail={8} />
      </div>

      {/* 파라미터 테이블 */}
      {event.params.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "var(--muted)", fontSize: 11 }}>
              <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)", width: "20%" }}>Name</th>
              <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)", width: "18%" }}>Type</th>
              <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)", width: "12%" }}>Indexed</th>
              <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {event.params.map((param, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "5px 8px" }}>{param.name}</td>
                <td style={{ padding: "5px 8px" }}>
                  <code style={{ color: "var(--warning)" }}>{param.type}</code>
                </td>
                <td style={{ padding: "5px 8px", color: param.indexed ? "var(--accent)" : "var(--muted)" }}>
                  {param.indexed ? "✓" : "—"}
                </td>
                <td style={{ padding: "5px 8px", wordBreak: "break-all" }}>
                  <code style={{ fontSize: 12 }}>{formatParamValue(param.value)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function EventLogView({ rawLogs, decodedEvents }: Props) {
  if (rawLogs.length === 0) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Event Logs</span>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>
          {rawLogs.length}개
        </span>
      </div>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rawLogs.map((log, i) => {
          const decoded = decodedEvents[i];
          return (
            <div
              key={i}
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: 12,
              }}
            >
              {/* 로그 헤더 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={{ color: "var(--muted)", fontSize: 11 }}>
                  Log #{i} {log.logIndex !== null ? `(index: ${log.logIndex})` : ""}
                </span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {decoded ? (
                    <span style={{ color: "var(--success)", fontSize: 11 }}>
                      ✓ Decoded
                    </span>
                  ) : (
                    <span style={{ color: "var(--warning)", fontSize: 11 }}>
                      Raw
                    </span>
                  )}
                  <CopyButton
                    text={
                      decoded
                        ? JSON.stringify(decoded, null, 2)
                        : JSON.stringify(log, (_, v) =>
                            typeof v === "bigint" ? v.toString() : v
                          )
                    }
                  />
                </div>
              </div>

              {/* 내용 */}
              {decoded ? (
                <DecodedLogView event={decoded} />
              ) : (
                <RawLogView log={log} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
