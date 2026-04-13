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

export default async function TxHashLayout({
  params,
  children,
}: {
  params: Promise<{ txHash: string }>;
  children: React.ReactNode;
}) {
  const { txHash } = await params;
  const short = txHash.length > 16 ? `${txHash.slice(0, 10)}...${txHash.slice(-6)}` : txHash;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://nowiseeweb3.xyz/tx-analyzer/${txHash}#webpage`,
    name: `TX ${short} | Now I See Web3`,
    url: `https://nowiseeweb3.xyz/tx-analyzer/${txHash}`,
    description: `Inspect transaction ${txHash} across multiple EVM chains.`,
    isPartOf: { "@id": "https://nowiseeweb3.xyz/#website" },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://nowiseeweb3.xyz" },
        { "@type": "ListItem", position: 2, name: "Transaction Analyzer", item: "https://nowiseeweb3.xyz/tx-analyzer" },
        { "@type": "ListItem", position: 3, name: `TX ${short}`, item: `https://nowiseeweb3.xyz/tx-analyzer/${txHash}` },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\//g, "<\\/") }}
      />
      {children}
    </>
  );
}
