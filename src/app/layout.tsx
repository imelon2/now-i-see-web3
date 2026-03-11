import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

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
    <html lang="ko" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body>
        <div style={{ display: "flex", height: "100vh" }}>
          <NavBar />
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ maxWidth: "64rem", margin: "0 auto" }}>
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
