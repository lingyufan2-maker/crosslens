import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrossLens",
  description: "A cross-disciplinary question box for escaping filter bubbles."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
