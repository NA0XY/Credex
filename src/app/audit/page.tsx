import { Logo } from "@/components/logo";
import { AuditWizard } from "@/components/audit/audit-wizard";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Audit your AI spend | SpendLens",
  description: "Enter your AI tools and plans to get an instant spend audit with savings recommendations.",
};

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-brand-bg bg-grid">
      {/* Radial glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-accent/4 rounded-full blur-[100px]" />

      <nav className="relative z-10 border-b border-brand-border bg-brand-bg/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <Link href="/results/demo" className="text-xs text-brand-muted underline underline-offset-2 hover:text-brand-text transition-colors">
            See sample report
          </Link>
        </div>
      </nav>

      <div className="relative z-10">
        <AuditWizard />
      </div>
    </div>
  );
}
