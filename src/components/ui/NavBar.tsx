"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "TX Analyzer" },
  { href: "/calldata-decoder", label: "Calldata Decoder" },
  { href: "/error-decoder", label: "Error Decoder" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: "var(--panel-header)",
        borderBottom: "1px solid var(--border)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 14 }}>
        Now I See Web3
      </span>
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          style={{
            color: pathname === href ? "var(--foreground)" : "var(--muted)",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: pathname === href ? 600 : 400,
            borderBottom:
              pathname === href ? "2px solid var(--accent)" : "2px solid transparent",
            paddingBottom: 2,
          }}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
