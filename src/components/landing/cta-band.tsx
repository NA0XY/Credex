"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

export function CtaBand() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGsapContext(
    (gsap) => {
      gsap.fromTo(
        "[data-cta-reveal]",
        { autoAlpha: 0, y: 22 },
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
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[var(--color-dark)] px-[clamp(1.2rem,4vw,3.2rem)] py-[clamp(5rem,9vw,8.5rem)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(95,122,97,0.1),transparent_60%)]" />
      <div className="relative mx-auto max-w-[920px] text-center">
        <p data-cta-reveal className="kicker !text-brand-surface/72">
          FREE - NO CREDIT CARD - 2 MINUTES
        </p>
        <h2 data-cta-reveal className="cond-display mt-2 text-[clamp(2rem,4.5vw,3.8rem)] text-brand-surface">
          Find your savings today.
        </h2>
        <p data-cta-reveal className="serif-body mx-auto mt-4 max-w-[44ch] text-brand-surface/72">
          Join 200+ founders who discovered exactly where their AI budget was leaking.
        </p>
        <Link
          data-cta-reveal
          href="/audit"
          className="mt-6 inline-flex items-center rounded-full border border-brand-surface bg-brand-surface px-7 py-3 text-[0.74rem] uppercase tracking-[0.14em] text-[var(--color-dark)] transition duration-[200ms] [transition-timing-function:var(--ease-enter)] hover:scale-[1.04] hover:shadow-[0_12px_32px_-8px_rgba(26,22,18,0.35)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Audit my AI spend - it&apos;s free -&gt;
        </Link>
      </div>
    </section>
  );
}
