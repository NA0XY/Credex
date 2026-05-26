"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { HeroGlyphDrop } from "@/components/landing/hero-glyph-drop";
import { Logo } from "@/components/logo";
import { useGsapContext } from "@/lib/motion/use-gsap-context";
import { ScrollTrigger } from "@/lib/motion/gsap-runtime";
import { useMagnetic } from "@/lib/motion/use-magnetic";

export function HeroSection() {
  const rootRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const heroImageRef = useRef<HTMLDivElement | null>(null);
  const primaryCtaRef = useRef<HTMLAnchorElement | null>(null);
  const secondaryIconRef = useRef<HTMLAnchorElement | null>(null);

  useMagnetic(primaryCtaRef, { maxOffset: 6 });
  useMagnetic(secondaryIconRef, { maxOffset: 6 });

  useGsapContext(
    (gsap) => {
      const navEl = navRef.current;
      if (navEl) {
        const trigger = ScrollTrigger.create({
          end: 99999,
          start: 10,
          onToggle: (self) => {
            gsap.to(navEl, {
              backdropFilter: self.isActive ? "blur(16px) saturate(160%)" : "blur(0px)",
              backgroundColor: self.isActive ? "rgba(244, 239, 230, 0.84)" : "rgba(244, 239, 230, 0)",
              borderColor: self.isActive ? "rgba(200, 191, 176, 0.92)" : "rgba(200, 191, 176, 0.56)",
              duration: 0.28,
              ease: "power3.out",
            });
          },
        });
        gsap.fromTo(navEl, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" });
        return () => trigger.kill();
      }
      return undefined;
    },
    { scope: rootRef }
  );

  useGsapContext(
    (gsap) => {
      gsap.fromTo(
        "[data-hero-kicker]",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.32, delay: 0.08, ease: "power3.out" }
      );
      gsap.fromTo(
        "[data-hero-subcopy]",
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.48, delay: 0.48, ease: "power3.out" }
      );
      gsap.fromTo(
        "[data-hero-cta]",
        { autoAlpha: 0, scale: 0.94 },
        { autoAlpha: 1, scale: 1, duration: 0.38, delay: 0.56, ease: "power3.out" }
      );
      gsap.fromTo(
        "[data-hero-proof]",
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.28, delay: 0.64, ease: "power3.out" }
      );
      gsap.fromTo(
        heroImageRef.current,
        { clipPath: "inset(0 100% 0 0)", autoAlpha: 0 },
        { clipPath: "inset(0 0% 0 0)", autoAlpha: 1, duration: 1, delay: 0.5, ease: "power3.out" }
      );
      gsap.fromTo(
        "[data-hero-accent]",
        { autoAlpha: 0, x: 30, rotate: -30 },
        { autoAlpha: 1, x: 0, rotate: -13, duration: 0.7, delay: 0.9, ease: "power3.out" }
      );
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="relative min-h-[100svh] border-b border-brand-border bg-brand-bg pb-6">
      <div className="mx-auto max-w-[1440px] px-[clamp(1.2rem,4vw,3.2rem)] pt-4">
        <header ref={navRef} className="sticky top-3 z-40 rounded-full border border-brand-border px-2.5 py-1.5">
          <div className="flex items-center justify-between gap-3">
            <Logo className="rounded-full px-2 py-1" />

            <div className="hidden items-center gap-2 md:flex">
              <nav className="inline-flex items-center rounded-full border border-brand-border bg-brand-surface p-1">
                {[
                  { href: "#method", label: "How it works" },
                  { href: "#results-preview", label: "Results" },
                  { href: "#faq", label: "FAQ" },
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="kicker rounded-full px-3 py-1.5 hover:bg-brand-surface2">
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Link
                href="/audit"
                className="inline-flex items-center rounded-full border border-[var(--color-border-dark)] bg-[var(--color-dark)] px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-brand-surface transition hover:scale-[1.02] hover:bg-[var(--color-dark-surface)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                AUDIT MY AI SPEND -&gt;
              </Link>
            </div>
          </div>
        </header>

        <div className="relative mt-5 min-h-[44rem]">
          <div className="grid min-h-[44rem] grid-cols-12 gap-[1.6rem]">
            <div className="col-span-12 lg:col-span-5" />
            <div className="col-span-12 lg:col-span-7">
              <div ref={heroImageRef} className="relative h-[44rem] overflow-hidden rounded-[2rem] border border-brand-border">
                <div className="absolute inset-0 rounded-[2rem] [clip-path:polygon(0_0,100%_0,100%_86%,72%_100%,0_100%)]">
                  <Image
                    src="/assets/editorial/hero-data-editorial.svg"
                    alt="Editorial visualization of SpendLens audit output with stacked data cards"
                    fill
                    priority
                    sizes="(min-width: 1280px) 60vw, 100vw"
                    className="object-cover transition-transform duration-[560ms] [transition-timing-function:var(--ease-enter)] hover:scale-[1.04]"
                  />
                </div>
                <div className="pointer-events-none absolute -left-[8%] -top-[10%] h-[54%] w-[60%] rounded-br-[12rem] bg-brand-bg" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-[30%] w-[28%] bg-brand-bg [clip-path:polygon(35%_0,100%_0,100%_100%,0_100%)]" />
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[44%] rounded-br-[10rem] bg-brand-bg" />

          <div className="absolute left-0 top-[2.2rem] z-20 w-[min(44rem,92vw)]">
            <div data-hero-kicker className="inline-flex items-center rounded-full border border-brand-border bg-brand-surface px-3 py-1">
              <span className="kicker">Free - 2 minutes - no credit card</span>
            </div>

            <div className="mt-4 max-w-[13.8ch]">
              <HeroGlyphDrop
                text={"You're probably overpaying for AI tools."}
                className="cond-display text-[clamp(3rem,7.5vw,6rem)] leading-[0.88] text-brand-text"
              />
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="relative h-16 w-44 shrink-0 overflow-hidden rounded-full border border-brand-border">
                <Image
                  src="/assets/editorial/hero-data-editorial.svg"
                  alt="Audit card thumbnail"
                  fill
                  sizes="176px"
                  className="object-cover object-left"
                />
              </div>
              <p data-hero-subcopy className="serif-body max-w-[35ch] text-[clamp(0.9rem,1.5vw,1.1rem)]">
                Free 2-minute audit finds exactly where your startup&apos;s AI budget leaks and how to fix it.
              </p>
            </div>

            <div data-hero-cta className="mt-5 flex items-center gap-2.5">
              <Link ref={primaryCtaRef} href="/audit" className="hero-ghost-cta magnetic-target">
                Audit my AI spend - it&apos;s free
              </Link>
              <Link href="#method" className="hero-ghost-cta">
                See methodology
              </Link>
              <Link
                ref={secondaryIconRef}
                href="/audit"
                aria-label="Audit my AI spend"
                className="hero-icon-cta magnetic-target"
              >
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.9} />
              </Link>
            </div>

            <div data-hero-proof className="mt-4 inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-accent" />
              <span className="kicker !text-brand-textSub">Used by 200+ founders and engineering managers</span>
            </div>
          </div>

          <article
            data-hero-accent
            className="absolute bottom-5 right-4 z-30 w-[clamp(10rem,20vw,15rem)] overflow-hidden rounded-[1.6rem] border border-[var(--color-border-dark)] bg-[var(--color-dark-surface)] [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)] p-4 shadow-[0_24px_48px_-18px_rgba(26,22,18,0.28)]"
          >
            <p className="kicker !text-brand-surface/70">Stack health score</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="cond-display text-6xl leading-none text-brand-accent">B</span>
              <span className="kicker !text-brand-surface/85">74/100</span>
            </div>
            <div className="mt-3 space-y-2">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="kicker !text-brand-surface/70">Plan fit</span>
                  <span className="kicker !text-brand-surface/70">80%</span>
                </div>
                <div className="h-1.5 rounded-full bg-brand-surface/20">
                  <div className="h-full w-[80%] rounded-full bg-brand-accent" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="kicker !text-brand-surface/70">Redundancy</span>
                  <span className="kicker !text-brand-surface/70">55%</span>
                </div>
                <div className="h-1.5 rounded-full bg-brand-surface/20">
                  <div className="h-full w-[55%] rounded-full bg-brand-warning" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="kicker !text-brand-surface/70">Seat eff.</span>
                  <span className="kicker !text-brand-surface/70">35%</span>
                </div>
                <div className="h-1.5 rounded-full bg-brand-surface/20">
                  <div className="h-full w-[35%] rounded-full bg-brand-danger" />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
