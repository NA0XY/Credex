import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatedCounter } from "@/components/animated-counter";
import {
  EditorialCard,
  FrameShell,
  MetricTile,
  SignalBadge,
} from "@/components/editorial/primitives";
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

const REC_TONE: Record<
  string,
  "neutral" | "critical" | "warn" | "ok"
> = {
  downgrade: "critical",
  switch: "warn",
  righsize: "ok",
  credits: "warn",
  ok: "ok",
};

const REC_LABEL: Record<string, string> = {
  downgrade: "DOWNGRADE",
  switch: "SWITCH TOOL",
  righsize: "RIGHT-SIZE",
  credits: "CREDIT OPP.",
  ok: "OPTIMAL",
};

const TOOL_ACCENT: Record<string, string> = {
  cursor: "rgba(95, 122, 97, 0.45)",
  "github-copilot": "rgba(111, 132, 111, 0.45)",
  claude: "rgba(178, 135, 53, 0.45)",
  chatgpt: "rgba(47, 124, 79, 0.4)",
  "anthropic-api": "rgba(169, 72, 67, 0.42)",
  "openai-api": "rgba(136, 156, 135, 0.4)",
  gemini: "rgba(95, 122, 97, 0.5)",
  windsurf: "rgba(111, 132, 111, 0.45)",
};

const GRADE_COLOR: Record<string, string> = {
  A: "var(--color-brand)",
  B: "var(--color-accent)",
  C: "var(--color-warn)",
  D: "var(--color-danger)",
  F: "var(--color-danger)",
};

