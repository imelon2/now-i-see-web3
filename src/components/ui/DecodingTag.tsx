import { getDecodingTag } from "@/lib/decodingTags";

interface Props {
  tagId: string;
}

export function DecodingTag({ tagId }: Props) {
  const config = getDecodingTag(tagId);
  if (!config) return null;

  return (
    <span
      style={{
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 0,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  );
}
