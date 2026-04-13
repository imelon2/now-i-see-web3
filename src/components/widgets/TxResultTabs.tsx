"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Chain, TransactionReceipt } from "viem";
import type { GetWithdrawalStatusReturnType } from "viem/op-stack";
import { Tabs, type TabItem, type TabPanel } from "@/components/ui/Tabs";
import { TxInfoPanel } from "@/components/widgets/TxInfoPanel";
import { CalldataResultSection } from "@/components/widgets/CalldataResultSection";
import { EventLogView } from "@/components/widgets/EventLogView";
import { ErrorDecoderPanel } from "@/components/widgets/ErrorDecoderPanel";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { WithdrawalDetailsTabs } from "@/components/widgets/withdrawal/WithdrawalDetailsTabs";
import type { UseRevertSimulationResult } from "@/hooks/useRevertSimulation";
import type { SearchResult } from "@/hooks/useTxSearch";
import type {
  DepositTxMatch,
  WithdrawalTxOrigin,
} from "@/lib/opstack/withdrawal";
import type { DepositDerivation, DepositOpaque } from "@/hooks/useDepositStatus";
import { OpaqueDataPanel } from "@/components/widgets/deposit/OpaqueDataPanel";
import { L2HashDerivationPanel } from "@/components/widgets/deposit/L2HashDerivationPanel";

type TabKey = "overview" | "events" | "revert" | "withdrawal";

export interface TxResultTabsProps {
  result: SearchResult;
  isReverted: boolean;
  isWithdrawal: boolean;
  isDeposit: boolean;
  isReceivedDeposit: boolean;
  isCrossMessage: boolean;
  depositMatch: DepositTxMatch | null;
  depositOpaque: DepositOpaque | null;
  depositDerivation: DepositDerivation | null;
  receivedDepositOpaque: DepositOpaque | null;
  receivedDepositDerivation: DepositDerivation | null;
  withdrawalSource: WithdrawalTxOrigin | null;
  withdrawalStatus: GetWithdrawalStatusReturnType | null;
  withdrawalLoading: boolean;
  receipt: TransactionReceipt | null;
  chain: Chain;
  sim: UseRevertSimulationResult;
}

export function TxResultTabs({
  result,
  isReverted,
  isWithdrawal,
  isDeposit,
  isReceivedDeposit,
  isCrossMessage,
  depositMatch,
  depositOpaque,
  depositDerivation,
  receivedDepositOpaque,
  receivedDepositDerivation,
  withdrawalSource,
  withdrawalStatus,
  withdrawalLoading,
  receipt,
  chain,
  sim,
}: TxResultTabsProps) {
  const items = useMemo<TabItem<TabKey>[]>(() => {
    const list: TabItem<TabKey>[] = [
      { key: "overview", label: "Overview" },
      { key: "events", label: "Events" },
    ];
    if (isReverted) list.push({ key: "revert", label: "Revert" });
    if (isCrossMessage) list.push({ key: "withdrawal", label: "Cross Message", aura: true });
    return list;
  }, [isReverted, isCrossMessage]);

  const [active, setActive] = useState<TabKey>("overview");

  // Reset to overview whenever a new transaction is loaded.
  useEffect(() => {
    setActive("overview");
  }, [result.txInfo.hash]);

  const hasCalldata = result.txInfo.input && result.txInfo.input !== "0x";

  const overviewPanel = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TxInfoPanel txInfo={result.txInfo} />
      {hasCalldata ? (
        <CalldataResultSection
          calldata={result.txInfo.input}
          decodedList={result.decodedCalldataVariants}
        />
      ) : (
        <div style={{ padding: "24px 8px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
          No calldata (0x).
        </div>
      )}
    </div>
  );

  const eventsPanel = (
    <EventLogView
      rawLogs={result.rawLogs}
      decodedEventVariants={result.decodedEventVariants}
    />
  );

  const revertPanel = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {sim.status === "idle" && (
        <button
          onClick={sim.simulate}
          style={{
            background: "rgba(248, 81, 73, 0.15)",
            color: "var(--error)",
            border: "1px solid rgba(248, 81, 73, 0.3)",
            fontWeight: 400,
            padding: "10px 20px",
            borderRadius: 9999,
            fontSize: 14,
            cursor: "pointer",
            width: "100%",
            transition: "background 0.15s",
          }}
        >
          Simulate Revert
        </button>
      )}
      {sim.status === "loading" && <LoadingSpinner message="Simulating transaction…" />}
      {sim.status === "error" && sim.error && <ErrorDisplay kind="rpc" message={sim.error} />}
      {sim.status === "done" && (
        <>
          {sim.usedLatest && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                background: "rgba(210,153,34,0.1)",
                border: "1px solid rgba(210,153,34,0.3)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "var(--warning)", fontSize: 13 }}>
                Simulated at current state — revert reason may differ from the original transaction.
              </span>
            </div>
          )}
          {sim.rawData ? (
            <ErrorDecoderPanel
              errorData={sim.rawData}
              decoded={sim.decodedList.length > 0 ? sim.decodedList[sim.abiIndex] ?? null : null}
              failureReason={sim.failReason}
              abiIndex={sim.abiIndex}
              abiTotal={sim.decodedList.length}
              onPrev={() => sim.setAbiIndex((i) => Math.max(0, i - 1))}
              onNext={() => sim.setAbiIndex((i) => Math.min(sim.decodedList.length - 1, i + 1))}
            />
          ) : (
            <div className="panel" style={{ flex: 1 }}>
              <div className="panel-header">
                <span>Decoded Error</span>
              </div>
              <div className="panel-body">
                <div
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "8px 12px",
                  }}
                >
                  <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 4 }}>
                    Revert Reason
                  </div>
                  <code style={{ fontSize: 15, color: "var(--muted)" }}>null</code>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Cross Message tab content.
  //  - Withdrawal (initiate): full details panel.
  //  - Withdrawal (prove/finalize): tab present but empty (scope: follow-up).
  //  - Deposit: placeholder — target L2 + portal address, details TBD.
  let crossMessagePanel: ReactNode = null;
  if (isWithdrawal) {
    crossMessagePanel =
      withdrawalSource === "initiate" ? (
        withdrawalLoading ? (
          <LoadingSpinner message="Loading withdrawal status…" />
        ) : withdrawalStatus ? (
          <WithdrawalDetailsTabs
            receipt={receipt}
            chain={chain}
            withdrawalStatus={withdrawalStatus}
          />
        ) : null
      ) : null;
  } else if (isDeposit && depositMatch) {
    crossMessagePanel = (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <L2HashDerivationPanel derivation={depositDerivation} />
        <OpaqueDataPanel opaque={depositOpaque} />
      </div>
    );
  } else if (isReceivedDeposit) {
    crossMessagePanel = (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)", fontSize: 13 }}>
        Coming soon — deposit detail view is under construction.
      </div>
    );
  }

  const panels: TabPanel<TabKey>[] = [
    { key: "overview", content: overviewPanel },
    { key: "events", content: eventsPanel },
  ];
  if (isReverted) panels.push({ key: "revert", content: revertPanel });
  if (isCrossMessage) panels.push({ key: "withdrawal", content: crossMessagePanel });

  return (
    <Tabs<TabKey>
      items={items}
      active={active}
      onChange={setActive}
      idPrefix="tx-result"
      panels={panels}
    />
  );
}

