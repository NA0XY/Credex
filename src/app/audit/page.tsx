import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { AuditWizard } from "@/components/audit/audit-wizard";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Audit your AI spend | SpendLens",
  description: "Declare your AI tools and get an instant, rule-based spend audit with savings recommendations.",
};

export default function AuditPage() {
  return (
    <div className="bg-brand-stage relative min-h-screen">
      <div className="pointer-events-none fixed inset-0">
        <Image
          src="/assets/editorial/bg-haze-plate.svg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover opacity-35"
        />
      </div>
      <div className="pointer-events-none fixed inset-0">
        <Image
          src="/assets/editorial/grain-overlay.svg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover opacity-30 mix-blend-multiply"
        />
      </div>
      <div className="bg-contour bg-vignette pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/35 to-transparent" />

      <div className="relative z-20 px-4 pt-4 sm:px-6">
        <SiteHeader
          links={[
            { href: "/", label: "Landing" },
            { href: "/results/demo", label: "Demo report" },
          ]}
          rightSlot={
            <Link
              href="/"
              className="pill-action pill-action-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/45"
            >
              Back home
            </Link>
          }
        />
      </div>

      <div className="relative z-10 pb-10">
        <AuditWizard />
      </div>
    </div>
  );
}
