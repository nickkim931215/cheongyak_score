import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "청약전략진단 — AI 청약 가능성·전략 분석",
  description:
    "내 청약 점수, 특별공급 자격, 지역별 경쟁력을 한 번에 진단하는 AI 의사결정 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="font-sans">
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
