"use client";

import { useState, useCallback } from "react";
import type { Log } from "viem";
import { supportedChains } from "@/lib/chains/chainList";
import { createClient } from "@/lib/utils/viemClient";
import { multiRace } from "@/lib/utils/multiRace";
import { decodeCalldata, decodeLog } from "@/lib/utils/decoder";
import { isValidHex } from "@/lib/utils/hex";
import type { TxInfo, DecodedCalldata, DecodedEvent } from "@/types";

export interface SearchResult {
  txInfo: TxInfo;
  decodedCalldata: DecodedCalldata | null;
  rawLogs: Log[];
  decodedEvents: (DecodedEvent | null)[];
}

export type SearchStatus = "idle" | "searching" | "found" | "not-found" | "error";

export function useTxSearch() {
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (hash: string) => {
    const trimmed = hash.trim();

    if (!isValidHex(trimmed) || trimmed.length !== 66) {
      setError("유효하지 않은 트랜잭션 해시입니다. 0x로 시작하는 66자리 hex를 입력하세요.");
      setStatus("error");
      return;
    }

    setStatus("searching");
    setResult(null);
    setError(null);

    try {
      const txHash = trimmed as `0x${string}`;

      // supportedChains 전체를 병렬 조회
      const promises = supportedChains.map((chain) => {
        const client = createClient(chain);
        return client
          .getTransaction({ hash: txHash })
          .then((tx) => ({ result: tx, client }))
          .catch(() => ({ result: null, client }));
      });

      const found = await multiRace(promises);

      if (!found) {
        setStatus("not-found");
        return;
      }

      const { result: tx, client } = found;
      const chainName = client.chain?.name ?? "Unknown Chain";

      // Receipt 조회 (실패해도 계속 진행)
      let receipt = null;
      try {
        receipt = await client.getTransactionReceipt({ hash: txHash });
      } catch {
        // pending 트랜잭션이거나 RPC 미지원인 경우 무시
      }

      const txInfo: TxInfo = {
        hash: tx.hash,
        from: tx.from,
        to: tx.to ?? null,
        value: tx.value,
        nonce: tx.nonce,
        blockNumber: tx.blockNumber,
        status: receipt?.status ?? "pending",
        input: tx.input,
        chainName,
      };

      // calldata 디코딩 (input이 있을 때만)
      let decodedCalldata: DecodedCalldata | null = null;
      if (tx.input && tx.input !== "0x" && tx.input.length >= 10) {
        decodedCalldata = await decodeCalldata(tx.input);
      }

      // 이벤트 로그 디코딩
      const rawLogs: Log[] = receipt?.logs ?? [];
      const decodedEvents = await Promise.all(
        rawLogs.map((log) => decodeLog(log))
      );

      setResult({ txInfo, decodedCalldata, rawLogs, decodedEvents });
      setStatus("found");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, search, reset };
}
