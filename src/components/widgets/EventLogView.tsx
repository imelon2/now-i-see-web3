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
    <div style={{ fontSize: 14 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: "var(--muted)" }}>Address: </span>
        <HexDisplay hex={log.address ?? ""} head={20} tail={8} />
      </div>
      {log.topics.map((topic, i) => (
        <div key={i} style={{ marginBottom: 4 }}>
          <span style={{ color: "var(--muted)" }}>topic[{i}]: </span>
          <code style={{ wordBreak: "break-all" }}>
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
    <div style={{ fontSize: 14 }}>
      {/* Event signature */}
      <div
        style={{
          background: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          padding: "6px 10px",
          marginBottom: 10,
        }}
      >
        <span style={{ color: "var(--muted)", fontSize: 13 }}>Event: </span>
        <code>{event.signature}</code>
      </div>

      <div style={{ marginBottom: 8 }}>
        <span style={{ color: "var(--muted)" }}>Address: </span>
        <HexDisplay hex={event.address} head={20} tail={8} />
      </div>

      {/* Parameter table */}
      {event.params.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "var(--muted)", fontSize: 13 }}>
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
                  <code>{param.type}</code>
                </td>
                <td style={{ padding: "5px 8px", color: param.indexed ? "var(--foreground)" : "var(--muted)" }}>
                  {param.indexed ? "✓" : "—"}
                </td>
                <td style={{ padding: "5px 8px", wordBreak: "break-all" }}>
                  <code style={{ fontSize: 14 }}>{formatParamValue(param.value)}</code>
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
        <span style={{ color: "var(--muted)", fontSize: 14 }}>
          {rawLogs.length}
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
              {/* Log header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={{ color: "var(--muted)", fontSize: 13 }}>
                  Log #{i} {log.logIndex !== null ? `(index: ${log.logIndex})` : ""}
                </span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {decoded ? (
                    <span style={{ color: "var(--success)", fontSize: 13 }}>
                      ✓ Decoded
                    </span>
                  ) : (
                    <span style={{ color: "var(--warning)", fontSize: 13 }}>
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

              {/* Content */}
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
