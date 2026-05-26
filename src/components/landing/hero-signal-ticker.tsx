"use client";

import { useRef } from "react";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

const SIGNALS = [
  "SEAT OVERLAP DETECTED",
  "PLAN FIT SCORING",
  "BENCHMARK DELTA",
  "NEGOTIATION LEVERAGE",
  "SAVINGS PRIORITY QUEUE",
  "STACK GRADE OUTPUT",
  "AI SPEND AUDIT",
  "2-MINUTE ANALYSIS",
  "FREE REPORT",
  "CREDEX CREDITS",
];

export function HeroSignalTicker() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGsapContext(
    (gsap) => {
      const track = rootRef.current?.querySelector<HTMLElement>("[data-ticker-track]");
      if (!track) {
        return;
      }

      gsap.fromTo(
        rootRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, delay: 1.1, ease: "power3.out" }
      );

      gsap.fromTo(
        track,
        { xPercent: 0 },
        {
          duration: 24,
          delay: 1.1,
          ease: "none",
          repeat: -1,
          xPercent: -50,
        }
      );
    },
    { scope: rootRef }
  );

  const repeated = [...SIGNALS, ...SIGNALS];

  return (
    <div ref={rootRef} className="overflow-hidden border-y border-[var(--color-border-dark)] bg-[var(--color-dark)] py-2.5 opacity-0">
      <div data-ticker-track className="flex w-max min-w-full items-center gap-8 px-6">
        {repeated.map((label, index) => (
          <div key={`${label}-${index}`} className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
            <span className="kicker whitespace-nowrap !text-[0.68rem] !text-brand-surface/80">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
