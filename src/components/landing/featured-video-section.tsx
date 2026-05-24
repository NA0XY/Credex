"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

const DEMO_RESULTS = [
  { tool: "ChatGPT Team", type: "Downgrade", saving: "$50/mo", reason: "Team controls unused by current workflows" },
  { tool: "Copilot Business", type: "Switch", saving: "$38/mo", reason: "Role overlap with existing Cursor seats" },
  { tool: "Claude Max", type: "Rightsize", saving: "$29/mo", reason: "Low-volume users can shift to lower tier" },
];

export function FeaturedVideoSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGsapContext(
    (gsap) => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-workflow-reveal]");
      if (nodes.length > 0) {
        gsap.fromTo(
          nodes,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.09,
            duration: 0.52,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 72%",
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="workflow"
      ref={sectionRef}
      className="relative overflow-hidden border-b border-brand-border bg-brand-bg px-6 py-24 text-brand-text"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,138,61,0.08),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />

      <div className="relative mx-auto max-w-7xl">
        <div data-workflow-reveal className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="kicker">Report preview</span>
            <h2 className="cond-display mt-3 text-[clamp(1.9rem,4.2vw,3.3rem)] leading-[1.03]">
              A procurement-ready output, not a generic summary page.
            </h2>
          </div>
          <p className="serif-body max-w-md text-sm">
            Every recommendation includes monthly impact, confidence, and rationale so teams can move
            from insight to execution in one pass.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <article data-workflow-reveal className="panel p-5 md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-4">
              <div className="flex items-center gap-3">
                <span className="badge badge-grade-b">Stack grade B</span>
                <span className="kicker">4 tools / 5 seats</span>
              </div>
              <span className="mono-value text-sm font-semibold">$117/mo savings identified</span>
            </div>

            <div className="space-y-3">
              {DEMO_RESULTS.map((item) => (
                <div key={item.tool} className="panel-raised px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="kicker text-brand-accent">{item.type}</span>
                      <h3 className="mt-1 text-base text-brand-text">{item.tool}</h3>
                      <p className="serif-body mt-1 text-sm">{item.reason}</p>
                    </div>
                    <span className="mono-value text-lg font-semibold">{item.saving}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/results/demo"
                className="inline-flex items-center rounded-full border border-brand-borderStrong bg-brand-surface2/60 px-5 py-2.5 text-xs uppercase tracking-[0.1em] text-brand-text transition hover:border-brand-accent/55 hover:text-brand-accent"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
              >
                Open full report
              </Link>
              <Link
                href="/audit"
                className="inline-flex items-center rounded-full border border-brand-accent bg-brand-accent/12 px-5 py-2.5 text-xs uppercase tracking-[0.1em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-bg"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
              >
                Run my inputs
              </Link>
            </div>
          </article>

          <aside data-workflow-reveal className="panel p-5">
            <span className="kicker">Audit signal chain</span>
            <div className="mt-4 space-y-3">
              {[
                "Seat-to-plan mapping",
                "Role-fit validation",
                "Cross-tool overlap graph",
                "Benchmark variance check",
                "Recommendation confidence",
              ].map((signal, index) => (
                <div key={signal} className="flex items-center gap-3 border-b border-brand-border/70 pb-3 last:border-b-0 last:pb-0">
                  <span className="mono-value text-sm">{`0${index + 1}`}</span>
                  <p className="serif-body text-sm">{signal}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
