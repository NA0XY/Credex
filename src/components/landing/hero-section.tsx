"use client";

import Link from "next/link";
import { useRef } from "react";
import { HeroGlyphDrop } from "@/components/landing/hero-glyph-drop";
import { HeroObjectCluster } from "@/components/landing/object-modules";
import { SiteHeader } from "@/components/site-header";
import { useGsapContext } from "@/lib/motion/use-gsap-context";

const HERO_STATS = [
  { label: "Median savings found", value: "$340/mo" },
  { label: "Teams audited", value: "2.4k+" },
  { label: "Average completion time", value: "2 min" },
];

export function HeroSection() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGsapContext(
    (gsap) => {
      const revealNodes = gsap.utils.toArray<HTMLElement>("[data-hero-reveal]");
      if (revealNodes.length > 0) {
        gsap.fromTo(
          revealNodes,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            duration: 0.56,
            ease: "power2.out",
            stagger: 0.08,
            y: 0,
          }
        );
      }

      gsap.to("[data-hero-orbit]", {
        duration: 24,
        ease: "none",
        repeat: -1,
        rotate: 360,
        transformOrigin: "50% 50%",
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative min-h-[100dvh] overflow-hidden border-b border-brand-border bg-brand-bg text-brand-text"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-35" />
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-[#56a2ff]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-brand-accent/18 blur-[140px]" />
      <svg
        className="pointer-events-none absolute inset-x-0 top-6 h-44 w-full opacity-35"
        fill="none"
        viewBox="0 0 1440 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-40 168C188 26 354 22 590 156C786 268 1070 240 1472 38"
          stroke="rgba(169,194,227,0.25)"
          strokeWidth="1.2"
        />
        <path
          d="M-20 212C206 74 432 54 648 178C854 296 1108 258 1470 76"
          stroke="rgba(255,138,61,0.22)"
          strokeWidth="1"
        />
      </svg>

      <div className="relative z-20 px-2 pt-4 sm:px-4">
        <SiteHeader
          links={[
            { href: "#features", label: "Features" },
            { href: "#workflow", label: "Workflow" },
            { href: "#about", label: "About" },
          ]}
          rightSlot={
            <Link
              href="/audit"
              className="inline-flex items-center rounded-full border border-brand-borderStrong bg-brand-accent/15 px-5 py-2 text-xs uppercase tracking-[0.11em] text-brand-text transition hover:border-brand-accent hover:bg-brand-accent hover:text-brand-bg"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
            >
              Start audit
            </Link>
          }
        />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-14 px-6 pb-18 pt-14 md:gap-12 md:pb-20 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <span data-hero-reveal className="kicker inline-flex items-center gap-2 rounded-full border border-brand-borderStrong px-3 py-1.5 text-brand-textSub">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-accent" />
            CREDEX SPENDLENS / LIVE AUDIT ENGINE
          </span>

          <h1
            data-hero-reveal
            className="cond-display mt-6 max-w-3xl text-[clamp(2.5rem,8vw,5.3rem)] leading-[0.98] text-brand-text"
          >
            Audit your AI stack before it
            <br />
            <span className="text-brand-accent">
              <HeroGlyphDrop text="starts leaking budget." />
            </span>
          </h1>

          <p data-hero-reveal className="serif-body mt-7 max-w-[58ch] text-base md:text-lg">
            SpendLens maps seats, plans, and overlapping capabilities across your tools, then
            produces a deterministic savings report you can share with finance and product.
          </p>

          <div data-hero-reveal className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/audit"
              className="inline-flex items-center rounded-full border border-brand-accent bg-brand-accent px-7 py-3 text-sm uppercase tracking-[0.11em] text-brand-bg transition hover:bg-brand-accentDim active:scale-[0.985]"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
            >
              Run free audit
            </Link>
            <Link
              href="/results/demo"
              className="inline-flex items-center rounded-full border border-brand-borderStrong bg-brand-surface/40 px-7 py-3 text-sm uppercase tracking-[0.11em] text-brand-textSub transition hover:border-brand-accent/50 hover:text-brand-text active:scale-[0.985]"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
            >
              Open sample report
            </Link>
          </div>

          <div data-hero-reveal className="mt-10 grid gap-3 sm:grid-cols-3">
            {HERO_STATS.map((item) => (
              <article key={item.label} className="liquid-glass rounded-2xl border border-brand-border bg-brand-surface/60 px-4 py-4">
                <p className="kicker">{item.label}</p>
                <p className="mono-value mt-2 text-2xl font-semibold">{item.value}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div data-hero-reveal>
            <HeroObjectCluster />
          </div>
          <article data-hero-reveal className="panel px-5 py-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="kicker">Flow telemetry</p>
              <p className="kicker text-brand-accent">updated every run</p>
            </div>
            <div className="relative h-24 overflow-hidden rounded-xl border border-brand-border bg-brand-surface2/70">
              <svg
                className="absolute inset-0 h-full w-full"
                fill="none"
                viewBox="0 0 600 180"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g data-hero-orbit transform="translate(300 90)">
                  <circle r="70" stroke="rgba(181,194,210,0.26)" />
                  <circle r="46" stroke="rgba(181,194,210,0.16)" />
                  <circle cx="70" cy="0" r="6" fill="rgba(255,138,61,0.9)" />
                  <circle cx="-46" cy="0" r="4.4" fill="rgba(115,171,244,0.9)" />
                </g>
                <path
                  d="M42 142L130 112L192 128L260 82L326 106L390 74L462 84L556 36"
                  stroke="rgba(255,138,61,0.75)"
                  strokeDasharray="8 8"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
