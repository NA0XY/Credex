"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedCounter } from "@/components/animated-counter";
import { Logo } from "@/components/logo";

const NAV_ITEMS = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

const HERO_LINES = [
  "The finance-first",
  "spend agency for",
  "AI-native teams.",
];

const INTRO_PARAGRAPH =
  "AI spend is where budgets leak silently. SpendLens maps tools, seats, and direct API usage into one clear story so founders can reduce waste without slowing execution.";

const AWARDS = [
  "2026 Startup Ops Tool - Finalist",
  "2026 FinOps Workflow - High Performer",
  "2025 Operator Stack - Top Product",
  "2025 Procurement Toolkit - Editor Pick",
  "2025 Workflow Automation - Shortlist",
];

const SERVICE_ROWS = [
  {
    id: "01",
    title: "Audit Architecture",
    description:
      "We map every paid AI seat, direct API contract, and hidden team upgrade so finance and ops can see the full exposure.",
  },
  {
    id: "02",
    title: "Savings Strategy",
    description:
      "Each recommendation is ranked by confidence and impact, so your first 30 days focus on high-return decisions.",
  },
  {
    id: "03",
    title: "Renewal Intelligence",
    description:
      "Before annual renewals, SpendLens highlights pricing mismatches, over-seating, and consolidation opportunities.",
  },
  {
    id: "04",
    title: "Execution Sequence",
    description:
      "From quick downgrades to deeper vendor renegotiations, you get an action order designed for real teams.",
  },
];

const CASE_STUDIES = [
  {
    title: "From Tool Chaos to A Single Spend Narrative",
    label: "Seed SaaS - 9 tools - 16 seats",
    result: "$2,640 saved annually",
    image: "/images/spendlens-case-1.svg",
  },
  {
    title: "Rebalancing Team Plans Before Renewal Week",
    label: "Series A fintech - 7 tools - 31 seats",
    result: "$5,880 saved annually",
    image: "/images/spendlens-case-2.svg",
  },
  {
    title: "Cleaning Up API Fragmentation Across Teams",
    label: "Product studio - 11 tools - 22 seats",
    result: "$8,220 saved annually",
    image: "/images/spendlens-case-3.svg",
  },
];

const PROOF_NUMBERS = [
  { value: 82, suffix: "%", label: "audits with overlap found" },
  { value: 340, prefix: "$", suffix: "/mo", label: "average monthly savings surfaced" },
  { value: 12, suffix: " min", label: "to complete audit and receive report" },
];

const revealUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.13, 0.875, 0.455, 0.97] as [number, number, number, number] },
  },
};

const staggerGroup: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

function SplitLine({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "120%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 0.82, delay, ease: [0.13, 0.875, 0.455, 0.97] }}
        className="block"
      >
        {text}
      </motion.span>
    </span>
  );
}

function GiantWordmark({ y, scale }: { y: MotionValue<number>; scale: MotionValue<number> }) {
  return (
    <motion.div style={{ y, scale }} className="pointer-events-none absolute inset-x-0 bottom-0 z-0">
      <div className="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
        <span className="absolute -left-[3%] bottom-[2%] font-heading text-[clamp(11rem,31vw,31rem)] leading-[0.76] text-brand-text">
          S
        </span>
        <span className="absolute left-[16%] bottom-[6%] font-heading text-[clamp(11rem,31vw,31rem)] leading-[0.76] text-brand-text">
          P
        </span>
        <span className="absolute left-[34%] bottom-[1%] font-heading text-[clamp(11rem,31vw,31rem)] leading-[0.76] text-brand-text">
          E
        </span>
        <span className="absolute left-[49%] bottom-[8%] font-heading text-[clamp(11rem,31vw,31rem)] leading-[0.76] text-brand-text">
          N
        </span>
        <span className="absolute left-[67%] bottom-[3%] font-heading text-[clamp(11rem,31vw,31rem)] leading-[0.76] text-brand-text">
          D
        </span>
      </div>
    </motion.div>
  );
}

function LoaderOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[120] bg-[#1b1715]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.12 } }}
        >
          <motion.span
            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-surface"
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-x-0 top-0 bg-brand-bg"
            initial={{ height: "0%" }}
            animate={{ height: "100%" }}
            transition={{ duration: 0.78, delay: 0.52, ease: [0.84, 0, 0.16, 1] }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function LandingPage() {
  const [booting, setBooting] = useState(true);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1450);
    return () => clearTimeout(timer);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const glyphY = useTransform(scrollYProgress, [0, 1], [0, -210]);
  const glyphScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -36]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.65]);

  return (
    <>
      <LoaderOverlay show={booting} />

      <main className="relative overflow-x-hidden bg-brand-bg text-brand-text">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />

        <motion.header
          className="fixed inset-x-0 top-0 z-40"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.05, ease: [0.49, 0.62, 0.17, 1] }}
        >
          <div className="mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-xl border border-brand-border bg-brand-bg/85 px-6 py-4 backdrop-blur-sm">
            <Logo />
            <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.14em] text-brand-textSub md:flex">
              {NAV_ITEMS.map((item) => (
                <a key={item.href} href={item.href} className="transition-colors hover:text-brand-text">
                  {item.label}
                </a>
              ))}
            </nav>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 rounded-[0.62rem] border border-brand-text bg-brand-text px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-brand-bg transition hover:bg-brand-accent hover:text-brand-surface"
            >
              Start audit <ArrowUpRight size={13} />
            </Link>
          </div>
        </motion.header>

        <section ref={heroRef} className="relative z-10 min-h-screen border-b border-brand-border pt-28">
          <GiantWordmark y={glyphY} scale={glyphScale} />

          <motion.div
            style={{ y: heroTextY, opacity: heroTextOpacity }}
            className="relative z-10 mx-auto grid min-h-[72vh] max-w-7xl items-start gap-8 px-6 pt-16 lg:grid-cols-[1fr_1.1fr]"
          >
            <div className="hidden lg:block" />

            <div className="max-w-xl lg:pt-12">
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.18, ease: [0.13, 0.875, 0.455, 0.97] }}
                className="mb-5 text-xs uppercase tracking-[0.24em] text-brand-muted"
              >
                (WE AUDIT)
              </motion.p>

              <h1 className="font-heading text-[clamp(3.2rem,7vw,6.2rem)] leading-[0.98] tracking-tight">
                {HERO_LINES.map((line, idx) => (
                  <SplitLine key={line} text={line} delay={1.16 + idx * 0.08} />
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 1.44, ease: [0.13, 0.875, 0.455, 0.97] }}
                className="mt-8 max-w-lg text-base leading-relaxed text-brand-textSub sm:text-lg"
              >
                SpendLens turns scattered AI subscriptions and API contracts into one precise savings roadmap your leadership team can execute.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 1.56, ease: [0.13, 0.875, 0.455, 0.97] }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <Link
                  href="/audit"
                  className="inline-flex items-center gap-2 rounded-[0.7rem] bg-brand-text px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-brand-bg transition hover:bg-brand-accent hover:text-brand-surface"
                >
                  Run your audit <ArrowRight size={16} />
                </Link>
                <Link
                  href="/results/demo"
                  className="inline-flex items-center gap-2 rounded-[0.7rem] border border-brand-text px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-brand-text transition hover:bg-brand-text hover:text-brand-bg"
                >
                  See sample report <ArrowUpRight size={16} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className="relative z-10 border-b border-brand-border">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-120px" }} variants={staggerGroup}>
              <motion.a
                href="#contact"
                variants={revealUp}
                className="mb-9 inline-flex items-center gap-3 text-xl uppercase tracking-[0.07em] text-brand-text transition-colors hover:text-brand-accent"
              >
                About us <ArrowRight size={20} />
              </motion.a>

              <div className="max-w-5xl">
                {INTRO_PARAGRAPH.split(". ").map((line, idx, arr) => (
                  <SplitLine
                    key={`${line}-${idx}`}
                    text={idx === arr.length - 1 ? line : `${line}.`}
                    delay={0.05 + idx * 0.06}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative z-10 border-b border-brand-border">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:py-24">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-120px" }}
              variants={staggerGroup}
              className="mb-14 text-center"
            >
              <motion.p variants={revealUp} className="text-xs uppercase tracking-[0.24em] text-brand-muted">
                Award winning work
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-140px" }}
              variants={staggerGroup}
              className="grid gap-6 border-t border-brand-border pt-12 sm:grid-cols-2 lg:grid-cols-5"
            >
              {AWARDS.map((award) => (
                <motion.article key={award} variants={revealUp} className="text-center">
                  <p className="text-sm font-medium uppercase tracking-[0.08em] text-brand-textSub">{award}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <motion.section
          id="services"
          className="relative z-10 border-b border-brand-border bg-brand-surface/65"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerGroup}
        >
          <div className="mx-auto max-w-7xl px-6 py-20">
            <motion.p variants={revealUp} className="mb-3 text-xs uppercase tracking-[0.24em] text-brand-muted">
              What we do
            </motion.p>
            <motion.h2 variants={revealUp} className="max-w-3xl font-heading text-3xl leading-tight sm:text-4xl">
              Financial-first AI spend programs designed to move your team forward.
            </motion.h2>

            <div className="mt-12 divide-y divide-brand-border">
              {SERVICE_ROWS.map((row) => (
                <motion.article
                  key={row.id}
                  variants={revealUp}
                  className="grid gap-4 py-7 md:grid-cols-[110px_270px_1fr]"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-muted">({row.id})</p>
                  <h3 className="font-heading text-2xl leading-tight">{row.title}</h3>
                  <p className="text-sm leading-relaxed text-brand-textSub sm:text-base">{row.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="work"
          className="relative z-10 mx-auto max-w-7xl px-6 py-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-90px" }}
          variants={staggerGroup}
        >
          <motion.p variants={revealUp} className="mb-3 text-xs uppercase tracking-[0.24em] text-brand-muted">
            Case studies
          </motion.p>
          <motion.h2 variants={revealUp} className="max-w-3xl font-heading text-3xl leading-tight sm:text-4xl">
            Spend stories that move from monthly guesswork to clear annual savings.
          </motion.h2>

          <div className="mt-11 grid gap-6 lg:grid-cols-3">
            {CASE_STUDIES.map((item) => (
              <motion.article
                key={item.title}
                variants={revealUp}
                className="group overflow-hidden rounded-2xl border border-brand-border bg-brand-surface"
              >
                <div className="overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={1200}
                    height={860}
                    className="h-auto w-full transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <p className="mb-2 text-[0.65rem] uppercase tracking-[0.22em] text-brand-muted">{item.label}</p>
                  <h3 className="font-heading text-xl leading-tight">{item.title}</h3>
                  <p className="mt-3 font-mono text-sm text-brand-accent">{item.result}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="relative z-10 border-y border-brand-border bg-brand-surface/65"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerGroup}
        >
          <div className="mx-auto grid max-w-7xl gap-9 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div variants={revealUp}>
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-brand-muted">By the numbers</p>
              <h2 className="max-w-md font-heading text-3xl leading-tight sm:text-4xl">
                Built for teams that need precision before renewals.
              </h2>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-3">
              {PROOF_NUMBERS.map((item) => (
                <motion.div
                  key={item.label}
                  variants={revealUp}
                  className="rounded-xl border border-brand-border bg-brand-surface p-5"
                >
                  <p className="font-mono text-3xl leading-none text-brand-text">
                    <AnimatedCounter value={item.value} prefix={item.prefix ?? ""} suffix={item.suffix ?? ""} />
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-brand-muted">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <section id="contact" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 sm:p-10">
            <p className="mb-3 text-xs uppercase tracking-[0.24em] text-brand-muted">Get in touch</p>
            <h2 className="max-w-2xl font-heading text-3xl leading-tight sm:text-5xl">
              Your finance-first partner for AI spend clarity. Start the audit in two minutes.
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 rounded-[0.7rem] bg-brand-text px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-brand-bg transition hover:bg-brand-accent hover:text-brand-surface"
              >
                Start free audit <ArrowRight size={16} />
              </Link>
              <a
                href="mailto:hello@credex.rocks"
                className="inline-flex items-center gap-2 rounded-[0.7rem] border border-brand-text px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-brand-text transition hover:bg-brand-text hover:text-brand-bg"
              >
                hello@credex.rocks <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <footer className="relative z-10 border-t border-brand-border">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
            <Logo compact />
            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">SpendLens by Credex - NYC / BLR</p>
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.14em] text-brand-muted">
              <a href="#" className="transition-colors hover:text-brand-text">
                Privacy
              </a>
              <a href="#" className="transition-colors hover:text-brand-text">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
