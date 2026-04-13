"use client";

import { useRouter } from "next/navigation";
import { formatEther, type Chain } from "viem";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { OpStackBadge } from "@/components/ui/OpStackBadge";
import { ProcessPhaseMarker } from "@/components/ui/ProcessPhaseMarker";
import type { DepositStatus } from "@/hooks/useDepositStatus";

export interface DepositProcessPanelProps {
  status: DepositStatus;
  l2Hash: `0x${string}` | null;
  error: string | null;
  l1Chain: Chain | null;
  l2Chain: Chain | null;
  portalAddress: `0x${string}` | null;
  mint: bigint | null;
  relayDurationSeconds: number | null;
  /** Async callback to look up the L1 deposit tx. Returns the L1 tx hash on success. */
  onLookupL1Tx?: () => Promise<`0x${string}` | null>;
}

// Shared href for Received phase marker navigation
function useReceivedHref(
  status: DepositStatus,
  l2Hash: `0x${string}` | null,
): string | undefined {
  if (status === "received" && l2Hash) {
    return `/tx-analyzer?hash=${l2Hash}`;
  }
  return undefined;
}


/**
 * Two-phase progress display for an L1→L2 OP Stack deposit.
 *
 * Phase 0 (Deposited) is always "done" once this panel is rendered — the
 * L1 receipt is already in hand. Phase 1 (Received) is driven by the
 * `wait-receive` / `received` states from `useDepositStatus`.
 */
