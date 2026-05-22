import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AnimatedCounter } from "@/components/animated-counter";
import { Logo } from "@/components/logo";
import { EmailCaptureForm } from "@/components/results/email-capture-form";
import { ResultActions } from "@/components/results/result-actions";
import { getAuditBySlug } from "@/lib/audit-store";
import { formatCurrency } from "@/lib/format";
import { generateFallbackSummary } from "@/lib/summary";
import type { ToolAuditResult } from "@/types/audit";

interface ResultPageProps {
  params: Promise<{ slug: string }>;
}

/* Badge config */
const REC_CONFIG: Record<string, { label: string; short: string; cls: string }> = {
  downgrade: { label: "Downgrade plan",    short: "Downgrade", cls: "badge-downgrade" },
  switch:    { label: "Switch to cheaper", short: "Switch",    cls: "badge-switch" },
  righsize:  { label: "Right-size seats",  short: "Right-size",cls: "badge-righsize" },
  credits:   { label: "Credits deal",      short: "Credits",   cls: "badge-credits" },
  ok:        { label: "Optimized",         short: "Optimal",   cls: "badge-ok" },
};

const TOOL_EMOJI: Record<string, string> = {
  "cursor": "⌨️", "github-copilot": "🐙", "claude": "🟠", "chatgpt": "🟢",
  "anthropic-api": "🔶", "openai-api": "⚫", "gemini": "💎", "windsurf": "🌊",
};

