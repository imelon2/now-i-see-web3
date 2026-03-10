import { CopyButton } from "@/components/ui/CopyButton";

interface Props {
  calldata: string;
  /** Render content only without panel wrapper */
  embedded?: boolean;
}

function RawContent({ calldata }: { calldata: string }) {
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
        <span style={{ background: "rgba(88,166,255,0.15)", borderRadius: 2 }}>
          {calldata.slice(0, 10)}
        </span>
        {calldata.slice(10)}
      </code>
    </>
  );
}

export function RawCalldataView({ calldata, embedded = false }: Props) {
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
        <code
          style={{
            display: "block",
            wordBreak: "break-all",
            color: "var(--accent)",
            lineHeight: 1.8,
            fontSize: 14,
          }}
        >
          <span style={{ background: "rgba(88,166,255,0.15)", borderRadius: 2 }}>
            {calldata.slice(0, 10)}
          </span>
          {calldata.slice(10)}
        </code>
      </div>
    </div>
  );
}
