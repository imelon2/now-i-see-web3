import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error Decoder",
  description:
    "Decode Solidity revert data into human-readable error messages. Supports Error(string), Panic(uint256), and custom errors.",
  openGraph: {
    title: "Error Decoder | Now I See Web3",
    description:
      "Decode Solidity revert data into human-readable error messages. Supports Error(string), Panic(uint256), and custom errors.",
    url: "https://nowiseeweb3.xyz/error-decoder",
  },
};

export default function ErrorDecoderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
