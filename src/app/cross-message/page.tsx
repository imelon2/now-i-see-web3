"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type GetWithdrawalStatusReturnType, getWithdrawals } from "viem/op-stack";
import { useTxSearch } from "@/hooks/useTxSearch";
import { useUserChains } from "@/hooks/useUserChains";
import { isValidHex } from "@/lib/utils/hex";
import { TxInfoPanel } from "@/components/widgets/TxInfoPanel";
import { CalldataResultSection } from "@/components/widgets/CalldataResultSection";
import { EventLogView } from "@/components/widgets/EventLogView";
import { SupportedChainsPopup } from "@/components/widgets/SupportedChainsPopup";
import { AbiArchiveLink } from "@/components/ui/AbiArchiveLink";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { crossMessageChains, getL1Chain } from "@/lib/chains/chainList";
import { createOpStackL1Client } from "@/lib/utils/viemClient";

// L2ToL1MessagePasser.initiateWithdrawal(address,uint256,bytes)
// selector = keccak256("initiateWithdrawal(address,uint256,bytes)")[:4]
const L2_TO_L1_MESSAGE_PASSER = "0x4200000000000000000000000000000000000016";
const WITHDRAWAL_SELECTOR = "0xc2b3e5ac";

const STATUS_LABELS: Record<GetWithdrawalStatusReturnType, string> = {
  "waiting-to-prove": "Waiting to Prove",
  "ready-to-prove": "Ready to Prove",
  "waiting-to-finalize": "Waiting to Finalize",
  "ready-to-finalize": "Ready to Finalize",
  finalized: "Finalized",
};

const STATUS_PHASE: Record<GetWithdrawalStatusReturnType, number> = {
  "waiting-to-prove": 1,
  "ready-to-prove": 1,
  "waiting-to-finalize": 2,
  "ready-to-finalize": 2,
  finalized: 3,
};

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const PHASE_ICONS = {
  initiate: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v12M2 8l6-6 6 6" />
    </svg>
  ),
  prove: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L3 4v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V4L8 2Z" />
    </svg>
  ),
  finalize: (color: string) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 8 6 12 14 4" />
    </svg>
  ),
  check: (color: string) => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 8 7 12 13 4" />
    </svg>
  ),
};

const STATUS_DESCRIPTIONS: Record<GetWithdrawalStatusReturnType, { text: string; color: string; icon: "info" | "action" | "check" }> = {
  "waiting-to-prove": { text: "Waiting for the dispute game window. The withdrawal will be provable once the challenge period passes.", color: "var(--warning)", icon: "info" },
  "ready-to-prove": { text: "The challenge period has passed. This withdrawal can now be proved on L1.", color: "var(--accent)", icon: "action" },
  "waiting-to-finalize": { text: "Withdrawal has been proved. Waiting for the finalization period to complete.", color: "var(--warning)", icon: "info" },
  "ready-to-finalize": { text: "Finalization period complete. This withdrawal can now be finalized on L1.", color: "var(--accent)", icon: "action" },
  finalized: { text: "Withdrawal has been finalized and funds have been released on L1.", color: "var(--success)", icon: "check" },
};

function StatusDescIcon({ icon, color }: { icon: "info" | "action" | "check"; color: string }) {
  const sharedProps = {
    width: 14,
    height: 14,
    viewBox: "0 0 16 16",
    fill: "none" as const,
    stroke: color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { flexShrink: 0, marginTop: 2 },
  };

  if (icon === "check") {
    return (
      <svg {...sharedProps} strokeWidth="1.8">
        <polyline points="3 8 7 12 13 4" />
      </svg>
    );
  }
  if (icon === "action") {
    return (
      <svg {...sharedProps} strokeWidth="1.6">
        <circle cx="8" cy="8" r="6" />
        <path d="M6 8l2 2 4-4" />
      </svg>
    );
  }
  return (
    <svg {...sharedProps} strokeWidth="1.6">
      <circle cx="8" cy="8" r="6" />
      <line x1="8" y1="7" x2="8" y2="11" />
      <circle cx="8" cy="5" r="0.5" fill={color} stroke="none" />
    </svg>
  );
}

