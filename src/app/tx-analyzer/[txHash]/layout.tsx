import type { Metadata } from "next";

type Props = {
  params: Promise<{ txHash: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { txHash } = await params;
  const short = txHash.length > 16 ? `${txHash.slice(0, 10)}...${txHash.slice(-6)}` : txHash;

  const title = `TX ${short}`;
  const description = `Inspect transaction ${txHash} across multiple EVM chains. View decoded calldata, event logs, and full transaction details.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Now I See Web3`,
      description,
      url: `https://nowiseeweb3.xyz/tx-analyzer/${txHash}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${title} | Now I See Web3`,
      description,
    },
    alternates: {
      canonical: `https://nowiseeweb3.xyz/tx-analyzer/${txHash}`,
    },
  };
}

export default function TxHashLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
