interface NoticeDisplayProps {
  message: string;
}

export function NoticeDisplay({ message }: NoticeDisplayProps) {
  return (
    <div
      style={{
        background: "rgba(210,153,34,0.06)",
        border: "1px solid rgba(210,153,34,0.3)",
        borderRadius: 6,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ color: "var(--warning)", fontSize: 13 }}>⚠</span>
      <span style={{ color: "var(--warning)", fontSize: 13 }}>{message}</span>
    </div>
  );
}
