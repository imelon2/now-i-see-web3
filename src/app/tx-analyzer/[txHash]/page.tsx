"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTxSearch } from "@/hooks/useTxSearch";
import { useUserChains } from "@/hooks/useUserChains";
import { isValidHex } from "@/lib/utils/hex";
import { supportedChains, getL1Chain } from "@/lib/chains/chainList";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { SupportedChainsPopup } from "@/components/widgets/SupportedChainsPopup";
import { AbiArchiveLink } from "@/components/ui/AbiArchiveLink";
import { DetailsToggle } from "@/components/ui/DetailsToggle";
import {
  computeWithdrawalHash,
  detectOpStackDepositTx,
  detectOpStackFinalizeTx,
  detectOpStackProveTx,
  isOpStackWithdrawalTx,
  parseProveTxCalldata,
  parseProveTxCalldataFull,
  parseFinalizeCalldata,
  type WithdrawalTxOrigin,
} from "@/lib/opstack/withdrawal";
import { detectReceivedDepositTx } from "@/lib/opstack/receivedDeposit";
import { useWithdrawalStatus } from "@/hooks/useWithdrawalStatus";
import { useDepositStatus } from "@/hooks/useDepositStatus";
import { useReceivedDepositLookup } from "@/hooks/useReceivedDepositLookup";
import { useProveTransaction } from "@/hooks/useProveTransaction";
import { useInitiateTxLookup } from "@/hooks/useInitiateTxLookup";
import { useRevertSimulation } from "@/hooks/useRevertSimulation";
import { WithdrawalProcessPanel } from "@/components/widgets/withdrawal/WithdrawalProcessPanel";
import { DepositProcessPanel } from "@/components/widgets/deposit/DepositProcessPanel";
import { TxResultTabs } from "@/components/widgets/TxResultTabs";

