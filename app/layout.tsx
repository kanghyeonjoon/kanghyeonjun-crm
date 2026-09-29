import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "강현준 CRM",
  description: "병원 영업과 제안서 업무를 한 곳에서.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
