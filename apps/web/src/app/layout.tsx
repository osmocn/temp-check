import type { Metadata } from "next";
import "./globals.css";
import { inter } from "@/lib/fonts";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = siteConfig.metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-canvas dark antialiased">
      <body className="min-h-full font-sans text-ink" style={inter.style} >{children}</body>
    </html>
  );
}