function SavingsTierBadge({ tier }: { tier: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    high:    { label: "High savings found",     cls: "border-brand-danger/40 bg-brand-danger/10 text-brand-danger" },
    medium:  { label: "Savings found",          cls: "border-brand-warning/40 bg-brand-warning/10 text-brand-warning" },
    low:     { label: "Minor savings",          cls: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
    optimal: { label: "Stack optimized",        cls: "border-brand-accent/40 bg-brand-accent/10 text-brand-accent" },
  };
  const m = map[tier] ?? map.low;
  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}

function ToolCard({ tool }: { tool: ToolAuditResult }) {
  const rec = tool.bestRecommendation;
  const hasSavings = rec.monthlySavings > 0;
  const recConf = REC_CONFIG[rec.type] ?? REC_CONFIG.ok;
  const emoji = TOOL_EMOJI[tool.toolId] ?? "🔧";

  const borderClass = hasSavings
    ? rec.monthlySavings > 100 ? "border-l-brand-danger" : "border-l-brand-warning"
    : "border-l-brand-accent/40";

  return (
    <article className={`rounded-xl border border-brand-border bg-brand-surface border-l-4 ${borderClass} overflow-hidden`}>
      {/* Tool header */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-base font-semibold text-brand-text">{tool.toolName}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${recConf.cls}`}>
                {recConf.short}
              </span>
            </div>
            <p className="text-xs text-brand-muted">
              {tool.currentPlan} · {tool.seats} seat{tool.seats !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-lg font-bold text-brand-text">
            {formatCurrency(tool.currentMonthlyCost)}<span className="text-xs font-normal text-brand-muted">/mo</span>
          </p>
          {hasSavings && (
            <p className="font-mono text-xs text-brand-accent">
              save {formatCurrency(rec.monthlySavings)}/mo
            </p>
          )}
        </div>
      </div>

      {/* Recommendation box */}
      <div className={`mx-4 mb-4 rounded-lg border p-3.5 ${
        hasSavings
          ? "border-brand-warning/20 bg-brand-warning/5"
          : "border-brand-accent/20 bg-brand-accent/5"
      }`}>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
          Recommendation
        </p>
        <p className="text-sm leading-relaxed text-brand-text">{rec.reason}</p>
        {hasSavings && (
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-brand-muted">Monthly</p>
              <p className="font-mono text-sm font-bold text-brand-accent">
                {formatCurrency(rec.monthlySavings)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-brand-muted">Annual</p>
              <p className="font-mono text-sm font-bold text-brand-accent">
                {formatCurrency(rec.annualSavings)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-brand-muted">Confidence</p>
              <p className="text-xs font-semibold capitalize text-brand-textSub">{rec.confidence}</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { slug } = await params;
  const audit = await getAuditBySlug(slug);
  if (!audit) {
    return { title: "Audit not found | SpendLens", description: "This audit may have expired." };
  }
  return {
    title: `AI Spend Audit — Save $${audit.totalAnnualSavings}/yr | SpendLens`,
    description: `Found $${audit.totalMonthlySavings}/mo in optimization opportunities across ${audit.auditResult.tools.length} tools.`,
    openGraph: {
      title: `I could save $${audit.totalAnnualSavings}/year on AI tools`,
      description: `SpendLens audited my stack and found $${audit.totalMonthlySavings}/mo in savings.`,
      images: ["/og-image.svg"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit — $${audit.totalAnnualSavings}/yr savings found`,
      images: ["/og-image.svg"],
    },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { slug } = await params;
  const audit = await getAuditBySlug(slug);
  if (!audit) notFound();

  const result = audit.auditResult;
  const summary = audit.aiSummary || generateFallbackSummary(result, {
    teamSize: audit.teamSize,
    primaryUseCase: audit.primaryUseCase,
    tools: audit.tools,
  });

  return (
    <div className="min-h-screen bg-brand-bg bg-grid">
      {/* Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-accent/4 rounded-full blur-[120px]" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-brand-border bg-brand-bg/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <ResultActions slug={slug} />
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6">

        {/* ─── HERO SAVINGS ─── */}
        <div className="relative mb-10 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface p-8 sm:p-10">
          {/* Background radial */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-accent/5 blur-3xl" />

          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <SavingsTierBadge tier={result.savingsTier} />
              <span className="text-xs text-brand-muted">
                Based on {result.tools.length} tool{result.tools.length !== 1 ? "s" : ""} · {new Date(audit.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <p className="mb-1 font-mono text-xs uppercase tracking-widest text-brand-muted">You could save</p>

            <div className="flex flex-wrap items-end gap-6">
              <div className="scanline">
                <AnimatedCounter
                  value={result.totalAnnualSavings}
                  prefix="$"
                  suffix=""
                  className="block font-mono text-6xl font-bold text-brand-accent tabular-nums sm:text-7xl"
                />
                <p className="mt-1 font-mono text-lg text-brand-muted">/year</p>
              </div>
              <div className="flex flex-col gap-1 pb-1">
                <div className="rounded-lg border border-brand-border bg-brand-bg px-4 py-2">
                  <p className="text-[10px] text-brand-muted">Monthly savings</p>
                  <p className="font-mono text-xl font-bold text-brand-accent">{formatCurrency(result.totalMonthlySavings)}</p>
                </div>
                <div className="rounded-lg border border-brand-border bg-brand-bg px-4 py-2">
                  <p className="text-[10px] text-brand-muted">Current monthly spend</p>
                  <p className="font-mono text-xl font-bold text-brand-text">{formatCurrency(result.totalCurrentMonthlyCost)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── PER-TOOL BREAKDOWN ─── */}
        <div className="mb-10">
          <h2 className="mb-4 font-heading text-xl font-semibold">Tool-by-tool breakdown</h2>
          <div className="space-y-3">
            {result.tools
              .sort((a, b) => b.bestRecommendation.monthlySavings - a.bestRecommendation.monthlySavings)
              .map((tool) => (
                <ToolCard key={`${tool.toolId}-${tool.currentPlan}`} tool={tool} />
              ))}
          </div>
        </div>

        {/* ─── AI SUMMARY ─── */}
        <div className="mb-10 rounded-2xl border border-brand-border bg-brand-surface p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent/10 text-sm">🟠</span>
            <div>
              <h3 className="text-sm font-semibold text-brand-text">Personalized analysis</h3>
              <p className="text-[10px] text-brand-muted">Generated by Groq · May contain estimates based on audit data</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-brand-textSub">{summary}</p>
        </div>

        {/* ─── CREDEX CTA (conditional: >$500/mo savings) ─── */}
        {result.totalMonthlySavings > 500 && (
          <div className="relative mb-10 overflow-hidden rounded-2xl border border-brand-accent/40 bg-brand-surface p-6 sm:p-8">
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-brand-accent/10 blur-2xl" />
            <div className="relative">
              <p className="mb-1 font-mono text-xs uppercase tracking-widest text-brand-accent">Credex</p>
              <h3 className="mb-2 font-heading text-2xl font-bold text-brand-text">
                Capture even more savings
              </h3>
              <p className="mb-6 max-w-xl text-sm leading-relaxed text-brand-textSub">
                You&apos;re spending {formatCurrency(result.totalCurrentMonthlyCost)}/mo on AI tools.
                Credex sources discounted credits from companies that overforecast — typically
                20–40% below retail. For teams at your spend level, it&apos;s worth a 20-minute conversation.
              </p>
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-brand-bg transition glow-accent hover:bg-brand-accentDim"
              >
                Book a free 20-min consultation →
              </a>
            </div>
          </div>
        )}

        {/* ─── OPTIMAL STATE ─── */}
        {result.savingsTier === "optimal" && (
          <div className="mb-10 rounded-2xl border border-brand-accent/30 bg-brand-accent/5 p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-heading text-lg font-semibold text-brand-accent">You&apos;re spending well</h3>
                <p className="mt-1 text-sm leading-relaxed text-brand-textSub">
                  No significant savings found with your current stack. Re-run this audit when your team
                  grows, you add tools, or vendor pricing changes. We&apos;ll surface new opportunities automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── START OVER ─── */}
        <div className="mb-6 text-center">
          <Link
            href="/audit"
            className="text-xs text-brand-muted underline underline-offset-2 hover:text-brand-text transition-colors"
          >
            Run a new audit with different inputs →
          </Link>
        </div>

        {/* ─── EMAIL CAPTURE ─── */}
        <EmailCaptureForm auditSlug={slug} />
      </main>
    </div>
  );
}
