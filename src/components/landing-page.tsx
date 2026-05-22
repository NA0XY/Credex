"use client";

import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, TrendingDown, Zap, Share2, CheckCircle2, AlertCircle, Minus } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { Logo } from "@/components/logo";

/* ─── DATA ─── */
const TOOLS = [
  { name: "Cursor", cat: "coding" },
  { name: "GitHub Copilot", cat: "coding" },
  { name: "Claude", cat: "chat" },
  { name: "ChatGPT", cat: "chat" },
  { name: "Anthropic API", cat: "api" },
  { name: "OpenAI API", cat: "api" },
  { name: "Gemini", cat: "chat" },
  { name: "Windsurf", cat: "coding" },
];

const CAT_COLOR: Record<string, string> = {
  coding: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  chat:   "border-purple-500/30 text-purple-400 bg-purple-500/10",
  api:    "border-amber-500/30 text-amber-400 bg-amber-500/10",
};

const STATS = [
  { value: 340, prefix: "$", suffix: "/mo", label: "Avg. monthly savings found" },
  { value: 82, prefix: "", suffix: "%", label: "Teams with overlapping tools" },
  { value: 1200, prefix: "", suffix: "+", label: "Audits completed (mocked)" },
];

const STEPS = [
  {
    num: "01",
    icon: "📋",
    title: "Tell us what you pay",
    desc: "Enter your AI tools, plans, seat count, and monthly spend. Takes under 2 minutes. No account needed.",
  },
  {
    num: "02",
    icon: "🔍",
    title: "We run the audit",
    desc: "Our engine checks for duplicate coverage, over-seating, wrong-plan fits, and credit arbitrage opportunities.",
  },
  {
    num: "03",
    icon: "💰",
    title: "See your savings",
    desc: "Get a per-tool breakdown with specific action items. Share the report. Book a Credex call if savings are significant.",
  },
];

const DEMO_RESULTS = [
  { tool: "GitHub Copilot", issue: "Duplicate coverage with Cursor", saving: 50, type: "switch" },
  { tool: "ChatGPT Team", issue: "2 users on a 5-seat min plan", saving: 60, type: "downgrade" },
  { tool: "Cursor Pro", issue: "Right-sized for your team", saving: 0, type: "ok" },
];

const FAQS = [
  {
    q: "Is this actually free?",
    a: "Yes. No credit card, no trial, no catch. The audit runs entirely in your browser and results are saved to a public link.",
  },
  {
    q: "Do you store my spend data?",
    a: "We store audit inputs and results to power reports and future benchmarks. Your email is only captured if you choose to share it.",
  },
  {
    q: "How accurate are the recommendations?",
    a: "Pricing data is verified weekly from official vendor pages. Audit logic is explicit rule-based — no AI hallucinations in the math.",
  },
  {
    q: "What is Credex?",
    a: "Credex sources discounted AI infrastructure credits from companies that over-forecast usage. For high-savings teams, Credex is the next step.",
  },
  {
    q: "Will I get spammed?",
    a: "No. One confirmation email. Credex reaches out only for high-savings cases and you can opt out instantly.",
  },
];

