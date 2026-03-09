"use client";

import Link from "next/link";
import { useTxSearch } from "@/hooks/useTxSearch";
import { TransactionSearch } from "@/components/widgets/TransactionSearch";
import { TxInfoPanel } from "@/components/widgets/TxInfoPanel";
import { DecodedCalldataView } from "@/components/widgets/DecodedCalldataView";
import { RawCalldataView } from "@/components/widgets/RawCalldataView";
import { EventLogView } from "@/components/widgets/EventLogView";

export default function HomePage() {
  const { status, result, error, search } = useTxSearch();

  const loading = status === "searching";
  const hasCalldata =
    result?.txInfo.input &&
    result.txInfo.input !== "0x" &&
    result.txInfo.input.length >= 10;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 네비게이션 */}
      <nav
        style={{
          background: "var(--panel-header)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 14 }}>
          Now I See Web3
        </span>
        <Link
          href="/"
          style={{ color: "var(--foreground)", textDecoration: "none", fontSize: 13 }}
        >
          TX Analyzer
        </Link>
        <Link
          href="/calldata-decoder"
          style={{ color: "var(--muted)", textDecoration: "none", fontSize: 13 }}
        >
          Calldata Decoder
        </Link>
        <Link
          href="/error-decoder"
          style={{ color: "var(--muted)", textDecoration: "none", fontSize: 13 }}
        >
          Error Decoder
        </Link>
      </nav>

      {/* 메인 컨텐츠 */}
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
          {/* 검색 */}
          <TransactionSearch onSearch={search} loading={loading} />

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
              <div style={{ fontSize: 11 }}>
                12개 체인을 동시에 조회하고 있습니다
              </div>
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
              {/* 트랜잭션 기본 정보 */}
              <TxInfoPanel txInfo={result.txInfo} />

              {/* Calldata: 디코딩 + Raw 나란히 */}
              {hasCalldata && (
                <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
                  <DecodedCalldataView
                    calldata={result.txInfo.input}
                    decoded={result.decodedCalldata}
                  />
                  <RawCalldataView calldata={result.txInfo.input} />
                </div>
              )}

              {/* 이벤트 로그 */}
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
