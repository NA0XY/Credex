"use client";

import { useRef } from "react";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

const STEPS = [
  {
    number: "01",
    title: "Enter your stack",
    body:
      "Tell us which AI tools your team uses and what you're paying. Takes under 2 minutes - no account needed.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="3" width="7" height="7" rx="1.2" />
        <rect x="14" y="3" width="7" height="7" rx="1.2" />
        <rect x="3" y="14" width="7" height="7" rx="1.2" />
        <rect x="14" y="14" width="7" height="7" rx="1.2" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "We audit the numbers",
    body:
      "Our engine checks seat overlap, plan fit, benchmark spend, and negotiation leverage across your entire stack.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 15a8 8 0 1 1 16 0" />
        <path d="M12 12L18 8" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Get your report",
    body:
      "Receive a Stack Score (A-F), prioritized savings list, and AI-written action plan you can act on this week.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    ),
  },
];

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGsapContext(
    (gsap) => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-step-card]");
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.56,
            delay: index * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 76%",
            },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="method" ref={sectionRef} className="bg-[var(--color-bg-alt)] px-[clamp(1.2rem,4vw,3.2rem)] py-[clamp(5rem,9vw,8.5rem)]">
      <div className="mx-auto max-w-[1440px]">
        <p className="kicker">How it works</p>
        <h2 className="cond-display mt-2 text-[clamp(2rem,4.5vw,3.8rem)] text-brand-text">
          Three steps to clarity
        </h2>

        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[15%] right-[15%] top-8 hidden border-t border-dashed border-brand-border md:block" />

          {STEPS.map((step) => (
            <article key={step.number} data-step-card className="relative rounded-[1.5rem] border border-brand-border bg-brand-surface p-5 shadow-[0_6px_28px_-10px_rgba(26,22,18,0.16)] transition duration-[320ms] [transition-timing-function:var(--ease-enter)] hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface2 px-3 py-1">
                <span className="kicker !text-brand-text">{`Step ${step.number}`}</span>
              </div>
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-brand-bg text-brand-accent">
                {step.icon}
              </div>
              <h3 className="cond-display text-[clamp(1.4rem,2.5vw,2rem)] leading-[1.02] text-brand-text">
                {step.title}
              </h3>
              <p className="serif-body mt-3 text-[clamp(0.9rem,1.5vw,1.1rem)]">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
