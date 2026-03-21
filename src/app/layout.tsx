import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-pixel" });

export const metadata: Metadata = {
  title: "Now I See Web3",
  description: "On-chain data analyzer — Transaction search, Calldata/Error decoder",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${ibmPlexMono.variable} ${pressStart2P.variable}`}>
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
