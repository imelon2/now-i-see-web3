import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Now I See Web3",
  description: "On-chain data analyzer — Transaction search, Calldata/Error decoder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${jetbrainsMono.variable}`}>
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
