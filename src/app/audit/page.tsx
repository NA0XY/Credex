import Link from "next/link";
import type { Metadata } from "next";
import { AuditWizard } from "@/components/audit/audit-wizard";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Audit your AI spend | Credex",
  description: "Enter your AI tools and plans to get an instant spend audit with savings recommendations.",
};

export default function AuditPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black bg-grid text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_8%,rgba(142,197,255,0.16),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/82" />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_10%_20%,rgba(142,197,255,0.12),transparent_32%),radial-gradient(circle_at_88%_16%,rgba(194,166,255,0.1),transparent_30%)]" />

      <nav className="relative z-20 px-6 py-6">
        <div className="liquid-glass frame-edge mx-auto flex w-full max-w-5xl items-center justify-between rounded-full px-6 py-3">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="hidden items-center gap-6 md:flex">
              <Link href="/" className="text-sm text-white/80 transition-colors hover:text-white">
                Landing
              </Link>
              <Link href="/results/demo" className="text-sm text-white/80 transition-colors hover:text-white">
                Demo report
              </Link>
            </div>
          </div>
          <Link href="/" className="liquid-glass rounded-full px-5 py-2 text-sm font-medium text-white">
            Back home
          </Link>
        </div>
      </nav>

      <div className="relative z-10">
        <AuditWizard />
      </div>
    </div>
  );
}
