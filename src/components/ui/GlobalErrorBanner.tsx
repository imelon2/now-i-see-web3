"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useGlobalError } from "@/context/GlobalErrorContext";
import { parseErrorMessage } from "@/lib/parseErrorMessage";
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert-1";

const AUTO_DISMISS_MS = 60_000;

export function GlobalErrorBanner() {
  const { error, clearError } = useGlobalError();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!error) return;

    // New error arrived
    if (error.id !== prevIdRef.current) {
      prevIdRef.current = error.id;
      setLeaving(false);
      setVisible(true);

      // Clear previous timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // Auto-dismiss
      timerRef.current = setTimeout(() => {
        dismiss();
      }, AUTO_DISMISS_MS);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const dismiss = () => {
    setLeaving(true);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setVisible(false);
      setLeaving(false);
      clearError();
    }, 300); // match slide-up animation duration
  };

  if (!visible || !error) return null;

  const parsed = parseErrorMessage(error.message);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "12px 16px",
        pointerEvents: "none",
        animation: leaving ? "errorSlideUp 0.3s ease-in forwards" : "errorSlideDown 0.35s ease-out forwards",
      }}
    >
      <div
        style={{
          maxWidth: "48rem",
          marginLeft: "auto",
          marginRight: "auto",
          pointerEvents: "auto",
        }}
      >
        <Alert
          variant="destructive"
          appearance="light"
          size="sm"
          close
          onClose={dismiss}
          className="shadow-lg"
          style={{
            background: "color-mix(in srgb, var(--error) 8%, var(--background))",
            borderColor: "color-mix(in srgb, var(--error) 25%, transparent)",
            backdropFilter: "blur(12px)",
          }}
        >
          <AlertIcon>
            <AlertTriangle />
          </AlertIcon>
          <AlertContent>
            <AlertTitle style={{ color: "var(--error)", fontWeight: 600, fontSize: 13 }}>
              {parsed.title}
            </AlertTitle>
            {parsed.details && (
              <AlertDescription>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    lineHeight: 1.6,
                    color: "var(--muted)",
                    marginTop: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    maxHeight: 120,
                    overflowY: "auto",
                    scrollbarWidth: "none",
                  }}
                >
                  {parsed.details.map((d, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                      <span style={{ color: "var(--text-secondary)", flexShrink: 0, fontWeight: 500 }}>
                        {d.key}:
                      </span>
                      <span style={{ wordBreak: "break-all" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            )}
          </AlertContent>
        </Alert>
      </div>
    </div>
  );
}
