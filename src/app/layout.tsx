import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SpendLens | AI Spend Audit",
  description:
    "Free AI spend audit for startup teams. Identify duplicate tooling, rightsize plans, and uncover savings opportunities in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen bg-brand-bg font-sans text-brand-text antialiased">{children}</body>
    </html>
  );
}

