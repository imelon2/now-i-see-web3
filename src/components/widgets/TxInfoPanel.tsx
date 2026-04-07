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

const TX_TYPE_LABEL: Record<string, { num: number; label: string }> = {
  legacy: { num: 0, label: "Legacy" },
  eip2930: { num: 1, label: "EIP-2930" },
  eip1559: { num: 2, label: "EIP-1559" },
  eip4844: { num: 3, label: "EIP-4844" },
  eip7702: { num: 4, label: "EIP-7702" },
  deposit: { num: 126, label: "Deposit" },
};

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
      <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4, fontWeight: 400 }}>
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
        <div className="tx-info-grid">
          <Field label="Transaction Hash">
            <HexDisplay hex={txInfo.hash} head={200} tail={0} />
          </Field>
          <Field label="Network">
            <span>{networkLabel}</span>
          </Field>
          <Field label="Block Hash">
            {txInfo.blockHash ? (
              <HexDisplay hex={txInfo.blockHash} head={200} tail={0} />
            ) : (
              <span style={{ color: "var(--muted)" }}>—</span>
            )}
          </Field>
          <Field label="Status">
            <span style={{ color: statusStyle.color }}>
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
            <HexDisplay hex={txInfo.from} head={200} tail={0} />
          </Field>

          <Field label="To">
            {txInfo.to ? (
              <HexDisplay hex={txInfo.to} head={200} tail={0} />
            ) : (
              <span>Contract Creation</span>
            )}
          </Field>
          <Field label="Value">
            <code style={{ color: "var(--foreground)" }}>
              {formatEtherValue(txInfo.value, txInfo.nativeCurrencySymbol)}
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
          <Field label="Type">
            <code style={{ color: "var(--foreground)" }}>
              {TX_TYPE_LABEL[txInfo.type]
                ? `${TX_TYPE_LABEL[txInfo.type].num}(${TX_TYPE_LABEL[txInfo.type].label})`
                : txInfo.type}
            </code>
          </Field>
        </div>
      </div>
    </div>
  );
}