export default function TxHashPage({ params }: { params: Promise<{ txHash: string }> }) {
  const { txHash } = use(params);
  const router = useRouter();

  const { viemChains: userViemChains } = useUserChains();
  const { status, result, error, search, reset } = useTxSearch({ extraChains: userViemChains });
  const totalChains = supportedChains.length + userViemChains.length;
  const [inputHash, setInputHash] = useState(txHash);
  const [validationError, setValidationError] = useState("");

  const loading = status === "searching";

  const isInitiateTx = isOpStackWithdrawalTx(result?.txInfo, result?.chain ?? null);
  const proveDetect = detectOpStackProveTx(result?.txInfo, result?.chain ?? null);
  const finalizeDetect = detectOpStackFinalizeTx(result?.txInfo, result?.chain ?? null);
  const depositDetect = detectOpStackDepositTx(
    result?.receipt?.logs,
    result?.chain ?? null,
  );
  const receivedDepositDetect = detectReceivedDepositTx(
    result?.txInfo,
    result?.chain ?? null,
  );

  const withdrawalSource: WithdrawalTxOrigin | null = isInitiateTx
    ? "initiate"
    : proveDetect
      ? "prove"
      : finalizeDetect
        ? "finalize"
        : null;
  const isWithdrawal = withdrawalSource !== null;
  const isDeposit = !isWithdrawal && depositDetect !== null;
  const isReceivedDeposit = !isWithdrawal && !isDeposit && receivedDepositDetect !== null;
  const isCrossMessage = isWithdrawal || isDeposit || isReceivedDeposit;
  const isReverted = result?.txInfo.status === "reverted" && result?.txInfo.to !== null;

  const proveTuple =
    proveDetect && result?.txInfo.input
      ? parseProveTxCalldata(result.txInfo.input)
      : null;
  const proveWithdrawalHash = proveTuple ? computeWithdrawalHash(proveTuple) : null;

  const proveCalldataFull =
    proveDetect && result?.txInfo.input
      ? parseProveTxCalldataFull(result.txInfo.input)
      : null;
  const finalizeTuple =
    finalizeDetect && result?.txInfo.input
      ? parseFinalizeCalldata(result.txInfo.input)
      : null;

  const {
    status: withdrawalStatus,
    timeToProve,
    timeToFinalize,
    loading: withdrawalLoading,
    error: withdrawalError,
  } = useWithdrawalStatus(
    withdrawalSource === "initiate"
      ? {
          source: "initiate",
          receipt: result?.receipt ?? null,
          chain: result?.chain ?? null,
          enabled: true,
        }
      : withdrawalSource === "prove"
        ? {
            source: "prove",
            withdrawalHash: proveWithdrawalHash,
            l2Chain: proveDetect?.l2Chain ?? null,
            portalAddress: proveDetect?.portalAddress ?? null,
            enabled: true,
          }
        : withdrawalSource === "finalize"
          ? { source: "finalize", enabled: true }
          : { source: null, enabled: false },
  );

  const proveTx = useProveTransaction({
    receipt: result?.receipt ?? null,
    l2Chain: result?.chain ?? null,
    withdrawalStatus,
  });

  const initiateTx = useInitiateTxLookup({
    withdrawalTx: proveCalldataFull?.tx ?? finalizeTuple ?? null,
    l2UpperBlockHash: proveCalldataFull?.latestBlockhash ?? null,
    l2Chain: proveDetect?.l2Chain ?? finalizeDetect?.l2Chain ?? null,
    enabled: withdrawalSource === "prove" || withdrawalSource === "finalize",
  });

  const deposit = useDepositStatus({
    receipt: result?.receipt ?? null,
    l1Chain: result?.chain ?? null,
    l2Chain: depositDetect?.l2Chain ?? null,
    portalAddress: depositDetect?.portalAddress ?? null,
    enabled: isDeposit,
  });

  const receivedDeposit = useReceivedDepositLookup({
    sourceHash: (result?.txInfo.sourceHash as `0x${string}`) ?? null,
    l2BlockNumber: result?.txInfo.blockNumber ?? null,
    l2Chain: receivedDepositDetect?.l2Chain ?? null,
    l1Chain: receivedDepositDetect?.l1Chain ?? null,
    enabled: isReceivedDeposit,
  });

  const sim = useRevertSimulation({
    txInfo: result?.txInfo ?? null,
    chain: result?.chain ?? null,
  });

  // Auto-search on mount
  useEffect(() => {
    if (txHash && isValidHex(txHash) && txHash.length === 66) {
      search(txHash);
    }
  }, [txHash]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const trimmed = inputHash.trim();
    if (!trimmed) {
      setValidationError("Please enter a transaction hash.");
      return;
    }
    if (!isValidHex(trimmed) || trimmed.length !== 66) {
      setValidationError("Invalid hash. Enter a 66-char hex starting with 0x.");
      return;
    }
    setValidationError("");
    router.push(`/tx-analyzer/${trimmed}`);
  };

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Page header */}
        <div>
          <h1 style={{ fontSize: "1.5em", fontWeight: 400, margin: "0 0 6px" }}>
            Transaction Analyzer
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
            Search a tx hash across {totalChains}+ chains in parallel.
          </p>
        </div>

        {/* Search bar */}
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
              <SupportedChainsPopup />
              <AbiArchiveLink />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <LoadingSpinner
            message="Searching across chains…"
            subMessage={`Querying ${totalChains} chains in parallel`}
          />
        )}

        {/* Not found */}
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

        {/* Error */}
        {status === "error" && error && (
          <ErrorDisplay kind="rpc" message={error} />
        )}

        {/* Result */}
        {status === "found" && result && (
          <>
            {isWithdrawal && (
              <WithdrawalProcessPanel
                withdrawalStatus={withdrawalStatus}
                timeToProve={timeToProve}
                timeToFinalize={timeToFinalize}
                statusLoading={withdrawalLoading}
                statusError={withdrawalError}
                txOrigin={withdrawalSource ?? undefined}
                onLookupProveTx={withdrawalSource === "initiate" ? async () => {
                  const hash = await proveTx.lookup();
                  if (hash) router.push(`/tx-analyzer/${hash}`);
                  else throw new Error(proveTx.error ?? "Prove transaction not found.");
                } : undefined}
                onLookupInitiateTx={(withdrawalSource === "prove" || withdrawalSource === "finalize") ? async () => {
                  const hash = await initiateTx.lookup();
                  if (hash) router.push(`/tx-analyzer/${hash}`);
                  else throw new Error(initiateTx.error ?? "Initiate transaction not found in the expected L2 block range. Details: Only initiate transactions within the last ~7 days can be found.");
                } : undefined}
                l1Chain={
                  withdrawalSource === "initiate"
                    ? (result?.chain ? getL1Chain(result.chain) ?? null : null)
                    : result?.chain ?? null
                }
                l2Chain={
                  withdrawalSource === "initiate"
                    ? result?.chain ?? null
                    : proveDetect?.l2Chain ?? finalizeDetect?.l2Chain ?? null
                }
              />
            )}

            {isDeposit && (
                <DepositProcessPanel
                  status={deposit.status}
                  l2Hash={deposit.l2Hash}
                  error={deposit.error}
                  l1Chain={result.chain}
                  l2Chain={depositDetect?.l2Chain ?? null}
                  portalAddress={depositDetect?.portalAddress ?? null}
                  mint={deposit.mint}
                  relayDurationSeconds={deposit.relayDurationSeconds}
                />
            )}

            {isReceivedDeposit && (
                <DepositProcessPanel
                  status="received"
                  l2Hash={result.txInfo.hash as `0x${string}`}
                  error={receivedDeposit.error}
                  l1Chain={receivedDepositDetect?.l1Chain ?? null}
                  l2Chain={receivedDepositDetect?.l2Chain ?? null}
                  portalAddress={receivedDeposit.portalAddress}
                  mint={result.txInfo.mint ?? null}
                  relayDurationSeconds={receivedDeposit.relayDurationSeconds}
                  onLookupL1Tx={receivedDeposit.lookup}
                />
            )}

            {isReverted && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(248,81,73,0.08)",
                  border: "1px solid rgba(248,81,73,0.3)",
                }}
              >
                <span style={{ color: "var(--error)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--error)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="8" r="6" />
                    <line x1="8" y1="5.5" x2="8" y2="8.5" />
                    <circle cx="8" cy="10.5" r="0.5" fill="var(--error)" />
                  </svg>
                  Transaction reverted — see the Revert tab for details.
                </span>
              </div>
            )}

            <TxResultTabs
              result={result}
              isReverted={!!isReverted}
              isWithdrawal={isWithdrawal}
              isDeposit={isDeposit}
              isReceivedDeposit={isReceivedDeposit}
              isCrossMessage={isCrossMessage}
              depositMatch={depositDetect}
              depositOpaque={deposit.opaque}
              depositDerivation={deposit.derivation}
              receivedDepositOpaque={receivedDeposit.opaque}
              receivedDepositDerivation={receivedDeposit.derivation}
              withdrawalSource={withdrawalSource}
              withdrawalStatus={withdrawalStatus}
              withdrawalLoading={withdrawalLoading}
              receipt={result.receipt}
              chain={result.chain}
              sim={sim}
            />
          </>
        )}
      </div>
    </main>
  );
}
