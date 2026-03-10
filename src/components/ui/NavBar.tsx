"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/tx-analyzer",
    label: "Transaction Analyzer",
    icon: (
      // Search / magnifying glass
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6.5" cy="6.5" r="4.5" />
        <line x1="10.5" y1="10.5" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    href: "/calldata-decoder",
    label: "Calldata Decoder",
    icon: (
      // Code brackets
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5,4 1,8 5,12" />
        <polyline points="11,4 15,8 11,12" />
      </svg>
    ),
  },
  {
    href: "/error-decoder",
    label: "Error Decoder",
    icon: (
      // Warning triangle
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2L14.5 13H1.5L8 2Z" />
        <line x1="8" y1="7" x2="8" y2="9.5" />
        <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: 220,
        flexShrink: 0,
        background: "var(--panel-header)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
      }}
    >
      {/* Brand */}
      <div style={{ padding: "0 16px", marginBottom: 32 }}>
        <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 16 }}>
          Now I See Web3
        </span>
      </div>

      {/* Navigation */}
      {LINKS.map(({ href, label, icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              paddingLeft: 14,
              borderLeft: isActive
                ? "2px solid var(--accent)"
                : "2px solid transparent",
              background: isActive
                ? "rgba(88,166,255,0.07)"
                : "transparent",
              color: isActive ? "var(--foreground)" : "var(--muted)",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {icon}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