/* ─── ANIMATIONS ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ─── SUBCOMPONENTS ─── */
function RecommendationBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    switch:    { label: "Switch tool", icon: <Zap size={10} />, cls: "badge-switch" },
    downgrade: { label: "Downgrade", icon: <TrendingDown size={10} />, cls: "badge-downgrade" },
    ok:        { label: "Optimized", icon: <CheckCircle2 size={10} />, cls: "badge-ok" },
    credits:   { label: "Credits deal", icon: <AlertCircle size={10} />, cls: "badge-credits" },
    righsize:  { label: "Right-size", icon: <Minus size={10} />, cls: "badge-righsize" },
  };
  const m = map[type] ?? map.ok;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.cls}`}>
      {m.icon}{m.label}
    </span>
  );
}

/* ─── MAIN PAGE ─── */
export function LandingPage() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  return (
    <main className="relative bg-brand-bg text-brand-text overflow-x-hidden">
      {/* Atmospheric grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-100" />
      {/* Radial glow behind hero */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-accent/5 rounded-full blur-[120px]" />

      {/* ── NAV ── */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="hidden items-center gap-8 text-sm text-brand-textSub md:flex">
          <a href="#how" className="transition hover:text-brand-text">How it works</a>
          <a href="#faq" className="transition hover:text-brand-text">FAQ</a>
          <Link
            href="/audit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-bg transition hover:bg-brand-accentDim glow-accent-sm"
          >
            Start free audit <ArrowRight size={14} />
          </Link>
        </div>
        {/* Mobile CTA */}
        <Link href="/audit" className="flex md:hidden items-center gap-1 rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-semibold text-brand-bg">
          Audit <ArrowRight size={12} />
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-12">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">

          {/* LEFT: copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.p
              variants={fadeUp}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-medium text-brand-textSub"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
              Free AI spend audit · No account required
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-heading text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            >
              You&apos;re probably<br />
              <span className="text-brand-accent">overpaying</span><br />
              for AI tools.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-lg text-lg leading-relaxed text-brand-textSub"
            >
              Free 2-minute audit. See exactly where your team&apos;s AI budget leaks
              and what to do about it — with specific, defensible recommendations.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/audit"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand-accent px-6 text-base font-semibold text-brand-bg transition-all glow-accent hover:bg-brand-accentDim hover:gap-3"
              >
                Audit my AI spend
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/results/demo"
                className="inline-flex h-12 items-center gap-1.5 rounded-xl border border-brand-border px-6 text-sm text-brand-textSub transition hover:border-brand-accent/50 hover:text-brand-text"
              >
                <Share2 size={14} />
                See a sample report
              </Link>
            </motion.div>

            {/* Social proof — properly marked as mocked */}
            <motion.div
              variants={fadeUp}
              className="mt-8 flex items-center gap-3 rounded-xl border border-brand-border bg-brand-surface/60 p-3 backdrop-blur-sm"
            >
              <div className="flex -space-x-2">
                {["#7C3AED","#2563EB","#059669"].map((color, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-brand-bg flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {["JD","SM","AT"][i]}
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-text">
                  Founders at 200+ startups have audited their AI spend
                </p>
                <p className="text-[10px] text-brand-muted">★★★★★ · Illustrative — updated with real data post-launch</p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: demo preview card */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Glow behind card */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-accent/20 via-transparent to-transparent blur-sm" />

            <div className="relative rounded-2xl border border-brand-border/80 bg-brand-surface p-6 shadow-2xl">
              {/* Card header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-brand-muted">Projected annual savings</p>
                </div>
                <span className="rounded-full border border-brand-accent/30 bg-brand-accent/10 px-2.5 py-1 text-[10px] font-semibold text-brand-accent">
                  LIVE ESTIMATE
                </span>
              </div>

              {/* Big number */}
              <div className="scanline mb-6">
                <AnimatedCounter
                  value={8400}
                  prefix="$"
                  suffix=""
                  className="block font-mono text-6xl font-bold text-brand-accent tabular-nums"
                />
                <p className="mt-1 text-sm text-brand-muted">per year · across 4 tools</p>
              </div>

              {/* Per-tool lines */}
              <div className="space-y-2">
                {DEMO_RESULTS.map((item) => (
                  <div
                    key={item.tool}
                    className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-bg px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-text truncate">{item.tool}</span>
                        <RecommendationBadge type={item.type} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-brand-muted truncate">{item.issue}</p>
                    </div>
                    <span className={`ml-3 font-mono text-sm font-semibold tabular-nums ${item.saving > 0 ? "text-brand-accent" : "text-brand-muted"}`}>
                      {item.saving > 0 ? `+$${item.saving}/mo` : "✓"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <p className="mt-4 text-center text-[11px] text-brand-muted">
                Results powered by rule-based audit engine · not AI guesses
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <motion.section
        ref={statsRef}
        className="relative z-10 border-y border-brand-border bg-brand-surface/50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-brand-border px-6">
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="py-8 px-6 text-center"
            >
              <p className="font-mono text-3xl font-bold text-brand-accent sm:text-4xl">
                {statsInView ? (
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} durationMs={1400} />
                ) : (
                  <span>{stat.prefix}0{stat.suffix}</span>
                )}
              </p>
              <p className="mt-1.5 text-xs text-brand-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-12 text-center"
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-accent">How it works</p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">From zero to audit in 2 minutes</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="grid gap-6 md:grid-cols-3"
        >
          {STEPS.map((step, i) => (
            <motion.article
              key={step.num}
              variants={fadeUp}
              className="group relative rounded-xl border border-brand-border bg-brand-surface p-6 transition-all hover:border-brand-accent/40 hover:-translate-y-0.5"
            >
              {/* Step connector line */}
              {i < 2 && (
                <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-gradient-to-r from-brand-border to-transparent md:block" />
              )}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-3xl">{step.icon}</span>
                <span className="font-mono text-4xl font-bold text-brand-border group-hover:text-brand-accent/30 transition-colors">{step.num}</span>
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-brand-textSub">{step.desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ── TOOLS SUPPORTED ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="relative z-10 mx-auto max-w-6xl px-6 pb-24"
      >
        <p className="mb-5 text-center font-mono text-xs uppercase tracking-[0.2em] text-brand-muted">
          Supports these tools
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {TOOLS.map((tool) => (
            <span
              key={tool.name}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:scale-105 ${CAT_COLOR[tool.cat]}`}
            >
              {tool.name}
            </span>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-brand-muted">
          Coding assistants · Chat subscriptions · API direct spend
        </p>
      </motion.section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative z-10 border-t border-brand-border bg-brand-surface/30">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12 text-center"
          >
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-accent">FAQ</p>
            <h2 className="font-heading text-3xl font-bold">Common questions</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="space-y-3"
          >
            {FAQS.map((faq) => (
              <motion.div
                key={faq.q}
                variants={fadeUp}
                className="rounded-xl border border-brand-border bg-brand-surface p-5 transition hover:border-brand-accent/30"
              >
                <p className="font-semibold text-brand-text">{faq.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-brand-textSub">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 border-t border-brand-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.h2 variants={fadeUp} className="font-heading text-4xl font-bold sm:text-5xl">
              Find out what you&apos;re<br />
              <span className="text-brand-accent">actually</span> paying for.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-brand-textSub">
              Free · No account · Results in 2 minutes
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <Link
                href="/audit"
                className="group inline-flex h-14 items-center gap-2 rounded-xl bg-brand-accent px-8 text-lg font-semibold text-brand-bg transition-all glow-accent hover:bg-brand-accentDim"
              >
                Audit my AI spend — it&apos;s free
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-brand-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <Logo compact />
          <p className="text-xs text-brand-muted">
            SpendLens by <a href="https://credex.rocks" className="underline underline-offset-2 hover:text-brand-text transition-colors">Credex</a> · Free tool for startup AI spend visibility
          </p>
          <div className="flex gap-4 text-xs text-brand-muted">
            <a href="#" className="hover:text-brand-text transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-text transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
