"use client";

import type { GetWithdrawalStatusReturnType } from "viem/op-stack";
import type { Chain } from "viem";
import { useRouter } from "next/navigation";
import { useGlobalError } from "@/context/GlobalErrorContext";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { OpStackBadge } from "@/components/ui/OpStackBadge";
import { ProcessPhaseMarker } from "@/components/ui/ProcessPhaseMarker";
import { STATUS_LABELS, STATUS_PHASE, STATUS_DESCRIPTIONS } from "@/lib/opstack/withdrawal";
import { PHASE_ICONS, StatusDescIcon } from "./icons";

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function WithdrawalProcessPanel({
  withdrawalStatus,
  timeToProve,
  timeToFinalize,
  statusLoading,
  statusError,
  onLookupProveTx,
  onLookupInitiateTx,
  txOrigin,
  l1Chain,
  l2Chain,
}: {
  withdrawalStatus: GetWithdrawalStatusReturnType | null;
  timeToProve: { seconds: number } | null;
  timeToFinalize: { seconds: number } | null;
  statusLoading: boolean;
  statusError: string | null;
  onLookupProveTx?: () => Promise<void>;
  onLookupInitiateTx?: () => Promise<void>;
  txOrigin?: "initiate" | "prove" | "finalize";
  l1Chain?: Chain | null;
  l2Chain?: Chain | null;
}) {
  const { showError } = useGlobalError();

  if (statusLoading) {
    return (
      <div className="panel">
        <div className="panel-header" style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8 }}>
          <OpStackBadge />
          <span>Withdrawal</span>
          {txOrigin && (
            <>
              <span>|</span>
              <span>{txOrigin.charAt(0).toUpperCase() + txOrigin.slice(1)} Transaction</span>
            </>
          )}
        </div>
        <div className="panel-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.6" style={{ animation: "spin 1s linear infinite" }}>
            <circle cx="8" cy="8" r="6" strokeDasharray="28" strokeDashoffset="8" />
          </svg>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Loading withdrawal status…</span>
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="panel">
        <div className="panel-header" style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8 }}>
          <OpStackBadge />
          <span>Withdrawal</span>
          {txOrigin && (
            <>
              <span>|</span>
              <span>{txOrigin.charAt(0).toUpperCase() + txOrigin.slice(1)} Transaction</span>
            </>
          )}
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <OpStackBadge />
          <span>Withdrawal</span>
          {txOrigin && (
            <>
              <span>|</span>
              <span>{txOrigin.charAt(0).toUpperCase() + txOrigin.slice(1)} Transaction</span>
            </>
          )}
        </div>
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
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 30, justifyContent: "center", maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
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
                <ProcessPhaseMarker
                  label={label}
                  subLabel={
                    key === "initiate"
                      ? l2Chain ? `${l2Chain.name} (${l2Chain.id})` : undefined
                      : l1Chain ? `${l1Chain.name} (${l1Chain.id})` : undefined
                  }
                  state={state}
                  icon={PHASE_ICONS[key](state.color)}
                  doneIcon={PHASE_ICONS.check("#ffffff")}
                  minWidth={56}
                  onClickNavigate={key === "prove" ? onLookupProveTx : key === "initiate" ? onLookupInitiateTx : undefined}
                  onError={showError}
                />
                {i < phases.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      minWidth: 120,
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
                    <span style={{
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      color: "var(--warning)",
                      marginBottom: 4,
                      marginTop: -14,
                      letterSpacing: "0.02em",
                      visibility: timerActive ? "visible" : "hidden",
                      whiteSpace: "nowrap",
                    }}>
                      {timerActive ? formatTime(segmentTimer.seconds) : "\u00A0"}
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
                      <svg width="8" height="10" viewBox="0 0 8 10" fill={connectorFilled ? (timerActive ? "var(--warning)" : "var(--success)") : "var(--border)"} style={{ flexShrink: 0, marginLeft: -1, transition: "fill 0.3s ease" }}>
                        <path d="M0 0 L8 5 L0 10 Z" />
                      </svg>
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

