"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

const COVERAGE = [
  {
    group: "Coding",
    tools: "Cursor, Copilot, Windsurf",
    note: "Seat duplication and tier mismatch checks",
  },
  {
    group: "Chat",
    tools: "ChatGPT, Claude, Gemini",
    note: "Role fit and model overlap recommendations",
  },
  {
    group: "API",
    tools: "Anthropic API, OpenAI API, Gemini API",
    note: "Usage-rate and unit-cost drift analysis",
  },
];

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGsapContext(
    (gsap) => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-services-reveal]");
      if (nodes.length > 0) {
        gsap.fromTo(
          nodes,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.52,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative overflow-hidden bg-brand-bg px-6 pb-24 pt-20 text-brand-text"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-16" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(84,161,239,0.14),transparent_68%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div data-services-reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="kicker">Coverage</span>
            <h2 className="cond-display mt-3 text-[clamp(1.8rem,4.3vw,3.3rem)] leading-[1.03]">
              What SpendLens audits today.
            </h2>
          </div>
          <Link
            href="/audit"
            className="inline-flex items-center rounded-full border border-brand-borderStrong bg-brand-surface/55 px-5 py-2.5 text-xs uppercase tracking-[0.1em] text-brand-textSub transition hover:border-brand-accent/55 hover:text-brand-text"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
          >
            Start your own run
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <article data-services-reveal className="panel p-5">
            <span className="kicker">Model confidence factors</span>
            <div className="mt-4 space-y-3">
              {[
                "Current plan delta vs list price",
                "Role-to-seat intensity mismatch",
                "Functional overlap across tool categories",
                "Spend-per-developer benchmark variance",
                "Negotiation leverage signals",
              ].map((item, index) => (
                <div key={item} className="panel-raised flex items-start gap-3 px-4 py-3">
                  <span className="mono-value mt-0.5 text-sm">{`0${index + 1}`}</span>
                  <p className="serif-body text-sm">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <div className="space-y-4">
            {COVERAGE.map((item) => (
              <article key={item.group} data-services-reveal className="panel p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="badge badge-righsize">{item.group}</span>
                  <span className="kicker text-brand-accent">Live ruleset</span>
                </div>
                <h3 className="text-lg text-brand-text">{item.tools}</h3>
                <p className="serif-body mt-2 text-sm">{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
