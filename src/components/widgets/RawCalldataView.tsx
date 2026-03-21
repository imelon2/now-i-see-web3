import { CopyButton } from "@/components/ui/CopyButton";
import { NoticeDisplay } from "@/components/ui/NoticeDisplay";

interface Props {
  calldata: string;
  /** Render content only without panel wrapper */
  embedded?: boolean;
  abiNotFound?: boolean;
}

function RawContent({ calldata }: { calldata: string }) {
  const hasSelector = calldata.length >= 10;
  return (
    <>
      <code
        style={{
          display: "block",
          wordBreak: "break-all",
          color: "var(--accent)",
          lineHeight: 1.8,
          fontSize: 14,
        }}
      >
        {hasSelector ? (
          <>
            <span style={{ background: "rgba(88,166,255,0.15)", borderRadius: 2 }}>
              {calldata.slice(0, 10)}
            </span>
            {calldata.slice(10)}
          </>
        ) : (
          calldata
        )}
      </code>
    </>
  );
}

export function RawCalldataView({ calldata, embedded = false, abiNotFound = false }: Props) {
  if (embedded) {
    return <RawContent calldata={calldata} />;
  }

  return (
    <div className="panel" style={{ flex: 1 }}>
      <div className="panel-header">
        <span>Raw Calldata</span>
        <CopyButton text={calldata} />
      </div>
      <div className="panel-body">
        {abiNotFound && (
          <div style={{ marginBottom: 10 }}>
            <NoticeDisplay message="ABI not found." />
          </div>
        )}
        <div
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "10px 12px",
          }}
        >
          <RawContent calldata={calldata} />
        </div>
      </div>
    </div>
  );
}
