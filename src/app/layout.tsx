import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Now I See Web3",
  description: "온체인 데이터 분석 도구 - 트랜잭션 검색, Calldata/Error 디코더",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
