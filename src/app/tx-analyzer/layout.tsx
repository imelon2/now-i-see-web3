import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transaction Analyzer",
  description:
    "Inspect Ethereum transactions across multiple chains. View decoded calldata, event logs, and full transaction details in one place.",
  openGraph: {
    title: "Transaction Analyzer | Now I See Web3",
    description:
      "Inspect Ethereum transactions across multiple chains. View decoded calldata, event logs, and full transaction details.",
    url: "https://nowiseeweb3.xyz/tx-analyzer",
  },
};

export default function TxAnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
