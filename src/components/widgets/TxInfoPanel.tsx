import { HexDisplay } from "@/components/ui/HexDisplay";
import {
  formatEtherValue,
  formatGasPrice,
  formatNumber,
  formatTimestamp,
} from "@/lib/utils/format";
import type { TxInfo } from "@/types";

interface Props {
  txInfo: TxInfo;
}

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  success: { color: "var(--success)", label: "✓ Success" },
  reverted: { color: "var(--error)", label: "✗ Reverted" },
  pending: { color: "var(--warning)", label: "⏳ Pending" },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ wordBreak: "break-all" }}>{children}</div>
    </div>
  );
}

export function TxInfoPanel({ txInfo }: Props) {
  const statusStyle = STATUS_STYLE[txInfo.status ?? "pending"];
  const networkLabel = txInfo.chainId
    ? `${txInfo.chainName} (${txInfo.chainId})`
    : txInfo.chainName;

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Transaction Info</span>
      </div>
      <div className="panel-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 32px",
          }}
        >
          <Field label="Transaction Hash">
            <HexDisplay hex={txInfo.hash} head={18} tail={10} />
          </Field>
          <Field label="Network">
            <span style={{ color: "var(--accent)"}}>
              {networkLabel}
            </span>
          </Field>
          <Field label="Block Hash">
            {txInfo.blockHash ? (
              <HexDisplay hex={txInfo.blockHash} head={18} tail={10} />
            ) : (
              <span style={{ color: "var(--muted)" }}>—</span>
            )}
          </Field>
          <Field label="Status">
            <span style={{ color: statusStyle.color}}>
              {statusStyle.label}
            </span>


          </Field>
          <Field label="Timestamp">
            <code style={{ color: "var(--foreground)" }}>
              {txInfo.timestamp !== null ? formatTimestamp(txInfo.timestamp) : "—"}
            </code>
          </Field>
          <Field label="Block Number">
            <code style={{ color: "var(--foreground)" }}>
              {txInfo.blockNumber !== null ? formatNumber(txInfo.blockNumber) : "—"}
            </code>
          </Field>
          <Field label="From">
            <HexDisplay hex={txInfo.from} head={18} tail={8} />
          </Field>

          <Field label="To">
            {txInfo.to ? (
              <HexDisplay hex={txInfo.to} head={18} tail={8} />
            ) : (
              <span style={{ color: "var(--warning)" }}>Contract Creation</span>
            )}
          </Field>
          <Field label="Value">
            <code style={{ color: "var(--foreground)" }}>
              {formatEtherValue(txInfo.value)}
            </code>
          </Field>

          <Field label="Gas Price">
            <code style={{ color: "var(--foreground)" }}>
              {txInfo.gasPrice !== null ? formatGasPrice(txInfo.gasPrice) : "—"}
            </code>
          </Field>
          <Field label="Gas Used">
            <code style={{ color: "var(--foreground)" }}>
              {txInfo.gasUsed !== null ? formatNumber(txInfo.gasUsed) : "—"}
            </code>
          </Field>

          <Field label="Nonce">
            <code style={{ color: "var(--foreground)" }}>{txInfo.nonce}</code>
          </Field>
        </div>
      </div>
    </div>
  );
}
