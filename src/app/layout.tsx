import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Credex SpendLens | AI Spend Intelligence",
  description:
    "Free AI spend audit for startup teams. Find savings in minutes - no account required.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-bg font-sans text-brand-text antialiased">
        {children}
      </body>
    </html>
  );
}