function ToolCard({ tool, rank }: { tool: ToolAuditResult; rank: number }) {
  const rec = tool.bestRecommendation;
  const hasSavings = rec.monthlySavings > 0;
  const borderColor = hasSavings
    ? rec.monthlySavings > 100
      ? "var(--color-danger)"
      : "var(--color-warn)"
    : "rgba(47, 182, 124, 0.55)";
  const accent = TOOL_ACCENT[tool.toolId] ?? "rgba(200, 191, 176, 0.3)";

  return (
    <article
      className="editorial-card group overflow-hidden border-brand-border/90 transition-transform duration-[220ms] ease-out hover:-translate-y-0.5 hover:border-brand-borderStrong"
      data-results-card
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: accent, opacity: 0.65 }}
      />
      <div className="p-5 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="kicker text-[0.58rem]">
                #{String(rank).padStart(2, "0")}
              </span>
              <SignalBadge tone={REC_TONE[rec.type] ?? "ok"}>
                {REC_LABEL[rec.type] ?? "REVIEW"}
              </SignalBadge>
            </div>
            <h3 className="text-[0.95rem] font-semibold text-brand-text">
              {tool.toolName}
            </h3>
            <p className="kicker mt-0.5 text-[0.58rem]">
              {tool.currentPlan} &middot; {tool.seats} seat
              {tool.seats !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="mono-value text-2xl font-bold tabular-nums">
              {formatCurrency(tool.currentMonthlyCost)}
            </p>
            <p className="kicker mt-0.5 text-[0.58rem]">Monthly baseline</p>
            {hasSavings && (
              <p className="mono-value mt-1 text-xs font-bold tabular-nums text-brand-ok">
                Save {formatCurrency(rec.monthlySavings)}/mo
              </p>
            )}
          </div>
        </div>

        <div
          className="panel-raised mb-3 px-4 py-3"
          style={{
            background: hasSavings
              ? "rgba(178, 135, 53, 0.08)"
              : "rgba(47, 124, 79, 0.08)",
            borderColor: hasSavings
              ? "rgba(178, 135, 53, 0.3)"
              : "rgba(47, 124, 79, 0.3)",
          }}
        >
          <span className="kicker mb-2 block text-[0.58rem]">Recommendation</span>
          <p className="serif-body text-sm leading-relaxed text-brand-text">
            {rec.reason}
          </p>
          {hasSavings && (
            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-brand-border/50 pt-3">
              {[
                { label: "Monthly", val: formatCurrency(rec.monthlySavings) },
                { label: "Annual", val: formatCurrency(rec.annualSavings) },
                { label: "Confidence", val: rec.confidence.toUpperCase() },
              ].map((item) => (
                <div key={item.label}>
                  <span className="kicker text-[0.55rem]">{item.label}</span>
                  <p className="mono-value mt-1 text-sm font-bold">{item.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {rec.negotiationTip && (
          <div
            className="rounded-xl border px-3 py-2"
            style={{
              background: "rgba(178, 135, 53, 0.08)",
              borderColor: "rgba(178, 135, 53, 0.26)",
            }}
          >
            <p className="serif-body text-xs text-brand-textSub">
              Negotiation: {rec.negotiationTip}
            </p>
          </div>
        )}
        {rec.priceChangeAlert && (
          <div
            className="mt-2 rounded-xl border px-3 py-2"
            style={{
              background: "rgba(169, 72, 67, 0.06)",
              borderColor: "rgba(169, 72, 67, 0.2)",
            }}
          >
            <p className="serif-body text-xs text-brand-danger">
              {rec.priceChangeAlert}
            </p>
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
  const createdOn = new Date(audit.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-brand-stage relative min-h-screen text-brand-text">
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
      <main className="relative z-10 mx-auto w-full max-w-[1380px] px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <ResultsMotionShell>
          <div data-results-stage="hero" className="mb-6">
            <FrameShell>
              <div className="border-b border-brand-border px-5 py-4 md:px-7">
                <div className="flex flex-wrap items-center gap-2.5">
                  <SignalBadge tone="ok">Audit complete</SignalBadge>
                  <span className="kicker">{result.tools.length} tools reviewed</span>
                  <span className="kicker">Created {createdOn}</span>
                  <span className="kicker">Slug {slug}</span>
                </div>
              </div>
              <div className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(170px,220px)_1fr] md:px-6 md:py-6">
                <EditorialCard className="flex min-h-[180px] flex-col items-center justify-center border-brand-borderStrong/75">
                  <span className="kicker mb-2">Stack grade</span>
                  <span
                    className="cond-display text-[5rem] leading-none md:text-[6.2rem]"
                    style={{ color: GRADE_COLOR[grade] ?? "var(--color-danger)" }}
                  >
                    {grade}
                  </span>
                  <p className="kicker mt-2 text-center text-[0.6rem]">
                    Based on spend efficiency and stack fit
                  </p>
                </EditorialCard>

                <div className="space-y-4">
                  <EditorialCard className="p-5 md:p-6">
                    <span className="kicker">Projected annual savings</span>
                    <div className="scanline mt-2 flex flex-wrap items-end gap-2">
                      <span className="mono-value text-[2.5rem] font-bold leading-none md:text-[3.7rem]">
                        <AnimatedCounter
                          value={result.totalAnnualSavings}
                          prefix="$"
                          suffix=""
                          className="tabular-nums"
                        />
                      </span>
                      <span className="serif-body pb-1 text-sm md:text-base">
                        per year
                      </span>
                    </div>
                  </EditorialCard>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricTile
                      label="Monthly savings"
                      value={formatCurrency(result.totalMonthlySavings)}
                    />
                    <MetricTile
                      label="Current monthly spend"
                      value={formatCurrency(result.totalCurrentMonthlyCost)}
                    />
                    <MetricTile
                      label="Tools audited"
                      value={`${result.tools.length}`}
                      helper="Scoped to this submitted stack"
                    />
                  </div>
                </div>
              </div>
            </FrameShell>
          </div>

          <section data-results-stage="cards" className="mb-6">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-brand-text">
                Ranked recommendations
              </h2>
              <span className="kicker">Sorted by monthly savings impact</span>
            </div>
            <div className="space-y-3">
              {ordered.map((tool, i) => (
                <ToolCard
                  key={`${tool.toolId}-${tool.currentPlan}`}
                  tool={tool}
                  rank={i + 1}
                />
              ))}
            </div>
          </section>

          <div data-results-stage="secondary" className="mb-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
            {result.stackScore && <StackScoreDisplay score={result.stackScore} />}
            {result.benchmarkComparison && (
              <BenchmarkPanel
                yourCpd={result.benchmarkComparison.yourCpdPerMonth}
                medianCpd={result.benchmarkComparison.medianCpdPerMonth}
                p75Cpd={result.benchmarkComparison.medianCpdPerMonth * 1.55}
                cohortLabel={result.benchmarkComparison.cohortLabel}
                verdict={result.benchmarkComparison.verdict}
              />
            )}
          </div>

          <div data-results-stage="secondary" className="mb-6">
            <WhatIfSimulator
              tools={result.tools}
              totalCurrentMonthly={result.totalCurrentMonthlyCost}
            />
          </div>

          <div data-results-stage="secondary" className="mb-6">
            <FrameShell>
              <div className="border-b border-brand-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <SignalBadge tone="neutral">Executive brief</SignalBadge>
                  <span className="kicker !text-brand-text">AI generated summary</span>
                </div>
              </div>
              <div className="px-5 py-6">
                <p className="serif-body text-base leading-relaxed">{summary}</p>
                <p className="kicker mt-3 text-[0.58rem]">
                  Generated by Groq &middot; May contain estimates &middot;
                  deterministic audit math underneath
                </p>
              </div>
            </FrameShell>
          </div>

          {result.totalMonthlySavings > 500 && (
            <div data-results-stage="secondary" className="mb-6">
              <FrameShell>
                <div className="border-b border-brand-border px-5 py-3">
                  <SignalBadge tone="warn">
                    Credex next step for high-savings teams
                  </SignalBadge>
                </div>
                <div className="px-5 py-6">
                  <p className="mb-2 text-2xl font-semibold tracking-tight text-brand-text">
                    Capture additional savings through credit sourcing
                  </p>
                  <p className="serif-body mb-6 text-sm leading-relaxed">
                    You are spending {formatCurrency(result.totalCurrentMonthlyCost)}
                    /mo on AI tools. Credex sources discounted credits from
                    companies that over-forecast, often 20-40% below retail.
                    Teams at your level usually uncover additional savings in one
                    short call.
                  </p>
                  <a
                    href="https://credex.rocks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-action pill-action-primary glow-accent"
                  >
                    Book free 20-min consultation
                  </a>
                </div>
              </FrameShell>
            </div>
          )}

          {result.savingsTier === "optimal" && (
            <div data-results-stage="secondary" className="mb-6">
              <FrameShell>
                <div className="px-5 py-6">
                  <SignalBadge tone="ok">Stack is well optimized</SignalBadge>
                  <p className="serif-body mt-3 text-sm">
                    No significant savings found for this configuration. Re-run
                    when your team grows, adds tools, or pricing shifts.
                  </p>
                </div>
              </FrameShell>
            </div>
          )}

          <div data-results-stage="secondary" className="mb-6 text-center">
            <Link
              href="/audit"
              className="kicker text-brand-muted transition hover:text-brand-textSub"
              style={{ fontSize: "0.65rem" }}
            >
              Run a new audit with different inputs -&gt;
            </Link>
          </div>

          <div data-results-stage="secondary">
            <EmailCaptureForm auditSlug={slug} />
          </div>
        </ResultsMotionShell>
      </main>
    </div>
  );
}
