import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-pixel" });

export const metadata: Metadata = {
  title: {
    default: "Now I See Web3",
    template: "%s | Now I See Web3",
  },
  description:
    "On-chain data analyzer for Web3 developers — decode calldata, inspect transactions, and debug Solidity errors.",
  keywords: [
    "calldata decoder",
    "ethereum transaction analyzer",
    "solidity error decoder",
    "web3 developer tools",
    "on-chain data",
    "evm calldata",
    "smart contract debugger",
  ],
  authors: [{ name: "choi.eth", url: "https://github.com/imelon2" }],
  metadataBase: new URL("https://nowiseeweb3.xyz"),
  openGraph: {
    type: "website",
    url: "https://nowiseeweb3.xyz",
    title: "Now I See Web3",
    description:
      "On-chain data analyzer for Web3 developers — decode calldata, inspect transactions, and debug Solidity errors.",
    siteName: "Now I See Web3",
  },
  twitter: {
    card: "summary",
    title: "Now I See Web3",
    description:
      "On-chain data analyzer for Web3 developers — decode calldata, inspect transactions, and debug Solidity errors.",
  },
  icons: { icon: "/favicon.svg" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Now I See Web3",
  url: "https://nowiseeweb3.xyz",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "On-chain data analyzer for Web3 developers — decode calldata, inspect transactions, and debug Solidity errors.",
  author: {
    "@type": "Person",
    name: "choi.eth",
    url: "https://github.com/imelon2",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable} ${pressStart2P.variable}`}>
      <head>
        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-5304857082541488" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5304857082541488"
          crossOrigin="anonymous"
        />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\//g, "<\\/") }}
        />
      </head>
      <body>
        <div className="layout-root">
          <NavBar />
          <div className="layout-content">
            <div className="layout-content-inner">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
