"use client";

import { useRef } from "react";
import { SystemArtifactGrid } from "@/components/landing/object-modules";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

const STEPS = [
  {
    num: "01",
    title: "Declare stack context",
    desc: "Capture tools, seat counts, and monthly commitments so the model has complete cost topology.",
  },
  {
    num: "02",
    title: "Run deterministic checks",
    desc: "Rules detect overlap, oversized plans, seat drift, and benchmark deltas with transparent scoring.",
  },
  {
    num: "03",
    title: "Execute ranked actions",
    desc: "Deploy the highest-confidence recommendations first and monitor savings as procurement changes.",
  },
];

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGsapContext(
    (gsap) => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-about-reveal]");
      if (nodes.length > 0) {
        gsap.fromTo(
          nodes,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.56,
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
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden border-b border-brand-border bg-brand-bg px-6 py-24 text-brand-text"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(103,164,236,0.14),transparent_68%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div data-about-reveal className="mb-14 max-w-3xl">
          <span className="kicker">Method</span>
          <h2 className="cond-display mt-3 text-[clamp(2rem,4.7vw,3.8rem)] leading-[1.02] text-brand-text">
            Spend clarity for teams moving faster than finance cycles.
          </h2>
          <p className="serif-body mt-5 text-base md:text-lg">
            Credex SpendLens is built for operator teams that ship quickly and need spend decisions
            backed by transparent logic, not black-box guesses.
          </p>
        </div>

        <div className="mb-14 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.num} data-about-reveal className="panel px-5 py-5">
              <p className="mono-value text-2xl font-semibold">{step.num}</p>
              <h3 className="mt-3 text-lg text-brand-text">{step.title}</h3>
              <p className="serif-body mt-2 text-sm">{step.desc}</p>
            </article>
          ))}
        </div>

        <div data-about-reveal>
          <SystemArtifactGrid />
        </div>
      </div>
    </section>
  );
}
