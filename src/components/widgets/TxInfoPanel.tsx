import { HexDisplay } from "@/components/ui/HexDisplay";
import { formatEtherValue, formatNumber } from "@/lib/utils/format";
import type { TxInfo } from "@/types";

interface Props {
  txInfo: TxInfo;
}

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  success: { color: "var(--success)", label: "✓ Success" },
  reverted: { color: "var(--error)", label: "✗ Reverted" },
  pending: { color: "var(--warning)", label: "⏳ Pending" },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 8,
        padding: "6px 0",
        borderBottom: "1px solid var(--border)",
        alignItems: "center",
      }}
    >
      <span style={{ color: "var(--muted)", fontSize: 12 }}>{label}</span>
      <span style={{ wordBreak: "break-all" }}>{children}</span>
    </div>
  );
}

export function TxInfoPanel({ txInfo }: Props) {
  const statusStyle = STATUS_STYLE[txInfo.status ?? "pending"];

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Transaction Info</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              background: "var(--accent)",
              color: "#000",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {txInfo.chainName}
          </span>
          <span
            style={{
              color: statusStyle.color,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {statusStyle.label}
          </span>
        </div>
      </div>
      <div className="panel-body">
        <Row label="Hash">
          <HexDisplay hex={txInfo.hash} head={20} tail={12} />
        </Row>
        <Row label="From">
          <HexDisplay hex={txInfo.from} head={20} tail={8} />
        </Row>
        <Row label="To">
          {txInfo.to ? (
            <HexDisplay hex={txInfo.to} head={20} tail={8} />
          ) : (
            <span style={{ color: "var(--warning)" }}>Contract Creation</span>
          )}
        </Row>
        <Row label="Value">
          <code style={{ color: "var(--foreground)" }}>
            {formatEtherValue(txInfo.value)}
          </code>
        </Row>
        <Row label="Block">
          <code style={{ color: "var(--foreground)" }}>
            {txInfo.blockNumber !== null
              ? formatNumber(txInfo.blockNumber)
              : "—"}
          </code>
        </Row>
        <Row label="Nonce">
          <code style={{ color: "var(--foreground)" }}>{txInfo.nonce}</code>
        </Row>
      </div>
    </div>
  );
}