function WithdrawalProcessPanel({
  withdrawalStatus,
  timeToProve,
  timeToFinalize,
  statusLoading,
  statusError,
}: {
  withdrawalStatus: GetWithdrawalStatusReturnType | null;
  timeToProve: { seconds: number } | null;
  timeToFinalize: { seconds: number } | null;
  statusLoading: boolean;
  statusError: string | null;
}) {
  if (statusLoading) {
    return (
      <div className="panel">
        <div className="panel-header">
          <span>Withdrawal Process</span>
        </div>
        <div className="panel-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.6" style={{ animation: "spin 1s linear infinite" }}>
            <circle cx="8" cy="8" r="6" strokeDasharray="28" strokeDashoffset="8" />
          </svg>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Loading withdrawal status…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="panel">
        <div className="panel-header">
          <span>Withdrawal Process</span>
        </div>
        <div className="panel-body">
          <ErrorDisplay kind="rpc" message={statusError} />
        </div>
      </div>
    );
  }

  if (!withdrawalStatus) return null;

  const currentPhase = STATUS_PHASE[withdrawalStatus];
  const desc = STATUS_DESCRIPTIONS[withdrawalStatus];

  const phases = [
    { label: "Initiate", key: "initiate" as const, phase: 0 },
    { label: "Prove", key: "prove" as const, phase: 1 },
    { label: "Finalize", key: "finalize" as const, phase: 2 },
  ];

  const isWaiting = withdrawalStatus === "waiting-to-prove" || withdrawalStatus === "waiting-to-finalize";

  const getPhaseState = (phase: number) => {
    if (phase === 0) return { done: true, active: false, color: "var(--success)" };
    if (currentPhase === 3) return { done: true, active: false, color: "var(--success)" };
    if (phase < currentPhase) return { done: true, active: false, color: "var(--success)" };
    if (phase === currentPhase) {
      return { done: false, active: true, color: isWaiting ? "var(--warning)" : "var(--accent)" };
    }
    return { done: false, active: false, color: "var(--muted)" };
  };

  return (
    <div className="panel">
      <div className="panel-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>Withdrawal Process</span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            padding: "2px 8px",
            border: `1px solid ${desc?.color ?? "var(--border)"}`,
            color: desc?.color ?? "var(--muted)",
            background: `color-mix(in srgb, ${desc?.color ?? "var(--border)"} 8%, transparent)`,
          }}
        >
          {STATUS_LABELS[withdrawalStatus]}
        </span>
      </div>
      <div className="panel-body" style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 20 }}>
          {phases.map(({ label, key, phase }, i) => {
            const state = getPhaseState(phase);
            const segmentTimer = phase === 0 ? timeToProve : timeToFinalize;
            const timerActive = segmentTimer && segmentTimer.seconds > 0;
            const segmentDone = phase === 0
              ? currentPhase > 1 || (currentPhase === 1 && !isWaiting)
              : currentPhase === 3 || (currentPhase === 2 && !isWaiting);
            const connectorFilled = timerActive || segmentDone;

            return (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: i < phases.length - 1 ? 1 : undefined }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 56 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: `2px solid ${state.color}`,
                      background: state.done ? state.color : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: state.done || state.active ? 1 : 0.4,
                      boxShadow: state.active ? `0 0 0 4px color-mix(in srgb, ${state.color} 15%, transparent)` : "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {state.done
                      ? PHASE_ICONS.check("#ffffff")
                      : PHASE_ICONS[key](state.color)}
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: state.active ? 600 : 400,
                    color: state.color,
                    opacity: state.done || state.active ? 1 : 0.4,
                    whiteSpace: "nowrap",
                  }}>
                    {label}
                  </span>
                </div>
                {i < phases.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      alignSelf: "flex-start",
                      marginTop: 15,
                      marginLeft: 4,
                      marginRight: 4,
                      gap: 0,
                    }}
                  >
                    {timerActive && (
                      <span style={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                        color: "var(--warning)",
                        marginBottom: 4,
                        marginTop: -14,
                        letterSpacing: "0.02em",
                      }}>
                        {formatTime(segmentTimer.seconds)}
                      </span>
                    )}
                    <div
                      style={{
                        width: "100%",
                        height: 2,
                        background: "var(--border)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        width: connectorFilled ? "100%" : "0%",
                        background: timerActive ? "var(--warning)" : "var(--success)",
                        transition: "width 0.5s ease, background 0.3s ease",
                      }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {desc && (
          <div
            style={{
              padding: "10px 12px",
              background: `color-mix(in srgb, ${desc.color} 5%, transparent)`,
              border: `1px solid color-mix(in srgb, ${desc.color} 20%, transparent)`,
              fontSize: 13,
              color: "var(--foreground)",
              lineHeight: 1.6,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <StatusDescIcon icon={desc.icon} color={desc.color} />
            <span>{desc.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CrossMessageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hashFromUrl = searchParams.get("hash") ?? "";

  const { viemChains: userViemChains } = useUserChains();
  const { status, result, error, search, reset } = useTxSearch({ chains: crossMessageChains, extraChains: userViemChains });
  const totalChains = crossMessageChains.length + userViemChains.length;
  const [inputHash, setInputHash] = useState(hashFromUrl);
  const [validationError, setValidationError] = useState("");

  const [withdrawalStatus, setWithdrawalStatus] = useState<GetWithdrawalStatusReturnType | null>(null);
  const [timeToProve, setTimeToProve] = useState<{ seconds: number } | null>(null);
  const [initialProveSeconds, setInitialProveSeconds] = useState<number | null>(null);
  const [timeToFinalize, setTimeToFinalize] = useState<{ seconds: number } | null>(null);
  const [initialFinalizeSeconds, setInitialFinalizeSeconds] = useState<number | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const loading = status === "searching";

  const isWithdrawal =
    result?.txInfo.to?.toLowerCase() === L2_TO_L1_MESSAGE_PASSER &&
    result?.txInfo.input.startsWith(WITHDRAWAL_SELECTOR);

  const hasCalldata =
    result?.txInfo.input &&
    result.txInfo.input !== "0x";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchWithdrawalStatus = useCallback(async (receipt: NonNullable<typeof result>["receipt"], chain: any) => {
    if (!receipt) return;

    const l1Chain = getL1Chain(chain);
    if (!l1Chain) return;

    setStatusLoading(true);
    setStatusError(null);
    setWithdrawalStatus(null);
    setTimeToProve(null);
    setTimeToFinalize(null);

    try {
      const l1Client = createOpStackL1Client(l1Chain);

      const wdStatus = await l1Client.getWithdrawalStatus({
        receipt,
        targetChain: chain,
      });
      setWithdrawalStatus(wdStatus);

      if (wdStatus === "waiting-to-prove" || wdStatus === "ready-to-prove") {
        try {
          const timeToNextGame = await l1Client.getTimeToNextGame({
            targetChain: chain,
            l2BlockNumber: receipt.blockNumber,
          });
          const secs = Number(timeToNextGame.seconds);
          setTimeToProve({ seconds: secs });
          setInitialProveSeconds(secs);
        } catch {
          setTimeToProve({ seconds: 0 });
          setInitialProveSeconds(0);
        }
      }

      if (wdStatus === "waiting-to-finalize") {
        try {
          const withdrawals = getWithdrawals({ logs: receipt.logs });
          if (withdrawals.length > 0) {
            const finalizeTime = await l1Client.getTimeToFinalize({
              withdrawalHash: withdrawals[0].withdrawalHash,
              targetChain: chain,
            });
            const secs = Number(finalizeTime.seconds);
            setTimeToFinalize({ seconds: secs });
            setInitialFinalizeSeconds(secs);
          }
        } catch {
          setTimeToFinalize({ seconds: 0 });
          setInitialFinalizeSeconds(0);
        }
      }
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "Failed to fetch withdrawal status.");
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!timeToProve || timeToProve.seconds <= 0) return;
    const interval = setInterval(() => {
      setTimeToProve((prev) => {
        if (!prev || prev.seconds <= 1) {
          clearInterval(interval);
          return { seconds: 0 };
        }
        return { seconds: prev.seconds - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [initialProveSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!timeToFinalize || timeToFinalize.seconds <= 0) return;
    const interval = setInterval(() => {
      setTimeToFinalize((prev) => {
        if (!prev || prev.seconds <= 1) {
          clearInterval(interval);
          return { seconds: 0 };
        }
        return { seconds: prev.seconds - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [initialFinalizeSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync input field and auto-search when URL hash param changes
  useEffect(() => {
    if (hashFromUrl) {
      setInputHash(hashFromUrl);
      if (isValidHex(hashFromUrl) && hashFromUrl.length === 66) {
        search(hashFromUrl);
      }
    } else {
      setInputHash("");
      reset();
      setWithdrawalStatus(null);
      setTimeToProve(null);
      setTimeToFinalize(null);
      setStatusError(null);
    }
  }, [hashFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger withdrawal status fetch when result changes
  useEffect(() => {
    if (isWithdrawal && result?.receipt && result?.chain) {
      fetchWithdrawalStatus(result.receipt, result.chain);
    } else {
      setWithdrawalStatus(null);
      setTimeToProve(null);
      setTimeToFinalize(null);
      setStatusError(null);
    }
  }, [result, isWithdrawal, fetchWithdrawalStatus]);

  const handleSearch = () => {
    const trimmed = inputHash.trim();
    if (!trimmed) {
      setValidationError("Please enter a transaction hash.");
      return;
    }
    if (!isValidHex(trimmed) || trimmed.length !== 66) {
      setValidationError(
        "Invalid hash. Enter a 66-char hex starting with 0x."
      );
      return;
    }
    setValidationError("");
    router.push(`/cross-message?hash=${trimmed}`);
  };

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "1.5em", fontWeight: 400, margin: "0 0 6px" }}>
            Cross Message Analyzer
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            Trace cross-chain messages across {totalChains} chains.
          </p>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span>Transaction Search</span>
          </div>
          <div className="panel-body">
            <label
              htmlFor="tx-hash-input"
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--muted)",
                marginBottom: 6,
                fontWeight: 400,
              }}
            >
              Transaction Hash
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="tx-hash-input"
                type="text"
                placeholder="0x..."
                value={inputHash}
                onChange={(e) => {
                  setInputHash(e.target.value);
                  setValidationError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleSearch()}
                disabled={loading}
                style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 14 }}
                autoFocus={!hashFromUrl}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  background: loading ? "var(--border)" : "var(--foreground)",
                  color: "var(--background)",
                  border: "1px solid var(--border)",
                  fontWeight: 400,
                  minWidth: 90,
                  transition: "background 0.15s",
                }}
              >
                {loading ? "Searching…" : "Search"}
              </button>
            </div>
            {validationError && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: "rgba(248,81,73,0.1)",
                  border: "1px solid rgba(248,81,73,0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--error)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6" />
                  <line x1="8" y1="5.5" x2="8" y2="8.5" />
                  <circle cx="8" cy="10.5" r="0.5" fill="var(--error)" />
                </svg>
                <span style={{ color: "var(--error)", fontSize: 13 }}>
                  {validationError}
                </span>
              </div>
            )}
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <SupportedChainsPopup chains={crossMessageChains} />
              <AbiArchiveLink />
            </div>
          </div>
        </div>

        {loading && (
          <LoadingSpinner
            message="Searching across chains…"
            subMessage={`Querying ${totalChains} chains in parallel`}
          />
        )}

        {status === "not-found" && (
          <div className="panel">
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 16 16" fill="none" stroke="var(--warning)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6.5" cy="6.5" r="4.5" />
                <line x1="10.5" y1="10.5" x2="14" y2="14" />
                <line x1="4.5" y1="6.5" x2="8.5" y2="6.5" />
              </svg>
              <p style={{ color: "var(--warning)", fontWeight: 600, margin: 0 }}>
                Transaction not found
              </p>
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                The transaction was not found on any of the {totalChains} supported chains.
              </p>
            </div>
          </div>
        )}

        {status === "error" && error && (
          <ErrorDisplay kind="rpc" message={error} />
        )}

        {status === "found" && result && (
          <>
            {!isWithdrawal && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(210,153,34,0.1)",
                  border: "1px solid rgba(210,153,34,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--warning)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2L14.5 13H1.5L8 2Z" />
                  <line x1="8" y1="7" x2="8" y2="9.5" />
                  <circle cx="8" cy="11.5" r="0.5" fill="var(--warning)" />
                </svg>
                <span style={{ color: "var(--warning)", fontSize: 13 }}>
                  This transaction is not a Cross Message Transaction.
                </span>
              </div>
            )}

            {isWithdrawal && (
              <>
                <WithdrawalProcessPanel
                  withdrawalStatus={withdrawalStatus}
                  timeToProve={timeToProve}
                  timeToFinalize={timeToFinalize}
                  statusLoading={statusLoading}
                  statusError={statusError}
                />

                <TxInfoPanel txInfo={result.txInfo} />

                {hasCalldata && (
                  <CalldataResultSection
                    calldata={result.txInfo.input}
                    decodedList={result.decodedCalldataVariants}
                  />
                )}

                <EventLogView
                  rawLogs={result.rawLogs}
                  decodedEventVariants={result.decodedEventVariants}
                />
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function CrossMessagePage() {
  return (
    <Suspense>
      <CrossMessageContent />
    </Suspense>
  );
}
