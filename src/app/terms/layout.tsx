import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for Now I See Web3 — on-chain data analyzer for Web3 developers.",
  alternates: {
    canonical: "https://nowiseeweb3.xyz/terms",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
