export interface DecodingTagConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const DEFAULT_TAG_ID = "abi";

const tags: Record<string, DecodingTagConfig> = {
  "abi": {
    label: "ABI",
    color: "var(--muted)",
    bg: "rgba(139,148,158,0.12)",
    border: "rgba(139,148,158,0.3)",
  },
  "optimism-format": {
    label: "OP Stack",
    color: "#ff0420",
    bg: "rgba(255,4,32,0.12)",
    border: "rgba(255,4,32,0.3)",
  },
};

export function getDecodingTag(id: string): DecodingTagConfig | null {
  return tags[id] ?? null;
}

