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
        track,
        { xPercent: 0 },
        {
          duration: 24,
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
    <div ref={rootRef} className="liquid-glass overflow-hidden rounded-full border border-brand-border bg-brand-surface/45 px-0 py-2.5">
      <div data-ticker-track className="flex w-max min-w-full items-center gap-8 px-4">
        {repeated.map((label, index) => (
          <div key={`${label}-${index}`} className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
            <span className="kicker whitespace-nowrap text-brand-textSub">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
