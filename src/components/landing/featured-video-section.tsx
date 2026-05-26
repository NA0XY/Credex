"use client";

import Link from "next/link";
import { useRef } from "react";
import { StackScoreDisplay } from "@/components/results/stack-score-display";
import type { StackScore } from "@/lib/stack-score";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

const DEMO_SCORE: StackScore = {
  total: 58,
  grade: "C",
  breakdown: {
    redundancy: 12,
    planFit: 15,
    seatEfficiency: 17,
    costPerDeveloper: 14,
  },
  headline: "Copilot + ChatGPT Plus + Notion AI driving duplicated spend",
  strengths: ["Plans mostly active", "Seats close to team size"],
  weaknesses: ["Overlap across coding assistants", "Cost per developer above median"],
};

export function FeaturedVideoSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGsapContext(
    (gsap) => {
      gsap.fromTo(
        "[data-preview-reveal]",
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.56,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
          },
        }
      );
      gsap.fromTo(
        "[data-preview-card]",
        { autoAlpha: 0, scale: 0.94 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 76%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section id="results-preview" ref={sectionRef} className="relative overflow-hidden bg-[var(--color-dark)] px-[clamp(1.2rem,4vw,3.2rem)] py-[clamp(5rem,9vw,8.5rem)]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(95,122,97,0.14)] blur-3xl" />
      <div className="relative mx-auto grid max-w-[1440px] items-center gap-8 lg:grid-cols-12">
        <div data-preview-reveal className="lg:col-span-5">
          <p className="kicker !text-brand-surface/70">What you&apos;ll receive</p>
          <h2 className="cond-display mt-2 text-[clamp(2rem,4.5vw,3.8rem)] leading-[0.94] text-brand-surface">
            Your audit report, in full detail
          </h2>
          <p className="serif-body mt-4 max-w-[40ch] text-brand-surface/75">
            SpendLens returns a defensible stack score, recommendation-by-recommendation savings impact,
            and the benchmark context your team needs to make procurement decisions quickly.
          </p>
          <Link
            href="/results/demo"
            className="mt-6 inline-flex items-center rounded-full border border-brand-surface/40 px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.14em] text-brand-surface transition duration-[160ms] [transition-timing-function:var(--ease-enter)] hover:scale-[1.03] hover:bg-brand-surface/10"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Open sample report
          </Link>
        </div>

        <div className="lg:col-span-7">
          <div
            data-preview-card
            className="rounded-[2rem] border border-brand-surface/20 bg-[rgba(38,50,40,0.65)] p-4 shadow-[0_24px_48px_-18px_rgba(26,22,18,0.28)] transition duration-[320ms] [transition-timing-function:var(--ease-enter)] hover:-translate-y-1.5 hover:rotate-0"
            style={{ transform: "rotate(2deg)" }}
          >
            <div className="overflow-hidden rounded-[1.4rem] border border-brand-surface/20 bg-brand-bg">
              <StackScoreDisplay score={DEMO_SCORE} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
