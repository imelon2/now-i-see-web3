import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Press_Start_2P } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });
const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-pixel", display: "swap" });

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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Now I See Web3 — On-chain data analyzer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Now I See Web3",
    description:
      "On-chain data analyzer for Web3 developers — decode calldata, inspect transactions, and debug Solidity errors.",
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.svg" },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Now I See Web3",
  url: "https://nowiseeweb3.xyz",
  description:
    "On-chain data analyzer for Web3 developers — decode calldata, inspect transactions, and debug Solidity errors.",
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
        <meta name="google-adsense-account" content="ca-pub-5304857082541488" />
      </head>
      <body>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite).replace(/<\//g, "<\\/") }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\//g, "<\\/") }}
        />
        {/* Google AdSense */}
        <Script
          id="adsense"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5304857082541488"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
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
