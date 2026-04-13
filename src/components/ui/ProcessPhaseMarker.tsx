"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

export interface PhaseState {
  done: boolean;
  active: boolean;
  color: string;
}

export interface ProcessPhaseMarkerProps {
  label: string;
  subLabel?: string;
  state: PhaseState;
  /** Icon rendered when the phase is NOT done. */
  icon: ReactNode;
  /** Icon rendered when the phase IS done. Defaults to a check mark. */
  doneIcon?: ReactNode;
  /** When provided + state.done, the marker becomes clickable and shows "→ View tx". */
  href?: string;
  /** Async click handler — takes precedence over href. Shows loading state while running. */
  onClickNavigate?: () => Promise<void>;
  /** Called when onClickNavigate throws, so the parent can display the error. */
  onError?: (message: string) => void;
  /** Minimum width of the marker column. */
  minWidth?: number;
}

/**
 * Shared phase marker used by both DepositProcessPanel and
 * WithdrawalProcessPanel. Renders:
 *   - Circle indicator (done/active/pending)
 *   - Phase label
 *   - Optional sub-label (e.g., chain name)
 *   - Optional "→ View tx" link when clickable
 */
export function ProcessPhaseMarker({
  label,
  subLabel,
  state,
  icon,
  doneIcon,
  href,
  onClickNavigate,
  onError,
  minWidth = 80,
}: ProcessPhaseMarkerProps) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const hasAction = !!(onClickNavigate || href) && state.done;
  const clickable = hasAction && !navigating;

  const handleClick = async () => {
    if (onClickNavigate) {
      setNavigating(true);
      setLookupError(null);
      try {
        await onClickNavigate();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Lookup failed.";
        setLookupError(msg);
        onError?.(msg);
      } finally {
        setNavigating(false);
      }
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        minWidth,
      }}
    >
      <div
        onClick={clickable ? handleClick : undefined}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `2px solid ${state.color}`,
          background: state.done ? state.color : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: state.done || state.active ? 1 : 0.4,
          // @ts-expect-error CSS custom property for keyframe
          "--phase-color": state.color,
          animation: hasAction && !navigating ? "phase-glow 2s ease-in-out infinite" : "none",
          boxShadow: hasAction && !navigating
            ? undefined
            : state.active
              ? `0 0 0 4px color-mix(in srgb, ${state.color} 15%, transparent)`
              : "none",
          transition: "all 0.3s ease",
          cursor: hasAction ? "pointer" : undefined,
        }}
        role={hasAction ? "button" : undefined}
        tabIndex={hasAction ? 0 : undefined}
        aria-label={hasAction ? `View ${label} transaction` : undefined}
      >
        {navigating ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#ffffff" strokeWidth="1.6" style={{ animation: "spin 1s linear infinite" }}>
            <circle cx="8" cy="8" r="6" strokeDasharray="28" strokeDashoffset="8" />
          </svg>
        ) : state.done ? (doneIcon ?? <CheckIcon color="#ffffff" />) : icon}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: state.active ? 600 : 400,
          color: state.color,
          opacity: state.done || state.active ? 1 : 0.4,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {subLabel && (
        <span
          style={{
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: "var(--foreground)",
            fontWeight: 500,
            whiteSpace: "nowrap",
            maxWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={subLabel}
        >
          {subLabel}
        </span>
      )}
      <span
        onClick={hasAction ? handleClick : undefined}
        style={{
          fontSize: 11,
          minWidth: 100,
          textAlign: "center",
          color: navigating ? "var(--accent)" : "var(--muted)",
          animation: navigating ? "pulse-dim 1.5s ease-in-out infinite" : "none",
          cursor: hasAction ? (navigating ? "wait" : "pointer") : undefined,
          visibility: hasAction ? "visible" : "hidden",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => {
          if (hasAction && !navigating) e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          if (hasAction && !navigating) e.currentTarget.style.color = "var(--muted)";
        }}
      >
        {navigating ? "Searching…" : lookupError ? "Retry" : "→ View Transaction"}
      </span>
    </div>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 8 6.5 11.5 13 5" />
    </svg>
  );
}
