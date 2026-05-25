"use client";

import { useRef } from "react";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

export function PhilosophySection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGsapContext(
    (gsap) => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-philosophy-reveal]");
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

      gsap.fromTo(
        "[data-signal-item]",
        { autoAlpha: 0, x: -16 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.44,
          ease: "power2.out",
          stagger: 0.07,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        }
      );

      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.9,
        },
      })
        .to("[data-philosophy-core]", { yPercent: -7 }, 0)
        .to("[data-philosophy-guide]", { yPercent: 8 }, 0);
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-b border-brand-border bg-brand-bg px-6 py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />
      <div className="mx-auto max-w-7xl">
        <div data-philosophy-reveal className="mb-14 max-w-3xl">
          <span className="kicker">Philosophy</span>
          <h2 className="cond-display mt-3 text-[clamp(2rem,4.7vw,3.8rem)] leading-[1.02] text-brand-text">
            Savings discipline
            <span className="mx-2 text-brand-muted">x</span>
            product velocity
          </h2>
          <p className="serif-body mt-4 text-base md:text-lg">
            Every recommendation is prioritized by confidence and execution cost so teams can reduce
            spend without slowing product delivery.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <article data-philosophy-core data-philosophy-reveal className="panel p-5 md:col-span-2">
            <span className="kicker">Signal matrix</span>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Redundancy",
                  desc: "Checks if multiple tools are paid for equivalent workflows across functions.",
                },
                {
                  title: "Plan fit",
                  desc: "Flags premium tiers where activation or feature usage is below threshold.",
                },
                {
                  title: "Seat efficiency",
                  desc: "Maps paid seats against role intensity to identify over-provisioned licenses.",
                },
                {
                  title: "Cost benchmark",
                  desc: "Compares per-developer spend against company-size cohort medians.",
                },
              ].map((item) => (
                <div key={item.title} data-signal-item className="panel-raised px-4 py-4">
                  <h3 className="text-base text-brand-text">{item.title}</h3>
                  <p className="serif-body mt-2 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article data-philosophy-guide data-philosophy-reveal className="panel p-5">
            <span className="kicker">Credex next steps</span>
            <div className="mt-4 space-y-4">
              <div className="panel-raised px-4 py-3">
                <p className="kicker text-brand-accent">1 / Prioritize</p>
                <p className="serif-body mt-1 text-sm">Launch high-confidence actions with payback under 30 days.</p>
              </div>
              <div className="panel-raised px-4 py-3">
                <p className="kicker text-brand-accent">2 / Negotiate</p>
                <p className="serif-body mt-1 text-sm">Use recommendation notes to support procurement conversations.</p>
              </div>
              <div className="panel-raised px-4 py-3">
                <p className="kicker text-brand-accent">3 / Re-audit</p>
                <p className="serif-body mt-1 text-sm">Re-run as team size or model mix changes over each quarter.</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