export function DepositProcessPanel({
  status,
  l2Hash,
  error,
  l1Chain,
  l2Chain,
  portalAddress,
  mint,
  relayDurationSeconds,
  onLookupL1Tx,
}: DepositProcessPanelProps) {
  // Before the first probe resolves, mirror WithdrawalProcessPanel's loading
  // skeleton — the hook keeps status === "deposited" until it knows whether
  // the L2 receipt is already there or not.
  if (status === "deposited" && !error) {
    return (
      <div className="panel">
        <div className="panel-header" style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8 }}>
          <OpStackBadge />
          <span>Deposit</span>
          <span>|</span>
          <span>{onLookupL1Tx ? "Received" : "Deposit"} Transaction</span>
        </div>
        <div
          className="panel-body"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 0",
            gap: 8,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="1.6"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <circle cx="8" cy="8" r="6" strokeDasharray="28" strokeDashoffset="8" />
          </svg>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>
            Loading deposit status…
          </span>
        </div>
      </div>
    );
  }

  const isReceived = status === "received";
  // NOTE: drive waiting state from `status` only. Folding `loading` in here
  // would flash warning color on already-relayed deposits because the hook
  // sets loading=true synchronously before the first probe resolves.
  const isWaiting = status === "wait-receive";

  const phase0 = { done: true, active: false, color: "var(--success)" };
  const phase1 = isReceived
    ? { done: true, active: false, color: "var(--success)" }
    : isWaiting
      ? { done: false, active: true, color: "var(--warning)" }
      : { done: false, active: false, color: "var(--muted)" };

  const connectorFilled = isReceived || isWaiting;
  const connectorColor = isReceived
    ? "var(--success)"
    : isWaiting
      ? "var(--warning)"
      : "var(--border)";

  const statusLabel = isReceived
    ? "Received"
    : isWaiting
      ? "Waiting for L2 relay"
      : "Checking…";
  const statusColor = isReceived
    ? "var(--success)"
    : isWaiting
      ? "var(--warning)"
      : "var(--muted)";

  const router = useRouter();

  // When viewing from the received side (onLookupL1Tx present), only show
  // "→ View Transaction" on Deposited (via async lookup), not on Received.
  const receivedHref = onLookupL1Tx ? undefined : useReceivedHref(status, l2Hash);

  // Async handler: lookup L1 tx → navigate on success
  const handleDepositedClick = onLookupL1Tx
    ? async () => {
        const hash = await onLookupL1Tx();
        if (hash) router.push(`/tx-analyzer?hash=${hash}`);
      }
    : undefined;

  const descText = isReceived
    ? "The deposit has been relayed and executed on L2."
    : "Polling the L2 chain for the relayed transaction…";
  const hintText = isReceived
    ? null
    : "Waiting for the L2 to include the relayed deposit transaction. This normally takes ~1–3 minutes.";

  return (
    <div className="panel">
      <div
        className="panel-header"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <OpStackBadge />
          <span>Deposit</span>
          <span>|</span>
          <span>{onLookupL1Tx ? "Received" : "Deposit"} Transaction</span>
        </div>
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            padding: "2px 8px",
            border: `1px solid ${statusColor}`,
            color: statusColor,
            background: `color-mix(in srgb, ${statusColor} 8%, transparent)`,
          }}
        >
          {statusLabel}
        </span>
      </div>
      <div className="panel-body" style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 30, justifyContent: "center", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          {/* Phase 0 — Deposited (L1) */}
          <ProcessPhaseMarker
            label="Deposited"
            subLabel={l1Chain ? `${l1Chain.name} (${l1Chain.id})` : undefined}
            state={phase0}
            icon={<DepositIcon color={phase0.color} />}
            onClickNavigate={onLookupL1Tx ? handleDepositedClick : undefined}
          />
          {/* Connector */}
          <div
            style={{
              flex: 1,
              minWidth: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              alignSelf: "flex-start",
              marginTop: 15,
              marginLeft: 8,
              marginRight: 8,
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                color: "var(--muted)",
                fontWeight: 500,
                marginBottom: -2,
                letterSpacing: "0.02em",
                visibility: relayDurationSeconds !== null ? "visible" : "hidden",
              }}
            >
              {relayDurationSeconds !== null
                ? relayDurationSeconds >= 60
                  ? `${Math.floor(relayDurationSeconds / 60)}m ${relayDurationSeconds % 60}s`
                  : `${relayDurationSeconds}s`
                : "\u00A0"}
            </span>
            <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 0 }}>
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: "var(--border)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: connectorFilled ? "100%" : "0%",
                    background: connectorColor,
                    transition: "width 0.5s ease, background 0.3s ease",
                  }}
                />
              </div>
              <svg width="8" height="10" viewBox="0 0 8 10" fill={connectorFilled ? connectorColor : "var(--border)"} style={{ flexShrink: 0, marginLeft: -1, transition: "fill 0.3s ease" }}>
                <path d="M0 0 L8 5 L0 10 Z" />
              </svg>
            </div>
            {mint !== null && (
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--foreground)",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
                title={`${mint.toString()} wei`}
              >
                {formatEther(mint)}{" "}
                {l1Chain?.nativeCurrency?.symbol ?? "ETH"}
              </span>
            )}
          </div>
          {/* Phase 1 — Received (L2) */}
          <ProcessPhaseMarker
            label="Received"
            subLabel={l2Chain ? `${l2Chain.name} (${l2Chain.id})` : undefined}
            state={phase1}
            icon={<ReceiveIcon color={phase1.color} />}
            href={receivedHref}
          />
        </div>



        <div
          style={{
            padding: "10px 12px",
            background: `color-mix(in srgb, ${statusColor} 5%, transparent)`,
            border: `1px solid color-mix(in srgb, ${statusColor} 20%, transparent)`,
            fontSize: 13,
            color: "var(--foreground)",
            lineHeight: 1.6,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {isWaiting && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke={statusColor}
              strokeWidth="1.6"
              style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
            >
              <circle cx="8" cy="8" r="6" strokeDasharray="28" strokeDashoffset="8" />
            </svg>
          )}
          <span>{descText}</span>
        </div>

        {hintText && (
          <div
            style={{
              marginTop: 6,
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              fontSize: 12,
              color: "var(--muted)",
              lineHeight: 1.5,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 2 }}
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="6" />
              <line x1="8" y1="5" x2="8" y2="8.5" />
              <circle cx="8" cy="11" r="0.5" fill="var(--muted)" />
            </svg>
            <span>{hintText}</span>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 10 }}>
            <ErrorDisplay kind="rpc" message={error} />
          </div>
        )}
      </div>
    </div>
  );
}



function DepositIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="3" x2="8" y2="11" />
      <polyline points="4.5 7.5 8 11 11.5 7.5" />
      <line x1="3" y1="13.5" x2="13" y2="13.5" />
    </svg>
  );
}

function ReceiveIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="10" height="10" rx="1" />
      <polyline points="5.5 8 7.5 10 11 6" />
    </svg>
  );
}
