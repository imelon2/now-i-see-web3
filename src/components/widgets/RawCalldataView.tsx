import { CopyButton } from "@/components/ui/CopyButton";

interface Props {
  calldata: string;
}

export function RawCalldataView({ calldata }: Props) {
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
            fontSize: 12,
          }}
        >
          {/* 4바이트 selector 강조 */}
          <span style={{ background: "rgba(88,166,255,0.15)", borderRadius: 2 }}>
            {calldata.slice(0, 10)}
          </span>
          {calldata.slice(10)}
        </code>
      </div>
    </div>
  );
}
