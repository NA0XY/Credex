import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatedCounter } from "@/components/animated-counter";
import { BenchmarkPanel } from "@/components/results/benchmark-panel";
import { EmailCaptureForm } from "@/components/results/email-capture-form";
import { ResultActions } from "@/components/results/result-actions";
import { ResultsMotionShell } from "@/components/results/results-motion-shell";
import { StackScoreDisplay } from "@/components/results/stack-score-display";
import { WhatIfSimulator } from "@/components/results/what-if-simulator";
import { SiteHeader } from "@/components/site-header";
import { getAuditBySlug } from "@/lib/audit-store";
import { formatCurrency } from "@/lib/format";
import { generateFallbackSummary } from "@/lib/summary";
import type { ToolAuditResult } from "@/types/audit";

interface ResultPageProps {
  params: Promise<{ slug: string }>;
}

const REC_BADGE: Record<string, string> = {
  downgrade: "badge badge-downgrade",
  switch: "badge badge-switch",
  righsize: "badge badge-righsize",
  credits: "badge badge-credits",
  ok: "badge badge-ok",
};

const REC_LABEL: Record<string, string> = {
  downgrade: "DOWNGRADE",
  switch: "SWITCH TOOL",
  righsize: "RIGHT-SIZE",
  credits: "CREDIT OPP.",
  ok: "OPTIMAL",
};

const TOOL_ACCENT: Record<string, string> = {
  cursor: "rgba(100,180,255,0.6)",
  "github-copilot": "rgba(130,100,220,0.6)",
  claude: "rgba(255,160,60,0.6)",
  chatgpt: "rgba(100,210,130,0.6)",
  "anthropic-api": "rgba(255,130,40,0.6)",
  "openai-api": "rgba(180,180,180,0.6)",
  gemini: "rgba(70,180,220,0.6)",
  windsurf: "rgba(160,100,240,0.6)",
};

const GRADE_COLOR: Record<string, string> = {
  A: "#4CAF7A",
  B: "#7BAEE8",
  C: "#D4A017",
  D: "#E84337",
  F: "#E84337",
};

