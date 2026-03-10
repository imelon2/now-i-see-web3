"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NavBar } from "@/components/ui/NavBar";
import { TxInfoPanel } from "@/components/widgets/TxInfoPanel";
import { DecodedCalldataView } from "@/components/widgets/DecodedCalldataView";
import { RawCalldataView } from "@/components/widgets/RawCalldataView";
import { EventLogView } from "@/components/widgets/EventLogView";
import { useTxSearch } from "@/hooks/useTxSearch";
import { isValidHex } from "@/lib/utils/hex";

function TxAnalyzerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hashFromUrl = searchParams.get("hash") ?? "";

  const { status, result, error, search } = useTxSearch();
  const [inputHash, setInputHash] = useState(hashFromUrl);
  const [validationError, setValidationError] = useState("");

  const loading = status === "searching";

  // URL의 hash 파라미터가 바뀌면 자동 검색
  useEffect(() => {
    if (hashFromUrl && isValidHex(hashFromUrl) && hashFromUrl.length === 66) {
      search(hashFromUrl);
    }
  }, [hashFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const trimmed = inputHash.trim();
    if (!trimmed) {
      setValidationError("트랜잭션 해시를 입력하세요.");
      return;
    }
    if (!isValidHex(trimmed) || trimmed.length !== 66) {
      setValidationError(
        "유효하지 않은 해시입니다. 0x로 시작하는 66자리 hex를 입력하세요."
      );
      return;
    }
    setValidationError("");
    // URL에 hash를 남기고 페이지 이동
    router.push(`/tx-analyzer?hash=${trimmed}`);
  };

  const hasCalldata =
    result?.txInfo.input &&
    result.txInfo.input !== "0x" &&
    result.txInfo.input.length >= 10;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar />

      <main
        style={{
          flex: 1,
          padding: 20,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 검색 바 */}
          <div className="panel">
            <div className="panel-header">
              <span>Transaction Search</span>
            </div>
            <div className="panel-body">
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="트랜잭션 해시를 입력하세요 (0x...)"
                  value={inputHash}
                  onChange={(e) => {
                    setInputHash(e.target.value);
                    setValidationError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSearch()}
                  disabled={loading}
                  style={{ flex: 1 }}
                  autoFocus={!hashFromUrl}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  style={{
                    background: "var(--accent)",
                    color: "#000",
                    border: "none",
                    fontWeight: 600,
                    minWidth: 80,
                  }}
                >
                  {loading ? "검색 중…" : "검색"}
                </button>
              </div>
              {validationError && (
                <p style={{ color: "var(--error)", fontSize: 12, marginTop: 6 }}>
                  {validationError}
                </p>
              )}
            </div>
          </div>

          {/* 로딩 */}
          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              <div style={{ marginBottom: 8 }}>⏳ 멀티체인 병렬 검색 중…</div>
              <div style={{ fontSize: 11 }}>12개 체인을 동시에 조회하고 있습니다</div>
            </div>
          )}

          {/* 결과 없음 */}
          {status === "not-found" && (
            <div className="panel" style={{ textAlign: "center", padding: 40 }}>
              <p style={{ color: "var(--warning)", marginBottom: 8 }}>
                트랜잭션을 찾을 수 없습니다
              </p>
              <p style={{ color: "var(--muted)", fontSize: 12 }}>
                지원하는 모든 체인에서 해당 트랜잭션을 찾지 못했습니다.
              </p>
            </div>
          )}

          {/* 에러 */}
          {status === "error" && error && (
            <div
              className="panel"
              style={{ borderColor: "var(--error)", padding: 16 }}
            >
              <p style={{ color: "var(--error)", fontSize: 13 }}>✗ {error}</p>
            </div>
          )}

          {/* 결과 */}
          {status === "found" && result && (
            <>
              <TxInfoPanel txInfo={result.txInfo} />

              {hasCalldata && (
                <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
                  <DecodedCalldataView
                    calldata={result.txInfo.input}
                    decoded={result.decodedCalldata}
                  />
                  <RawCalldataView calldata={result.txInfo.input} />
                </div>
              )}

              <EventLogView
                rawLogs={result.rawLogs}
                decodedEvents={result.decodedEvents}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// useSearchParams는 Suspense 경계 안에서 사용해야 함
export default function TxAnalyzerPage() {
  return (
    <Suspense>
      <TxAnalyzerContent />
    </Suspense>
  );
}
