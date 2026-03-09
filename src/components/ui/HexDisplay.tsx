import { truncateHex } from "@/lib/utils/hex";
import { CopyButton } from "./CopyButton";

interface Props {
  hex: string;
  head?: number;
  tail?: number;
}

export function HexDisplay({ hex, head = 10, tail = 8 }: Props) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <code style={{ color: "var(--accent)", wordBreak: "break-all" }}>
        {truncateHex(hex, head, tail)}
      </code>
      <CopyButton text={hex} />
    </span>
  );
}