function ToolCard({ tool, rank }: { tool: ToolAuditResult; rank: number }) {
  const rec = tool.bestRecommendation;
  const hasSavings = rec.monthlySavings > 0;
  const borderColor = hasSavings ? (rec.monthlySavings > 100 ? "#E84337" : "#D4A017") : "rgba(46,125,82,0.6)";
  const accent = TOOL_ACCENT[tool.toolId] ?? "rgba(255,235,200,0.3)";

  return (
    <article
      className="relative overflow-hidden border border-brand-border transition duration-[220ms] ease-out hover:-translate-y-0.5 hover:border-brand-borderStrong"
      style={{ background: "#120F0B", border: "1px solid rgba(255,235,200,0.07)", borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="absolute bottom-0 left-0 top-0 w-0.5" style={{ background: accent, opacity: 0.4 }} />
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="kicker" style={{ fontSize: "0.58rem" }}>#{String(rank).padStart(2, "0")}</span>
              <span className={REC_BADGE[rec.type] ?? "badge badge-ok"}>{REC_LABEL[rec.type] ?? "REVIEW"}</span>
            </div>
            <h3 className="text-base font-bold text-brand-text" style={{ fontFamily: "var(--font-mono)", fontSize: "0.9375rem" }}>{tool.toolName}</h3>
            <p className="kicker mt-0.5" style={{ fontSize: "0.58rem" }}>{tool.currentPlan} &middot; {tool.seats} seat{tool.seats !== 1 ? "s" : ""}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-2xl font-bold text-brand-text tabular-nums" style={{ fontSize: "1.5rem" }}>{formatCurrency(tool.currentMonthlyCost)}</p>
            <p className="kicker mt-0.5" style={{ fontSize: "0.58rem" }}>MONTHLY BASELINE</p>
            {hasSavings && <p className="mono-value mt-1 text-xs font-bold tabular-nums">SAVE {formatCurrency(rec.monthlySavings)}/MO</p>}
          </div>
        </div>

        <div
          className="mb-3 px-4 py-3"
          style={{ background: hasSavings ? "rgba(212,160,23,0.05)" : "rgba(46,125,82,0.05)", border: `1px solid ${hasSavings ? "rgba(212,160,23,0.15)" : "rgba(46,125,82,0.15)"}` }}
        >
          <span className="kicker mb-2 block" style={{ fontSize: "0.58rem" }}>RECOMMENDATION</span>
          <p className="text-sm leading-relaxed text-brand-text" style={{ fontFamily: "var(--font-serif)" }}>{rec.reason}</p>
          {hasSavings && (
            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-brand-border/50 pt-3">
              {[
                { label: "MONTHLY", val: formatCurrency(rec.monthlySavings) },
                { label: "ANNUAL", val: formatCurrency(rec.annualSavings) },
                { label: "CONFIDENCE", val: rec.confidence.toUpperCase() },
              ].map((item) => (
                <div key={item.label}>
                  <span className="kicker" style={{ fontSize: "0.55rem" }}>{item.label}</span>
                  <p className="mono-value mt-1 text-sm font-bold">{item.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {rec.negotiationTip && (
          <div className="px-3 py-2" style={{ background: "rgba(255,107,0,0.04)", border: "1px solid rgba(255,107,0,0.15)" }}>
            <p className="text-xs text-brand-textSub" style={{ fontFamily: "var(--font-serif)" }}>NEGOTIATION: {rec.negotiationTip}</p>
          </div>
        )}
        {rec.priceChangeAlert && (
          <div className="mt-2 px-3 py-2" style={{ background: "rgba(212,160,23,0.05)", border: "1px solid rgba(212,160,23,0.20)" }}>
            <p className="text-xs text-brand-warning" style={{ fontFamily: "var(--font-serif)" }}>{rec.priceChangeAlert}</p>
          </div>
        )}
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { slug } = await params;
  const audit = await getAuditBySlug(slug);
  if (!audit) return { title: "Audit not found | Credex SpendLens" };
  return {
    title: `AI Spend Audit - Save $${audit.totalAnnualSavings}/yr | Credex SpendLens`,
    description: `Found $${audit.totalMonthlySavings}/mo across ${audit.auditResult.tools.length} tools.`,
    openGraph: {
      title: `We could save $${audit.totalAnnualSavings}/year on AI tools`,
      description: `SpendLens audited my stack: grade ${audit.auditResult.stackScore?.grade ?? "B"}, $${audit.totalMonthlySavings}/mo in savings.`,
      images: ["/og-image.svg"],
      type: "website",
    },
    twitter: { card: "summary_large_image", title: `Credex Spend Audit - $${audit.totalAnnualSavings}/yr` },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { slug } = await params;
  const audit = await getAuditBySlug(slug);
  if (!audit) notFound();

  const result = audit.auditResult;
  const summary = audit.aiSummary || generateFallbackSummary(result, { teamSize: audit.teamSize, primaryUseCase: audit.primaryUseCase, tools: audit.tools });
  const ordered = [...result.tools].sort((a, b) => b.bestRecommendation.monthlySavings - a.bestRecommendation.monthlySavings);
  const grade = result.stackScore?.grade ?? "-";

  return (
    <div className="bg-brand-stage relative min-h-screen bg-brand-bg text-brand-text">
      <div className="bg-contour bg-vignette pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent" />
      <SiteHeader
        links={[
          { href: "/", label: "Landing" },
          { href: "/audit", label: "New audit" },
          { href: "/results/demo", label: "Demo report" },
        ]}
        rightSlot={<ResultActions slug={slug} />}
      />
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
        <ResultsMotionShell>
        <div data-results-reveal className="panel mb-8">
          <div className="border-b border-brand-border px-6 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="kicker">AUDIT COMPLETE</span><span className="kicker text-brand-muted">&middot;</span><span className="kicker">{result.tools.length} TOOLS REVIEWED</span><span className="kicker text-brand-muted">&middot;</span>
              <span className="kicker">{new Date(audit.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>
          <div className="grid gap-0 divide-y divide-brand-border md:grid-cols-[auto_1fr] md:divide-x md:divide-y-0">
            <div className="flex flex-col items-center justify-center px-8 py-8">
              <span className="kicker mb-2">STACK GRADE</span>
              <span className="font-black leading-none" style={{ fontFamily: "var(--font-barlow)", fontSize: "7rem", fontWeight: 800, color: GRADE_COLOR[grade] ?? "#E84337", lineHeight: 0.9 }}>{grade}</span>
            </div>
            <div className="px-8 py-8">
              <div className="mb-6">
                <span className="kicker">PROJECTED ANNUAL SAVINGS</span>
                <div className="scanline mt-2">
                  <span style={{ fontSize: "clamp(3rem,7vw,5rem)" }}><AnimatedCounter value={result.totalAnnualSavings} prefix="$" suffix="" className="font-mono font-bold tabular-nums text-brand-accent" /></span>
                  <span className="ml-2 text-lg text-brand-textSub" style={{ fontFamily: "var(--font-serif)" }}>/year</span>
                </div>
              </div>
              <hr className="ruling mb-6" />
              <div className="grid grid-cols-2 gap-6">
                <div><span className="kicker" style={{ fontSize: "0.6rem" }}>MONTHLY SAVINGS</span><p className="mono-value mt-1 text-3xl font-bold tabular-nums">{formatCurrency(result.totalMonthlySavings)}</p></div>
                <div><span className="kicker" style={{ fontSize: "0.6rem" }}>CURRENT MONTHLY SPEND</span><p className="mt-1 text-3xl font-bold text-brand-text tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>{formatCurrency(result.totalCurrentMonthlyCost)}</p></div>
              </div>
            </div>
          </div>
        </div>
        <section data-results-reveal className="mb-8">
          <div className="mb-4 flex items-baseline justify-between gap-4"><h2 className="text-brand-text" style={{ fontFamily: "var(--font-barlow)", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.01em" }}>Tool-by-tool breakdown</h2><span className="kicker">RANKED BY IMPACT</span></div>
          <div className="space-y-3">{ordered.map((tool, i) => <ToolCard key={`${tool.toolId}-${tool.currentPlan}`} tool={tool} rank={i + 1} />)}</div>
        </section>
        <div data-results-reveal className="mb-8 grid gap-4 md:grid-cols-2">
          {result.stackScore && <StackScoreDisplay score={result.stackScore} />}
          {result.benchmarkComparison && <BenchmarkPanel yourCpd={result.benchmarkComparison.yourCpdPerMonth} medianCpd={result.benchmarkComparison.medianCpdPerMonth} p75Cpd={result.benchmarkComparison.medianCpdPerMonth * 1.55} cohortLabel={result.benchmarkComparison.cohortLabel} verdict={result.benchmarkComparison.verdict} />}
        </div>
        <div data-results-reveal className="mb-8"><WhatIfSimulator tools={result.tools} totalCurrentMonthly={result.totalCurrentMonthlyCost} /></div>
        <div data-results-reveal className="panel mb-8">
          <div className="border-b border-brand-border px-5 py-3"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-brand-accent" style={{ animation: "pulse 2s ease-in-out infinite" }} /><span className="kicker">EXECUTIVE BRIEF &middot; AI-GENERATED</span></div></div>
          <div className="px-5 py-6"><p className="serif-body text-base leading-relaxed">{summary}</p><p className="kicker mt-3" style={{ fontSize: "0.58rem" }}>Generated by Groq &middot; May contain estimates &middot; Rule-based audit math is deterministic</p></div>
        </div>
        {result.totalMonthlySavings > 500 && (
          <div data-results-reveal className="mb-8" style={{ background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.25)" }}>
            <div className="border-b border-brand-accent/25 px-5 py-3"><span className="kicker text-brand-accent">CREDEX - NEXT STEP FOR HIGH-SAVINGS TEAMS</span></div>
            <div className="px-5 py-6"><p className="mb-2 text-brand-text" style={{ fontFamily: "var(--font-barlow)", fontSize: "1.375rem", fontWeight: 700, letterSpacing: "0.03em" }}>CAPTURE MORE SAVINGS THROUGH CREDIT SOURCING</p><p className="mb-6 text-sm leading-relaxed text-brand-textSub" style={{ fontFamily: "var(--font-serif)" }}>You&apos;re spending {formatCurrency(result.totalCurrentMonthlyCost)}/mo on AI tools. Credex sources discounted credits from companies that over-forecast, typically 20-40% below retail. For teams at your spend level, a 20-minute conversation typically identifies additional savings not captured by plan optimization.</p><a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-brand-accent bg-brand-accent px-6 py-3 font-black uppercase tracking-wider text-brand-bg transition hover:bg-brand-accentDim glow-accent" style={{ fontFamily: "var(--font-barlow)", fontSize: "0.8125rem", letterSpacing: "0.12em" }}>BOOK FREE 20-MIN CONSULTATION -&gt;</a></div>
          </div>
        )}
        {result.savingsTier === "optimal" && <div data-results-reveal className="mb-8" style={{ background: "rgba(46,125,82,0.06)", border: "1px solid rgba(46,125,82,0.25)" }}><div className="px-5 py-6"><p className="mb-2 text-brand-ok" style={{ fontFamily: "var(--font-barlow)", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "0.04em" }}>STACK IS WELL-OPTIMIZED</p><p className="text-sm text-brand-textSub" style={{ fontFamily: "var(--font-serif)" }}>No significant savings found with your current stack configuration. Re-run this audit when your team grows, you add tools, or vendor pricing changes.</p></div></div>}
        <div data-results-reveal className="mb-6 text-center"><Link href="/audit" className="kicker text-brand-muted transition hover:text-brand-textSub" style={{ fontSize: "0.65rem" }}>RUN A NEW AUDIT WITH DIFFERENT INPUTS -&gt;</Link></div>
        <div data-results-reveal><EmailCaptureForm auditSlug={slug} /></div>
        </ResultsMotionShell>
      </main>
    </div>
  );
}
