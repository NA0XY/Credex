import Link from "next/link";
import type { Metadata } from "next";
import { AuditWizard } from "@/components/audit/audit-wizard";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Audit your AI spend | SpendLens",
  description: "Declare your AI tools and get an instant, rule-based spend audit with savings recommendations.",
};

export default function AuditPage() {
  return (
    <div className="bg-brand-stage relative min-h-screen bg-brand-bg">
      <div className="bg-contour bg-vignette pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent" />

      <SiteHeader
        links={[
          { href: "/", label: "Landing" },
          { href: "/results/demo", label: "Demo report" },
        ]}
        rightSlot={
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-brand-borderStrong bg-brand-surface/45 px-5 py-2 text-xs uppercase tracking-[0.1em] text-brand-textSub transition hover:border-brand-accent/55 hover:text-brand-text"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
          >
            Back home
          </Link>
        }
      />

      <div className="relative z-10">
        <AuditWizard />
      </div>
    </div>
  );
}
