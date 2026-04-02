import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Press_Start_2P, Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
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
    <html lang="en" className={cn(ibmPlexMono.variable, pressStart2P.variable, "font-sans", geist.variable)}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5304857082541488" />
      </head>
      <body>
        {/* JSON-LD structured data */}
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
