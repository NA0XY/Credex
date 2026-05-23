import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Credex | AI Spend Intelligence",
  description:
    "SpendLens by Credex helps startup teams detect AI spend leakage and execute high-confidence savings actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black font-sans text-white antialiased">{children}</body>
    </html>
  );
}
