"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Chain, TransactionReceipt } from "viem";
import type { GetWithdrawalStatusReturnType } from "viem/op-stack";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useProveTransaction } from "@/hooks/useProveTransaction";
import { parseInitiateData } from "@/lib/opstack/withdrawal";
import { PHASE_ICONS, InfoDot } from "./icons";

export function WithdrawalDetailsTabs({
  receipt,
  chain,
  withdrawalStatus,
}: {
  receipt: TransactionReceipt | null;
  chain: Chain | null;
  withdrawalStatus: GetWithdrawalStatusReturnType | null;
}) {
  const router = useRouter();
  const initiateData = parseInitiateData(receipt);

  const { proveTxHash, loading: proveLoading, error: proveError, lookup: lookupProveTx } = useProveTransaction({
    receipt,
    l2Chain: chain,
    withdrawalStatus,
  });

  // When the lookup resolves a prove tx hash, jump to its tx-analyzer view.
  useEffect(() => {
    if (proveTxHash) {
      router.push(`/tx-analyzer?hash=${proveTxHash}`);
    }
  }, [proveTxHash, router]);

  if (!withdrawalStatus) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="panel">
        <div className="panel-header">
          <span>MessagePassed</span>
        </div>
        <div className="panel-body" style={{ padding: 16 }}>
          {initiateData ? (
            <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", display: "flex", flexDirection: "column", gap: 0 }}>
              {(() => {
                const branchStyle = (isLast: boolean): React.CSSProperties => ({
                  display: "flex", alignItems: "flex-start", marginLeft: 8, position: "relative",
                  borderLeft: isLast ? "none" : "1px solid var(--border)",
                });
                const armOf = (isLast: boolean): React.CSSProperties => ({
                  position: "absolute", left: isLast ? 0 : -1, top: 0, width: 10, height: 15,
                  borderLeft: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
                });
                const contentStyle: React.CSSProperties = {
                  display: "flex", alignItems: "flex-start", padding: "5px 0", marginLeft: 14,
                };
                const childFields = [
                  { label: "sender", value: initiateData.sender },
                  { label: "target", value: initiateData.target },
                  { label: "value", value: initiateData.value.toString() },
                  { label: "gasLimit", value: initiateData.gasLimit.toString() },
                  { label: "data", value: initiateData.data },
                ];
                return (
                  <>
                    <div style={{ display: "flex", alignItems: "center", padding: "6px 0" }}>
                      <span style={{ color: "var(--muted)", width: 126, flexShrink: 0, fontSize: 12 }}>withdrawalHash</span>
                      <span style={{ color: "var(--foreground)", wordBreak: "break-all" }}>{initiateData.withdrawalHash}</span>
                    </div>
                    <InfoDot tip="keccak256(abi.encode(nonce, sender, target, value, gasLimit, data))" />
                    <div>
                      {childFields.map(({ label, value }) => (
                        <div key={label} style={branchStyle(false)}>
                          <div style={armOf(false)} />
                          <div style={contentStyle}>
                            <span style={{ color: "var(--muted)", flexShrink: 0, width: 96, fontSize: 12 }}>{label}</span>
                            <span style={{ color: "var(--foreground)", wordBreak: "break-all", marginLeft: 8 }}>{value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={branchStyle(true)}>
                      <div style={armOf(true)} />
                      <div style={{ marginLeft: 14 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", padding: "5px 0" }}>
                          <span style={{ color: "var(--muted)", flexShrink: 0, width: 96, fontSize: 12 }}>nonce</span>
                          <span style={{ color: "var(--foreground)", wordBreak: "break-all", marginLeft: 8 }}>{initiateData.nonce.toString()}</span>
                        </div>
                        <InfoDot tip="(version << 240) | msgNonce" />
                        <div>
                          <div style={branchStyle(false)}>
                            <div style={armOf(false)} />
                            <div style={contentStyle}>
                              <span style={{ color: "var(--muted)", flexShrink: 0, width: 72, fontSize: 12 }}>msgNonce</span>
                              <span style={{ color: "var(--foreground)", marginLeft: 8 }}>{initiateData.msgNonce.toString()}</span>
                            </div>
                          </div>
                          <div style={branchStyle(true)}>
                            <div style={armOf(true)} />
                            <div style={contentStyle}>
                              <span style={{ color: "var(--muted)", flexShrink: 0, width: 72, fontSize: 12 }}>version</span>
                              <span style={{ color: "var(--foreground)", marginLeft: 8 }}>{initiateData.version.toString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 0", gap: 8 }}>
              {PHASE_ICONS.initiate("var(--border)")}
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                No initiate data available.
              </span>
            </div>
          )}
        </div>
      </div>

      {!proveTxHash && !proveLoading && !proveError && (
        <button
          onClick={lookupProveTx}
          style={{
            background: "var(--panel)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            fontWeight: 400,
            padding: "10px 20px",
            borderRadius: 9999,
            fontSize: 14,
            cursor: "pointer",
            width: "100%",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--panel-header)";
            e.currentTarget.style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--panel)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          Search Prove Transaction
        </button>
      )}
      {proveLoading && <LoadingSpinner message="Searching prove transaction…" />}
      {proveError && !proveLoading && <ErrorDisplay kind="rpc" message={proveError} />}
      {proveTxHash && !proveLoading && (
        <div className="panel">
          <div className="panel-header">
            <span>Prove Transaction</span>
          </div>
          <div className="panel-body" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 60 }}>Tx Hash</span>
              <code style={{
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                color: "var(--accent)",
                wordBreak: "break-all",
              }}>
                {proveTxHash}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
