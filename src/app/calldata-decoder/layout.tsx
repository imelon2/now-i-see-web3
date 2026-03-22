import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calldata Decoder",
  description:
    "Decode Ethereum calldata hex into human-readable function names, signatures, and parameters. Supports all EVM-compatible chains.",
  openGraph: {
    title: "Calldata Decoder | Now I See Web3",
    description:
      "Decode Ethereum calldata hex into human-readable function names, signatures, and parameters.",
    url: "https://nowiseeweb3.xyz/calldata-decoder",
  },
};

export default function CalldataDecoderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
