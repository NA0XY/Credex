"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Calculator, ClipboardPenLine, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/animated-counter";
import { Logo } from "@/components/logo";

const supportedTools = [
  "Cursor",
  "GitHub Copilot",
  "Claude",
  "ChatGPT",
  "Anthropic API",
  "OpenAI API",
  "Gemini",
  "Windsurf",
];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function LandingPage() {
  return (
    <main className="bg-brand-bg text-brand-text">
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <nav className="mb-16 flex items-center justify-between">
          <Logo />
          <div className="hidden items-center gap-6 text-sm text-brand-textSub md:flex">
            <a href="#how" className="transition hover:text-brand-text">
              How it works
            </a>
            <Link href="/audit">
              <Button className="bg-brand-accent text-brand-bg hover:bg-brand-accentDim">Start free audit</Button>
            </Link>
          </div>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}>
            <p className="mb-4 inline-flex rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs text-brand-textSub">
              Built for startup founders and engineering managers
            </p>
            <h1 className="font-heading text-4xl leading-tight sm:text-6xl lg:text-7xl">
              You&apos;re probably overpaying for AI tools.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-brand-textSub sm:text-xl">
              Free 2-minute audit. See exactly where your team&apos;s AI budget leaks and what to do about it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/audit">
                <Button className="h-12 bg-brand-accent px-6 text-base text-brand-bg shadow-[0_0_30px_rgba(0,255,136,0.35)] transition hover:bg-brand-accentDim">
                  Audit my AI spend <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/results/demo" className="text-sm text-brand-textSub underline-offset-4 hover:underline">
                See a sample report
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-4 rounded-xl border border-brand-border bg-brand-surface p-4 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="h-8 w-8 rounded-full border border-brand-border bg-gradient-to-br from-brand-accent/30 to-brand-surface"
                  />
                ))}
              </div>
              <p className="text-brand-textSub">
                <span className="font-semibold text-brand-text">Mocked:</span> Founders at 200+ startups have audited their AI spend
              </p>
              <span className="ml-auto inline-flex items-center gap-1 text-brand-accent">
                <BadgeCheck className="h-4 w-4" /> 4.9/5
              </span>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="rounded-2xl border border-brand-border bg-brand-surface p-6"
          >
            <p className="text-sm text-brand-textSub">Projected annual savings</p>
            <AnimatedCounter
              value={8400}
              prefix="$"
              suffix="/yr"
              className="mt-2 block font-heading text-5xl text-brand-accent"
            />
            <div className="mt-6 space-y-3 text-sm">
              <div className="rounded-lg border border-brand-border bg-brand-bg p-3">
                Duplicate coding assistants removed <span className="float-right text-brand-accent">+$50/mo</span>
              </div>
              <div className="rounded-lg border border-brand-border bg-brand-bg p-3">
                Right-sized chat subscriptions <span className="float-right text-brand-accent">+$35/mo</span>
              </div>
              <div className="rounded-lg border border-brand-border bg-brand-bg p-3">
                Credit sourcing opportunities <span className="float-right text-brand-accent">+$90/mo</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        id="how"
        className="mx-auto grid max-w-6xl gap-4 px-6 pb-16 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.15 }}
      >
        {[
          { title: "Tell us what you pay", icon: ClipboardPenLine },
          { title: "We run the audit", icon: Calculator },
          { title: "See your savings", icon: LineChart },
        ].map((step, index) => (
          <motion.article
            key={step.title}
            variants={reveal}
            className="rounded-xl border border-brand-border bg-brand-surface p-5"
          >
            <step.icon className="mb-3 h-5 w-5 text-brand-accent" />
            <p className="text-xs text-brand-textSub">Step {index + 1}</p>
            <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
          </motion.article>
        ))}
      </motion.section>

      <motion.section
        className="mx-auto max-w-6xl px-6 pb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={reveal}
      >
        <div className="grid gap-3 rounded-xl border border-brand-border bg-brand-surface p-5 text-sm sm:grid-cols-3">
          <p>
            Average savings found: <span className="font-semibold text-brand-accent">$340/mo</span>
          </p>
          <p>
            Most common overspend: <span className="font-semibold">Duplicate tool coverage</span>
          </p>
          <p>
            <span className="font-semibold text-brand-text">Mocked:</span> Audits completed: 1,200+
          </p>
        </div>
      </motion.section>

      <motion.section
        className="mx-auto max-w-6xl px-6 pb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={reveal}
      >
        <div className="flex flex-wrap gap-2 rounded-xl border border-brand-border bg-brand-surface p-5">
          {supportedTools.map((tool) => (
            <span
              key={tool}
              className="rounded-full border border-brand-border bg-brand-bg px-3 py-1 text-xs text-brand-textSub"
            >
              {tool}
            </span>
          ))}
        </div>
      </motion.section>

      <footer className="border-t border-brand-border px-6 py-8 text-center text-sm text-brand-textSub">
        SpendLens by Credex · <a href="https://credex.rocks">credex.rocks</a> · Privacy · Terms
      </footer>
    </main>
  );
}

